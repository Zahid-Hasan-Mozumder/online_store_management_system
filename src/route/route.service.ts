import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { RouteOrderDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RouteService {

    private apiKey: string;
    private baseUrl: string;
    private id: number;

    constructor(
        private httpService: HttpService,
        private config: ConfigService,
        private prisma: PrismaService
    ) {
        this.apiKey = this.config.get("ROUTE_SECRET")
        this.baseUrl = this.config.get("ROUTE_BASE_URL")
        this.id = this.config.get("ROUTE_ID")
    }

    async fetchOrder(uuid: string) {
        try {
            const url = `${this.baseUrl}/v1/orders/${uuid}`;
            const headers = {
                Authorization: `bearer ${this.apiKey}`,
                accept: "application/json"
            };
            const response = await firstValueFrom(
                this.httpService.get(url, { headers }).pipe(
                    catchError((error) => {
                        // console.dir(error.response.data, {depth: null});
                        throw new UnprocessableEntityException("Unable to process request");
                    })
                )
            )
            return response.data;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while fetching order")
        }
    }

    async processOrders() {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const url = `${this.baseUrl}/v1/orders?workspaceId=${this.id}`;
                const headers = {
                    Authorization: `bearer ${this.apiKey}`,
                    accept: "application/json",
                    "Content-Type": "application/json"
                };
                let body: RouteOrderDto[] = [];

                // Process or Posting orders
                const orders = await tx.orders.findMany({
                    include : {
                        placedOrder : true,
                        shippingAddress : true,
                        billingAddress : true
                    }
                });

                if(!orders.length){
                    throw new NotFoundException("No order found to process")
                }

                const client = await tx.clients.findUnique({
                    where : { id : orders[0].clientId }
                })

                for(let i = 0; i < orders.length; i++){
                    if(orders[i].placedOrder !== null) continue;

                    const shippingAddress = orders[i].shippingAddress;
                    const routeAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country} - ${shippingAddress.zipCode}`;

                    const routeOrder : RouteOrderDto = {
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
                        instructions: (orders[i].note) ? orders[i].note : "",
                        timeWindows: [],
                        customerOrderNumber: String(orders[i].id)
                    }

                    body.push(routeOrder);
                }

                const response = await firstValueFrom(
                    this.httpService.post(url, body, { headers }).pipe(
                        catchError((error) => {
                            // console.dir(error.response.data, {depth: null});
                            throw new UnprocessableEntityException("Unable to process orders");
                        })
                    )
                )

                // Saving the placed orders information into database
                let allPlacedOrders = [];
                for(let i = 0; i < response.data.length; i++){

                    const curRes = await this.fetchOrder(response.data[i].uuid);

                    for(let j = 0; j < curRes.timeWindows.length; j++){
                        await tx.timeWindows.create({
                            data : {
                                uuid : curRes.uuid,
                                startTime : curRes.timeWindows[j].startTime,
                                endTime : curRes.timeWindows[j].endTime
                            }
                        })
                    }
                    for(let j = 0; j < curRes.locations.length; j++){
                        await tx.locations.create({
                            data : {
                                uuid : curRes.uuid,
                                address : curRes.locations[j].address,
                                latitude : curRes.locations[j].latitude,
                                longitude : curRes.locations[j].longitude,
                                timezone : curRes.locations[j].timezone,
                                status : curRes.locations[j].status
                            }
                        })
                    }
                    const placedOrder = await tx.placedOrders.create({
                        data : {
                            uuid : curRes.uuid,
                            name : curRes.name,
                            email : curRes.email,
                            phone : curRes.phone,
                            instructions : curRes.instructions,
                            isScheduled : curRes.isScheduled,
                            isCompleted : curRes.isCompleted,
                            displayOrderId : curRes.displayOrderId,
                            routificOrderNumber : curRes.routificOrderNumber,
                            customerOrderNumber : Number(curRes.customerOrderNumber),
                            workspaceId : curRes.workspaceId,
                            status : curRes.status
                        }
                    })
                    allPlacedOrders.push(placedOrder);
                }
                
                return allPlacedOrders;
            })

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while processing orders")
        }
    }

    async updateOrders(){
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                let updatedPlacedOrders = [];
                const placedOrders = await tx.placedOrders.findMany();
                for(let i = 0; i < placedOrders.length; i++){
                    const curRes = await this.fetchOrder(placedOrders[i].uuid);

                    for(let j = 0; j < curRes.timeWindows.length; j++){
                        await tx.timeWindows.update({
                            where : { uuid : placedOrders[i].uuid},
                            data : {
                                startTime : curRes.timeWindows[j].startTime,
                                endTime : curRes.timeWindows[j].endTime
                            }
                        })
                    }
                    for(let j = 0; j < curRes.locations.length; j++){
                        await tx.locations.update({
                            where : { uuid : placedOrders[i].uuid},
                            data : {
                                address : curRes.locations[j].address,
                                latitude : curRes.locations[j].latitude,
                                longitude : curRes.locations[j].longitude,
                                timezone : curRes.locations[j].timezone,
                                status : curRes.locations[j].status
                            }
                        })
                    }
                    const updatedPlacedOrder = await tx.placedOrders.update({
                        where : { id : placedOrders[i].id },
                        data : {
                            name : curRes.name,
                            email : curRes.email,
                            phone : curRes.phone,
                            instructions : curRes.instructions,
                            isScheduled : curRes.isScheduled,
                            isCompleted : curRes.isCompleted,
                            displayOrderId : curRes.displayOrderId,
                            routificOrderNumber : curRes.routificOrderNumber,
                            status : curRes.status
                        }
                    })
                    updatedPlacedOrders.push(updatedPlacedOrder);
                }
                return updatedPlacedOrders;
            })
            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while processing orders")
        }
    }
}
