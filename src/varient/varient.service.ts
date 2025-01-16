import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VarientsDto } from 'src/product/dto';

@Injectable()
export class VarientService {

    constructor(private prisma: PrismaService) { }

    async createVarient(productId: number, dto: VarientsDto) {

        // Check whether none of the option value is provided
        if (!dto.option1 && !dto.option2 && !dto.option3) {
            throw new UnprocessableEntityException("Varient can't be created with blank option values");
        }

        // Fetching the product from the database
        const product = await this.prisma.products.findUnique({
            where: {
                id: productId
            },
            include: {
                options: true,
                varients: true
            }
        })

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        // Checking whether values are provided for undeclared options
        if (dto.option1 && (product.options.length < 1)) {
            throw new UnprocessableEntityException("Varient can't have values for blank options");
        }
        if (dto.option2 && (product.options.length < 2)) {
            throw new UnprocessableEntityException("Varient can't have values for blank options");
        }
        if (dto.option3 && (product.options.length < 3)) {
            throw new UnprocessableEntityException("Varient can't have values for blank options");
        }

        const uniqueCombination = new Set<string>();
        for (let i = 0; i < product.varients.length; i++) {
            uniqueCombination.add(JSON.stringify([product.varients[i].option1, product.varients[i].option2, product.varients[i].option3]));
        }

        if (uniqueCombination.has(JSON.stringify([dto.option1, dto.option2, dto.option3]))) {
            throw new ConflictException("Varient already exist with these options");
        }

        // Updating the unique values for options
        const uniqueOption1 = new Set<string>();
        const uniqueOption2 = new Set<string>();
        const uniqueOption3 = new Set<string>();

        for (let i = 0; i < product.varients.length; i++) {
            uniqueOption1.add(product.varients[i].option1);
            uniqueOption2.add(product.varients[i].option2);
            uniqueOption3.add(product.varients[i].option3);
        }

        if (dto.option1) uniqueOption1.add(dto.option1);
        if (dto.option2) uniqueOption2.add(dto.option2);
        if (dto.option3) uniqueOption3.add(dto.option3);

        let uniqueArray1 = [...uniqueOption1];
        let uniqueArray2 = [...uniqueOption2];
        let uniqueArray3 = [...uniqueOption3];

        if (product.options.length >= 1) {
            await this.prisma.options.update({
                where: {
                    id: product.options[0].id
                },
                data: {
                    values: uniqueArray1
                }
            })
        }
        if (product.options.length >= 2) {
            await this.prisma.options.update({
                where: {
                    id: product.options[1].id
                },
                data: {
                    values: uniqueArray2
                }
            })
        }
        if (product.options.length >= 3) {
            await this.prisma.options.update({
                where: {
                    id: product.options[2].id
                },
                data: {
                    values: uniqueArray3
                }
            })
        }

        // Creating the varient
        const varient = await this.prisma.varients.create({
            data: {
                title: dto.title,
                option1: dto.option1,
                option2: dto.option2,
                option3: dto.option3,
                price: (dto.price) ? dto.price : product.price,
                comparePrice: (dto.comparePrice) ? dto.comparePrice : product.comparePrice,
                productId: product.id
            }
        })

        return varient;
    }

    async getAllVarients(productId: number) {
        const product = await this.prisma.products.findUnique({
            where: {
                id: productId
            },
            include: {
                varients: true
            }
        })
        return product.varients;
    }

    async getSpecificVarient(id: number) {
        const varient = await this.prisma.varients.findUnique({
            where: {
                id: id
            }
        })
        if (!varient) {
            throw new NotFoundException("Varient not found")
        }
        return varient;
    }

    async updateSpecificVarient(productId: number, id: number, dto: VarientsDto) {

        // Fetching the product from the database
        const product = await this.prisma.products.findUnique({
            where: {
                id: productId
            },
            include: {
                options: true,
                varients: true
            }
        })

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        if (!product.varients.some(item => item.id === id)) {
            throw new NotFoundException("Varient not found");
        }

        // Checking whether values are provided for undeclared options
        if (dto.option1 && (product.options.length < 1)) {
            throw new UnprocessableEntityException("Varient can't have values for blank options");
        }
        if (dto.option2 && (product.options.length < 2)) {
            throw new UnprocessableEntityException("Varient can't have values for blank options");
        }
        if (dto.option3 && (product.options.length < 3)) {
            throw new UnprocessableEntityException("Varient can't have values for blank options");
        }

        const uniqueCombination = new Set<string>();
        for (let i = 0; i < product.varients.length; i++) {
            if (product.varients[i].id === id) continue;
            uniqueCombination.add(JSON.stringify([product.varients[i].option1, product.varients[i].option2, product.varients[i].option3]));
        }

        if (uniqueCombination.has(JSON.stringify([dto.option1, dto.option2, dto.option3]))) {
            throw new ConflictException("Varient already exist with these options");
        }

        // Updating the unique values for options
        const uniqueOption1 = new Set<string>();
        const uniqueOption2 = new Set<string>();
        const uniqueOption3 = new Set<string>();

        for (let i = 0; i < product.varients.length; i++) {
            if (product.varients[i].id === id) continue;
            uniqueOption1.add(product.varients[i].option1);
            uniqueOption2.add(product.varients[i].option2);
            uniqueOption3.add(product.varients[i].option3);
        }

        if (dto.option1) uniqueOption1.add(dto.option1);
        if (dto.option2) uniqueOption2.add(dto.option2);
        if (dto.option3) uniqueOption3.add(dto.option3);

        let uniqueArray1 = [...uniqueOption1];
        let uniqueArray2 = [...uniqueOption2];
        let uniqueArray3 = [...uniqueOption3];

        if (product.options.length >= 1) {
            await this.prisma.options.update({
                where: {
                    id: product.options[0].id
                },
                data: {
                    values: uniqueArray1
                }
            })
        }
        if (product.options.length >= 2) {
            await this.prisma.options.update({
                where: {
                    id: product.options[1].id
                },
                data: {
                    values: uniqueArray2
                }
            })
        }
        if (product.options.length >= 3) {
            await this.prisma.options.update({
                where: {
                    id: product.options[2].id
                },
                data: {
                    values: uniqueArray3
                }
            })
        }

        // Updating the varient
        const updatedVarient = await this.prisma.varients.update({
            where: {
                id: id
            },
            data: {
                title: dto.title,
                option1: dto.option1,
                option2: dto.option2,
                option3: dto.option3,
                price: dto.price,
                comparePrice: dto.comparePrice
            }
        })

        return updatedVarient;
    }

    async deleteSpecificVarient(productId : number, id : number){
        await this.prisma.varients.delete({
            where: {
                id : id
            }
        })
        return "Varient removed successfully";
    }
}
