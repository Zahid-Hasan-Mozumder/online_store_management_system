import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AddProductInCollectionDto, CollectionDto, UpdateCollectionDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionService {

    constructor(private prisma: PrismaService) { }

    async createCollection(dto: CollectionDto) {

        try {

            const result = await this.prisma.$transaction(async (tx) => {

                const newCollection = await tx.collections.create({
                    data: {
                        name: dto.name
                    }
                })

                await tx.collectionCounts.update({
                    where: {
                        id: 1
                    },
                    data: {
                        count: {
                            increment: 1
                        }
                    }
                })

                return newCollection;
            })

            return result;

        } catch (error) {
            throw new InternalServerErrorException("An error occured while creating a collection");
        }
    }

    async addProductToCollection(id: number, dto: AddProductInCollectionDto) {
        await this.prisma.collectionsProducts.create({
            data: {
                collectionId: id,
                productId: dto.productId
            }
        })
        return "Product added to the collection";
    }

    async getAllCollections() {
        const allCollections = await this.prisma.collections.findMany();
        return allCollections;
    }

    async getTotalCollectionsCount() {
        const totalCollections = await this.prisma.collectionCounts.findUnique({
            where: {
                id: 1
            }
        })
        return totalCollections.count;
    }

    async getSpecificCollection(id: number) {
        const collection = await this.prisma.collections.findUnique({
            where: {
                id: id
            }
        })

        if (!collection) {
            throw new NotFoundException("Collection not found");
        }

        return collection;
    }

    async updateSpecificCollection(id: number, dto: UpdateCollectionDto) {
        const updatedCollection = await this.prisma.collections.update({
            where: {
                id: id
            },
            data: {
                name: dto.name
            }
        })
        return updatedCollection;
    }

    async deleteSpecificCollection(id: number) {

        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.collections.delete({
                    where: {
                        id: id
                    }
                })

                await tx.collectionCounts.update({
                    where: {
                        id: 1
                    },
                    data: {
                        count: {
                            decrement: 1
                        }
                    }
                })
            })

            return "Collection deleted successfully";
        } catch (error) {
            throw new InternalServerErrorException("An error occured while deleting the collection" + error.message);
        }


    }
}
