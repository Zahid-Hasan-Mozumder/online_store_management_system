import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto, CartDeleteDto, CartDto, CartUpdateDto, ClientDto, RemoveFromCartDto } from './dto';
import { ClientStatus } from './enum';

@Injectable()
export class CartService {
    
    constructor(private prisma : PrismaService) {}

    async createCart(dto : CartDto) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                let desiredClient = await tx.clients.findUnique({
                    where : { email : dto.email }
                })
                if(!desiredClient){
                    desiredClient = await tx.clients.create({
                        data : {
                            email : dto.email,
                            status : ClientStatus.inactive
                        }
                    })
                }
                delete desiredClient.password;

                const newCart = await tx.carts.create({
                    data : {
                        clientId : desiredClient.id,
                        note : dto.note,
                    }
                })

                for(let i = 0; i < dto.cartLineItems.length; i++) {
                    const currentProduct = await tx.products.findUnique({
                        where : { id : dto.cartLineItems[i].productId },
                        include : { varients : true }
                    });
                    if(!currentProduct) {
                        throw new NotFoundException("An required product is not found");
                    }
                    await tx.cartLineItems.create({
                        data : {
                            productId : dto.cartLineItems[i].productId,
                            varientId : (dto.cartLineItems[i].varientId && currentProduct.varients.some(item => item.id === dto.cartLineItems[i].varientId)) ? dto.cartLineItems[i].varientId : currentProduct.varients[0].id,
                            cartId : newCart.id,
                            vendor : currentProduct.vendor,
                            quantity : (dto.cartLineItems[i].quantity) ? dto.cartLineItems[i].quantity : 1
                        }
                    })
                }

                const createdCart = await tx.carts.findUnique({
                    where : { id : newCart.id },
                    include : { lineItems : true }
                })

                return createdCart;
            })
            
            return result;
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while creating the cart");
        }
    }

    async addToCart(dto : AddToCartDto) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const currentProduct = await tx.products.findUnique({
                    where : { id : dto.productId },
                    include : { varients : true } 
                })
                if(!currentProduct) {
                    throw new NotFoundException("Desired product is not found");
                }
                const currentCart = await tx.carts.findUnique({
                    where : { id : dto.cartId }
                })
                if(!currentCart) {
                    throw new NotFoundException("Desired cart is not found");
                }
                const newLineItem = await this.prisma.cartLineItems.create({
                    data : {
                        productId : currentProduct.id,
                        varientId : (dto.varientId && currentProduct.varients.some(item => item.id === dto.varientId)) ? dto.varientId : currentProduct.varients[0].id,
                        cartId : currentCart.id,
                        vendor : currentProduct.vendor,
                        quantity : dto.quantity
                    }
                })
                return newLineItem;
            })
            return result;
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while adding to the cart");
        }
    }

    async removeFromCart(dto : RemoveFromCartDto){
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const lineItem = await tx.cartLineItems.findUnique({
                    where : { id : dto.lineItemId }
                })
                if(lineItem.quantity <= dto.decrement){
                    await tx.cartLineItems.delete({
                        where : { id : dto.lineItemId }
                    })
                    return "Item has been removed";
                }
                else{
                    const updatedItem = await tx.cartLineItems.update({
                        where : { id : dto.lineItemId },
                        data : { quantity : { decrement : dto.decrement } }
                    })
                    return updatedItem;
                }
            })
            return result;
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while removing from the cart");
        }
    }

    async getCart(user : ClientDto){
        const client = await this.prisma.clients.findUnique({
            where : { id : user.id },
            include : { carts : true }
        })
        return client.carts[client.carts.length - 1];
    }

    async updateCart(user : ClientDto, dto : CartUpdateDto) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {

                await tx.carts.update({
                    where : { id : dto.cartId },
                    data : {
                        note : dto.note
                    }
                })
                
                const updatedCart = await tx.carts.findUnique({
                    where : { id : dto.cartId },
                    include : { lineItems : true }
                })

                for(let i = 0; i < updatedCart.lineItems.length; i++){
                    await tx.cartLineItems.delete({
                        where : {id : updatedCart.lineItems[i].id }
                    })
                }

                for(let i = 0; i < dto.cartLineItems.length; i++) {
                    const currentProduct = await tx.products.findUnique({
                        where : { id : dto.cartLineItems[i].productId },
                        include : { varients : true }
                    });
                    if(!currentProduct) {
                        throw new NotFoundException("An required product is not found");
                    }
                    await tx.cartLineItems.create({
                        data : {
                            productId : dto.cartLineItems[i].productId,
                            varientId : (dto.cartLineItems[i].varientId && currentProduct.varients.some(item => item.id === dto.cartLineItems[i].varientId)) ? dto.cartLineItems[i].varientId : currentProduct.varients[0].id,
                            cartId : updatedCart.id,
                            vendor : currentProduct.vendor,
                            quantity : (dto.cartLineItems[i].quantity) ? dto.cartLineItems[i].quantity : 1
                        }
                    })
                }

                const mainUpdatedCart = await tx.carts.findUnique({
                    where : { id : updatedCart.id },
                    include : { lineItems : true }
                })

                return mainUpdatedCart;
            })
            
            return result;
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while creating the cart");
        }
    }

    async deleteCart(user : ClientDto, dto : CartDeleteDto){
        await this.prisma.carts.delete({
            where : { id : dto.cartId }
        })
        return "Cart deleted successfully";
    }
}
