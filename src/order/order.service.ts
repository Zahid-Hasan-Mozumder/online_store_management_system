import { HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ClientDto } from 'src/cart/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderUpdateDto } from './dto/order.dto';
import { RouteOrderDto } from 'src/route/dto';
import { RouteService } from 'src/route/route.service';

@Injectable()
export class OrderService {

    constructor(
        private prisma : PrismaService,
        private routeService : RouteService
    ) {}

    async updateOrder(user : ClientDto, dto : OrderUpdateDto) {
        try {
            const response = await this.prisma.$transaction(async (tx) => {
                const client = await tx.clients.findUnique({
                    where : { id : user.id },
                    include : { orders : true }
                })

                if(!client.orders.some(item => item.id === dto.orderId)){
                    throw new UnauthorizedException("You are not authorize to make changes to this order");
                }

                const order = await tx.orders.update({
                    where : { id : dto.orderId },
                    data : {
                        note : dto.note,
                        status : dto.status
                    },
                    include : {
                        shippingAddress : true,
                        billingAddress : true
                    }
                })

                for(let i = 0; dto.orderLineItems && i < dto.orderLineItems.length; i++){
                    await tx.orderLineItems.update({
                        where : { id : dto.orderLineItems[i].lineItemId },
                        data : { quantity : dto.orderLineItems[i].quantity }
                    })
                }

                const shippingAddress = await tx.shippingAddress.update({
                    where : { id : order.shippingAddress[0].id},
                    data : {
                        firstName : dto.shippingAddress.firstName,
                        lastName : dto.shippingAddress.lastName,
                        address : dto.shippingAddress.address,
                        city : dto.shippingAddress.city,
                        country : dto.shippingAddress.country,
                        zipCode : dto.shippingAddress.zipCode,
                        contactNo : dto.shippingAddress.contactNo
                    }
                })

                await tx.billingAddress.update({
                    where : { id : order.billingAddress[0].id},
                    data : {
                        firstName : dto.billingAddress.firstName,
                        lastName : dto.billingAddress.lastName,
                        address : dto.billingAddress.address,
                        city : dto.billingAddress.city,
                        country : dto.billingAddress.country,
                        zipCode : dto.billingAddress.zipCode,
                        contactNo : dto.billingAddress.contactNo
                    }
                })

                const routeAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country} - ${shippingAddress.zipCode}`;

                const updatedRouteOrder : RouteOrderDto = {
                    name: "OSMS",
                    locations: [
                        {
                            address: routeAddress
                        }
                    ],
                    phone: shippingAddress.contactNo,
                    email: client.email,
                    duration: 0,
                    load: 1,
                    instructions: (order.note) ? order.note : "",
                    timeWindows: [],
                    customerOrderNumber: String(order.id)
                }

                // const placedOrder = await tx.placedOrders.findUnique({
                //     where : { customerOrderNumber : order.id.toString() }
                // })
                // const response = await this.routeService.updateOrder(placedOrder.uuid, updatedRouteOrder);
                
            })
        } catch (error) {
            if(error instanceof HttpException){
                throw error;
            }
            throw new InternalServerErrorException("An error occured while modifying the order");
        }
    }
}
