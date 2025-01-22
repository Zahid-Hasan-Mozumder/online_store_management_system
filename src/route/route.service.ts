import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
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

    getHeaders() {
        return {
            Authorization: `bearer ${this.apiKey}`,
            accept: "application/json",
            "Content-Type": "application/json"
        };
    }

    async fetchOrderFromRoutific(uuid: string) {
        const url = `${this.baseUrl}/v1/orders/${uuid}`;
        const headers = this.getHeaders();

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, { headers }).pipe(
                    catchError((error) => {
                        throw new UnprocessableEntityException("Unable to process request");
                    })
                )
            )
            return response.data;
        } catch (error) {
            throw (error instanceof HttpException) ? error : new InternalServerErrorException("An error occured while fetching order")
        }
    }

    private async getUnplacedOrdersFromDatabase() {
        try {
            const unplacedOrders = await this.prisma.orders.findMany({
                where: { isPlaced: false },
                include: {
                    client: true,
                    shippingAddress: true
                }
            });
            return unplacedOrders;
        } catch (error) {
            throw new InternalServerErrorException("Unable to get unplaced orders from database");
        }
    }

    private async createRoutificOrderDto(unplacedOrder: any) {
        try {
            const shippingAddress = unplacedOrder.shippingAddress;
            const routeAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country} - ${shippingAddress.zipCode}`;
            const routeOrderDto: RouteOrderDto = {
                name: "OSMS",
                locations: [{ address: routeAddress }],
                phone: shippingAddress.contactNo,
                email: unplacedOrder.client.email,
                duration: 600,
                load: 1,
                instructions: unplacedOrder.note || "",
                timeWindows: [],
                customerOrderNumber: String(unplacedOrder.id)
            }
            return routeOrderDto;
        } catch (error) {
            throw new UnprocessableEntityException("Error while creating DTO for routing order")
        }
    }

    private async savePlacedOrderDataInDatabase(orderData: any) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
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
            })
            return result;
        } catch (error) {
            throw new InternalServerErrorException("Error while saving placed order's information in the database")
        }
    }

    private async updateOrderDataInDatabase(orderData: any) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
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
            })
            return result;
        } catch (error) {
            throw new InternalServerErrorException("Error while updating placed order's information in the database")
        }
    }

    async getNonUpdatedPlacedOrdersFromDatabase() {
        try {
            const nonUpdatedPlacedOrders = await this.prisma.placedOrders.findMany({
                where: {
                    status: {
                        in: [PlacedOrderStatus.scheduled, PlacedOrderStatus.notScheduled]
                    }
                }
            })
            return nonUpdatedPlacedOrders;
        } catch (error) {
            throw new InternalServerErrorException("Error while fetching non updated placed orders from database");
        }
    }

    async processOrders() {
        const url = `${this.baseUrl}/v1/orders?workspaceId=${this.id}`;
        const headers = this.getHeaders();

        // Fetching unplaced orders from database
        const unplacedOrders = await this.getUnplacedOrdersFromDatabase();

        // Structuring body to be processed
        const body = await Promise.all(
            unplacedOrders.map(unplacedOrder => this.createRoutificOrderDto(unplacedOrder))
        )

        // Posting unplaced orders for routing
        const response = await firstValueFrom(
            this.httpService.post(url, body, { headers }).pipe(
                catchError((error) => {
                    throw new UnprocessableEntityException("Unable to process orders");
                })
            )
        )

        // Fetch orders froms Routific
        const placedOrders = await Promise.allSettled(
            response.data.map(placedOrder => this.fetchOrderFromRoutific(placedOrder.uuid))
        )
        const successfullyPlacedOrders = placedOrders.filter(result => result.status === "fulfilled").map(result => result.value)

        // Save successfully placed orders in database
        const savedPlacedOrders = await Promise.allSettled(
            successfullyPlacedOrders.map(placedOrder => this.savePlacedOrderDataInDatabase(placedOrder))
        )
        const successfullySavedPlacedOrders  = savedPlacedOrders.filter(result => result.status === "fulfilled").map(result => result.value)

        return successfullySavedPlacedOrders;
    }

    async updatePlacedOrdersStatus() {

        // Fetching non updated placed orders from database
        const nonUpdatedPlacedOrders = await this.getNonUpdatedPlacedOrdersFromDatabase();

        // Fetch orders froms Routific
        const placedOrders = await Promise.allSettled(
            nonUpdatedPlacedOrders.map(placedOrder => this.fetchOrderFromRoutific(placedOrder.uuid))
        )
        const successfullyPlacedOrders = placedOrders.filter(result => result.status === "fulfilled").map(result => result.value)

        // Update successfully placed orders in database
        const updatedPlacedOrders = await Promise.allSettled(
            successfullyPlacedOrders.map(placedOrder => this.updateOrderDataInDatabase(placedOrder))
        )
        const successfullyUpdatedPlacedOrders  = updatedPlacedOrders.filter(result => result.status === "fulfilled").map(result => result.value)

        return successfullyUpdatedPlacedOrders;
    }
}
