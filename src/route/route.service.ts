import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { RouteOrderDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlacedOrderStatus } from './enum';

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

    private async getUnplacedOrders() {
        const orders = await this.prisma.orders.findMany({
            where: { isPlaced: false },
            include: {
                shippingAddress: true
            }
        });
        return orders;
    }

    private async createRouteOrders(unplacedOrder: any) {
        const client = await this.prisma.clients.findUnique({
            where: { id: unplacedOrder.clientId }
        })

        const shippingAddress = unplacedOrder.shippingAddress;
        const routeAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country} - ${shippingAddress.zipCode}`;

        const routeOrder: RouteOrderDto = {
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
            instructions: unplacedOrder.note || "",
            timeWindows: [],
            customerOrderNumber: String(unplacedOrder.id)
        }

        return routeOrder;
    }

    private async saveOrderData(orderData: any) {
        // Save time windows
        await Promise.all(orderData.timeWindows.map(window =>
            this.prisma.timeWindows.create({
                data: {
                    uuid: orderData.uuid,
                    startTime: window.startTime,
                    endTime: window.endTime
                }
            })
        ));

        // Save locations
        await Promise.all(orderData.locations.map(location =>
            this.prisma.locations.create({
                data: {
                    uuid: orderData.uuid,
                    address: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: location.timezone,
                    status: location.status
                }
            })
        ));

        // Create placed order
        const placedOrder = await this.prisma.placedOrders.create({
            data: {
                uuid: orderData.uuid,
                name: orderData.name,
                email: orderData.email,
                phone: orderData.phone,
                instructions: orderData.instructions,
                isScheduled: orderData.isScheduled,
                isCompleted: orderData.isCompleted,
                displayOrderId: orderData.displayOrderId,
                routificOrderNumber: orderData.routificOrderNumber,
                customerOrderNumber: Number(orderData.customerOrderNumber),
                workspaceId: orderData.workspaceId,
                status: orderData.status
            }
        });

        // Update original order
        await this.prisma.orders.update({
            where: { id: Number(orderData.customerOrderNumber) },
            data: { isPlaced: true }
        });

        return placedOrder;
    }

    private async updateOrderData(orderData: any) {
        // Update time windows
        await Promise.all(orderData.timeWindows.map(window =>
            this.prisma.timeWindows.update({
                where: { uuid: orderData.uuid },
                data: {
                    startTime: window.startTime,
                    endTime: window.endTime
                }
            })
        ));

        // Update locations
        await Promise.all(orderData.locations.map(location =>
            this.prisma.locations.update({
                where: { uuid: orderData.uuid },
                data: {
                    address: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: location.timezone,
                    status: location.status
                }
            })
        ));

        // Update placed order
        const placedOrder = await this.prisma.placedOrders.update({
            where: { customerOrderNumber: Number(orderData.customerOrderNumber) },
            data: {
                name: orderData.name,
                email: orderData.email,
                phone: orderData.phone,
                instructions: orderData.instructions,
                isScheduled: orderData.isScheduled,
                isCompleted: orderData.isCompleted,
                displayOrderId: orderData.displayOrderId,
                routificOrderNumber: orderData.routificOrderNumber,
                status: orderData.status
            }
        });

        return placedOrder;
    }

    async getNonUpdatedPlacedOrders() {
        const nonUpdatedPlacedOrders = await this.prisma.placedOrders.findMany({
            where: {
                status: {
                    in: [PlacedOrderStatus.scheduled, PlacedOrderStatus.notScheduled]
                }
            }
        })
        return nonUpdatedPlacedOrders;
    }

    async processOrders() {
        try {

            const url = `${this.baseUrl}/v1/orders?workspaceId=${this.id}`;
            const headers = {
                Authorization: `bearer ${this.apiKey}`,
                accept: "application/json",
                "Content-Type": "application/json"
            };

            // Fetching unprocessed orders
            const unplacedOrders = await this.getUnplacedOrders()

            const body = await Promise.all(
                unplacedOrders.map(unplacedOrder => this.createRouteOrders(unplacedOrder))
            )

            // Posting unplaced orders for routing
            const response = await firstValueFrom(
                this.httpService.post(url, body, { headers }).pipe(
                    catchError((error) => {
                        // console.dir(error.response.data, {depth: null});
                        throw new UnprocessableEntityException("Unable to process orders");
                    })
                )
            )

            // Saving the routed orders information into database
            const placedOrders = await Promise.allSettled(
                response.data.map(async (orderData) => {
                    try {
                        const curRes = await this.fetchOrder(orderData.uuid);
                        console.log(curRes);
                        return this.saveOrderData(curRes);
                    } catch (error) {
                        console.log(`Error while saving placed order's information in the database ${orderData.uuid}`);
                    }
                })
            );
            const successfulPlacedOrders = placedOrders.filter(result => result.status === "fulfilled").map(result => result.value);
            return successfulPlacedOrders;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while processing orders")
        }
    }

    async updatePlacedOrdersStatus() {

        const nonUpdatedPlacedOrders = await this.getNonUpdatedPlacedOrders();

        try {
            // Updating the routed orders information into database
            const updatedPlacedOrders = await Promise.allSettled(
                nonUpdatedPlacedOrders.map(async (orderData) => {
                    try {
                        const curRes = await this.fetchOrder(orderData.uuid);
                        return this.updateOrderData(curRes);
                    } catch (error) {
                        console.log(`Error while saving updating order's information in the database ${orderData.uuid}`);
                    }
                })
            );
            return updatedPlacedOrders;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while updating orders")
        }
    }
}
