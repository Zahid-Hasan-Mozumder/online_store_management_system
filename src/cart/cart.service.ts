import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto, CartCheckoutDto, CartDeleteDto, CartDto, CartUpdateDto, ClientDto, RemoveFromCartDto } from './dto';
import { CartStatus, ClientStatus, OrderStatus } from './enum';
import { RouteService } from '../route/route.service';
import { RouteOrderDto } from 'src/route/dto';

@Injectable()
export class CartService {

    constructor(private prisma: PrismaService) { }

    async createCart(dto: CartDto) {

        // Check whether their exist a client with this email
        // If not then create a initial one with inactive status
        let desiredClient = await this.prisma.clients.findUnique({
            where: { email: dto.email }
        })
        if (!desiredClient) {
            desiredClient = await this.prisma.clients.create({
                data: {
                    email: dto.email,
                    status: ClientStatus.inactive
                }
            })
            const clientAddress = await this.prisma.clientAddress.create({
                data: {
                    clientId: desiredClient.id,
                    address: null,
                    city: null,
                    country: null,
                    zipCode: null,
                    contactNo: null
                }
            })
        }
        delete desiredClient.password;

        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // Creating a new cart to the database
                const newCart = await tx.carts.create({
                    data: {
                        clientId: desiredClient.id,
                        note: dto.note,
                        status: CartStatus.active
                    }
                })

                // Adding all the line items to the database 
                for (let i = 0; i < dto.cartLineItems.length; i++) {
                    const currentProduct = await tx.products.findUnique({
                        where: { id: dto.cartLineItems[i].productId },
                        include: { varients: true }
                    });
                    if (!currentProduct) {
                        throw new NotFoundException("An required product is not found");
                    }
                    await tx.cartLineItems.create({
                        data: {
                            productId: dto.cartLineItems[i].productId,
                            varientId: (dto.cartLineItems[i].varientId && currentProduct.varients.some(item => item.id === dto.cartLineItems[i].varientId)) ? dto.cartLineItems[i].varientId : currentProduct.varients[0].id,
                            cartId: newCart.id,
                            vendor: currentProduct.vendor,
                            quantity: (dto.cartLineItems[i].quantity) ? dto.cartLineItems[i].quantity : 1
                        }
                    })
                }

                // Fetching the newly created cart from the database
                const createdCart = await tx.carts.findUnique({
                    where: { id: newCart.id },
                    include: { lineItems: true }
                })
                return createdCart;
            })
            return result;
        } catch (error) {
            throw error instanceof HttpException ? error : new InternalServerErrorException("An error occured while creating the cart");
        }
    }

    async addToCart(dto: AddToCartDto) {
        const currentProduct = await this.prisma.products.findUnique({
            where: { id: dto.productId },
            include: { varients: true }
        })
        if (!currentProduct) {
            throw new NotFoundException("Desired product is not found");
        }
        const currentCart = await this.prisma.carts.findUnique({
            where: { id: dto.cartId }
        })
        if (!currentCart) {
            throw new NotFoundException("Desired cart is not found");
        }
        const newLineItem = await this.prisma.cartLineItems.create({
            data: {
                productId: currentProduct.id,
                varientId: (dto.varientId && currentProduct.varients.some(item => item.id === dto.varientId)) ? dto.varientId : currentProduct.varients[0].id,
                cartId: currentCart.id,
                vendor: currentProduct.vendor,
                quantity: dto.quantity
            }
        })
        return newLineItem;
    }

    async removeFromCart(dto: RemoveFromCartDto) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const lineItem = await tx.cartLineItems.findUnique({
                    where: { id: dto.lineItemId }
                })
                if (lineItem.quantity <= dto.decrement) {
                    await tx.cartLineItems.delete({
                        where: { id: dto.lineItemId }
                    })
                    return "Item has been removed";
                }
                else {
                    const updatedItem = await tx.cartLineItems.update({
                        where: { id: dto.lineItemId },
                        data: { quantity: { decrement: dto.decrement } }
                    })
                    return updatedItem;
                }
            })
            return result;
        } catch (error) {
            throw error instanceof HttpException ? error : new InternalServerErrorException("An error occured while removing from the cart");
        }
    }

    async checkoutCart(dto: CartCheckoutDto) {
        // Fetching cart from the database
        const cart = await this.prisma.carts.findUnique({
            where: { id: dto.cartId },
            include: { lineItems: true }
        })

        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // Saving new order in the database
                const newOrder = await tx.orders.create({
                    data: {
                        clientId: cart.clientId,
                        note: cart.note,
                        status: OrderStatus.on
                    }
                })

                // Saving the line items with their updated price
                let totalPrice: number = 0;
                for (let i = 0; i < cart.lineItems.length; i++) {
                    const varient = await tx.varients.findUnique({
                        where: { id: cart.lineItems[i].varientId }
                    })
                    const orderLineItem = await tx.orderLineItems.create({
                        data: {
                            productId: cart.lineItems[i].productId,
                            varientId: varient.id,
                            orderId: newOrder.id,
                            vendor: cart.lineItems[i].vendor || "",
                            quantity: cart.lineItems[i].quantity,
                            ppp: varient.price,
                            tpp: (cart.lineItems[i].quantity * varient.price)
                        }
                    })
                    totalPrice += orderLineItem.tpp;
                }

                // Saving the shipping address for the order
                await tx.shippingAddress.create({
                    data: {
                        orderId: newOrder.id,
                        firstName: dto.shippingAddress.firstName,
                        lastName: dto.shippingAddress.lastName,
                        address: dto.shippingAddress.address,
                        city: dto.shippingAddress.city,
                        country: dto.shippingAddress.country,
                        zipCode: dto.shippingAddress.zipCode,
                        contactNo: dto.shippingAddress.contactNo
                    }
                })

                // Saving the billing address for the order
                await tx.billingAddress.create({
                    data: {
                        orderId: newOrder.id,
                        firstName: dto.billingAddress.firstName,
                        lastName: dto.billingAddress.lastName,
                        address: dto.billingAddress.address,
                        city: dto.billingAddress.city,
                        country: dto.billingAddress.country,
                        zipCode: dto.billingAddress.zipCode,
                        contactNo: dto.billingAddress.contactNo
                    }
                })

                // Updating the total price of the newly created order
                const updatedOrder = await tx.orders.update({
                    where: { id: newOrder.id },
                    data: { totalPrice: totalPrice },
                    include: {
                        lineItems: true,
                        shippingAddress: true,
                        billingAddress: true
                    }
                })

                // Updating the cart status as inactive
                await tx.carts.update({
                    where: { id: dto.cartId },
                    data: { status: CartStatus.inactive }
                })
                return updatedOrder;
            })
            return result;
        } catch (error) {
            throw error instanceof HttpException ? error : new InternalServerErrorException("An error occured while checking out the cart");
        }
    }

    async getCart(user: ClientDto) {
        const client = await this.prisma.clients.findUnique({
            where: { id: user.id },
            include: { carts: true }
        })
        if (!client.carts[client.carts.length - 1] || client.carts[client.carts.length - 1].status === CartStatus.inactive) {
            throw new NotFoundException("No carts to show");
        }
        const cart = await this.prisma.carts.findUnique({
            where: { id: client.carts[client.carts.length - 1].id },
            include: { lineItems: true }
        })
        return cart;
    }

    async updateCart(user: ClientDto, dto: CartUpdateDto) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {

                const updatedCart = await tx.carts.update({
                    where: { id: dto.cartId },
                    data: {
                        note: dto.note,
                        status: dto.status
                    },
                    include: { lineItems: true }
                })

                for (let i = 0; i < updatedCart.lineItems.length; i++) {
                    await tx.cartLineItems.delete({
                        where: { id: updatedCart.lineItems[i].id }
                    })
                }

                for (let i = 0; dto.cartLineItems && (i < dto.cartLineItems.length); i++) {
                    const currentProduct = await tx.products.findUnique({
                        where: { id: dto.cartLineItems[i].productId },
                        include: { varients: true }
                    });
                    if (!currentProduct) {
                        throw new NotFoundException("An required product is not found");
                    }
                    await tx.cartLineItems.create({
                        data: {
                            productId: dto.cartLineItems[i].productId,
                            varientId: (dto.cartLineItems[i].varientId && currentProduct.varients.some(item => item.id === dto.cartLineItems[i].varientId)) ? dto.cartLineItems[i].varientId : currentProduct.varients[0].id,
                            cartId: updatedCart.id,
                            vendor: currentProduct.vendor,
                            quantity: (dto.cartLineItems[i].quantity) ? dto.cartLineItems[i].quantity : 1
                        }
                    })
                }

                const mainUpdatedCart = await tx.carts.findUnique({
                    where: { id: updatedCart.id },
                    include: { lineItems: true }
                })

                return mainUpdatedCart;
            })

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while creating the cart");
        }
    }

    async deleteCart(user: ClientDto, dto: CartDeleteDto) {
        await this.prisma.carts.delete({
            where: { id: dto.cartId }
        })
        return "Cart deleted successfully";
    }
}
