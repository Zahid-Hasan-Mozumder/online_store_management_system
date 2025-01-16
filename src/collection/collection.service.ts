import { Injectable, NotFoundException } from '@nestjs/common';
import { AddProductInCollectionDto, CollectionDto, UpdateCollectionDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionService {

    constructor(private prisma : PrismaService) {}

    async createCollection(dto : CollectionDto) {
        const newCollection = await this.prisma.collections.create({
            data : {
                name : dto.name
            }
        })

        await this.prisma.collectionCounts.update({
            where : {
                id : 1
            },
            data : {
                count : {
                    increment : 1
                }
            }
        })

        return newCollection;
    }

    async addProductToCollection(id : number, dto : AddProductInCollectionDto){
        await this.prisma.collectionsProducts.create({
            data : {
                collectionId : id,
                productId : dto.productId
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
            where : {
                id : 1
            }
        })
        return totalCollections.count;
    }

    async getSpecificCollection(id : number) {
        const collection = await this.prisma.collections.findUnique({
            where : {
                id : id
            }
        })

        if(!collection){
            throw new NotFoundException("Collection not found");
        }

        return collection;
    }

    async updateSpecificCollection(id : number, dto : UpdateCollectionDto) {
        const updatedCollection = await this.prisma.collections.update({
            where : {
                id : id
            },
            data : {
                name : dto.name
            }
        })
        return updatedCollection;
    }

    async deleteSpecificCollection(id : number) {
        await this.prisma.collections.delete({
            where : {
                id : id
            }
        })

        await this.prisma.collectionCounts.update({
            where : {
                id : id
            },
            data: {
                count : {
                    decrement : 1
                }
            }
        })

        return "Collection deleted successfully";
    }
}
