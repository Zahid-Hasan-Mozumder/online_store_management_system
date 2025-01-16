import { Injectable, NotFoundException } from '@nestjs/common';
import { AddProductInTagDto, TagDto, UpdateTagDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagService {

    constructor(private prisma : PrismaService) {}

    async createTag(dto : TagDto) {
        const newTag = await this.prisma.tags.create({
            data : {
                name : dto.name
            }
        })

        await this.prisma.tagCounts.update({
            where : {
                id : 1
            },
            data : {
                count : {
                    increment : 1
                }
            }
        })

        return newTag;
    }

    async addProductToTag(id : number, dto : AddProductInTagDto){
        await this.prisma.tagsProducts.create({
            data : {
                tagId : id,
                productId : dto.productId
            }
        })
        return "Product added to the Tag";
    }

    async getAllTags() {
        const allTags = await this.prisma.tags.findMany();
        return allTags;
    }

    async getTotalTagsCount() {
        const totalTags = await this.prisma.tagCounts.findUnique({
            where : {
                id : 1
            }
        })
        return totalTags.count;
    }

    async getSpecificTag(id : number) {
        const Tag = await this.prisma.tags.findUnique({
            where : {
                id : id
            }
        })

        if(!Tag){
            throw new NotFoundException("Tag not found");
        }

        return Tag;
    }

    async updateSpecificTag(id : number, dto : UpdateTagDto) {
        const updatedTag = await this.prisma.tags.update({
            where : {
                id : id
            },
            data : {
                name : dto.name
            }
        })
        return updatedTag;
    }

    async deleteSpecificTag(id : number) {
        await this.prisma.tags.delete({
            where : {
                id : id
            }
        })

        await this.prisma.tagCounts.update({
            where : {
                id : id
            },
            data: {
                count : {
                    decrement : 1
                }
            }
        })

        return "Tag deleted successfully";
    }
}
