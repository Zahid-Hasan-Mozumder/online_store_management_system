import { ConflictException, HttpException, Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OptionsDto, ProductDto, UpdateProductDto, VarientsDto } from './dto';
import { ProductStatus } from './enum';

@Injectable()
export class ProductService {

    constructor(private prisma: PrismaService) { }

    checkProvidedVarientValuesForNullOptions(dto: ProductDto) {
        for (let i = 0; i < dto.varients.length; i++) {
            if (!dto.options[0]) {
                dto.varients[i].option1 = null;
            } else if (dto.options[0] && !dto.varients[i].option1) {
                let optionsName: string = (dto.options[0].name) ? dto.options[0].name : 'option1';
                throw new UnprocessableEntityException(`You need to provide option value in varient for ${optionsName}`);
            }

            if (!dto.options[1]) {
                dto.varients[i].option2 = null;
            } else if (dto.options[1] && !dto.varients[i].option2) {
                let optionsName: string = (dto.options[1].name) ? dto.options[1].name : 'option2';
                throw new UnprocessableEntityException(`You need to provide option value in varient for ${optionsName}`);
            }

            if (!dto.options[2]) {
                dto.varients[i].option3 = null;
            } else if (dto.options[2] && !dto.varients[i].option3) {
                let optionsName: string = (dto.options[2].name) ? dto.options[2].name : 'Option3';
                throw new UnprocessableEntityException(`You need to provide option value in varient for ${optionsName}`);
            }
        }
    }

    async createProduct(dto: ProductDto, images: Express.Multer.File[]) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                var newProduct = await tx.products.create({
                    data: {
                        title: dto.title,
                        description: dto.description,
                        productType: dto.productType,
                        price: dto.price,
                        comparePrice: (dto.comparePrice) ? dto.comparePrice : dto.price,
                        vendor: dto.vendor,
                        status: (dto.status) ? dto.status : ProductStatus.draft
                    }
                })

                if (dto.options) {
                    if (dto.varients) {

                        // Ignoring the option values from the varients where options are not given and checking whether values are given in the varients for provided options
                        this.checkProvidedVarientValuesForNullOptions(dto);

                        // Collecting unique present elements for all the options
                        const uniqueOption1 = new Set<string>();
                        const uniqueOption2 = new Set<string>();
                        const uniqueOption3 = new Set<string>();

                        for (let i = 0; i < dto.varients.length; i++) {
                            if (dto.varients[i].option1) {
                                uniqueOption1.add(dto.varients[i].option1);
                            }
                            if (dto.varients[i].option2) {
                                uniqueOption2.add(dto.varients[i].option2);
                            }
                            if (dto.varients[i].option3) {
                                uniqueOption3.add(dto.varients[i].option3);
                            }
                        }

                        let uniqueArray1 = [...uniqueOption1];
                        let uniqueArray2 = [...uniqueOption2];
                        let uniqueArray3 = [...uniqueOption3];

                        // Positioning the options in ascending order whether they are present or not
                        if (!uniqueArray2.length && uniqueArray3.length) {
                            dto.options[1].name = dto.options[2].name;
                            dto.options[2].name = null;
                            uniqueArray2 = uniqueArray3;
                            uniqueArray3 = [];
                            for (let i = 0; i < dto.varients.length; i++) {
                                if (dto.varients[i].option3) {
                                    dto.varients[i].option2 = dto.varients[i].option3
                                    dto.varients[i].option3 = null
                                }
                            }
                        }

                        if (!uniqueArray1.length && uniqueArray2.length) {
                            dto.options[0].name = dto.options[1].name;
                            dto.options[1].name = null;
                            uniqueArray1 = uniqueArray2;
                            uniqueArray2 = [];
                            for (let i = 0; i < dto.varients.length; i++) {
                                if (dto.varients[i].option2) {
                                    dto.varients[i].option1 = dto.varients[i].option2
                                    dto.varients[i].option2 = null
                                }
                            }
                        }

                        // Checking whether the options combination in the varients are already present or not
                        const uniqueCombinations = new Set<string>()
                        for (let i = 0; i < dto.varients.length; i++) {
                            const combination = JSON.stringify([dto.varients[i].option1, dto.varients[i].option2, dto.varients[i].option3]);
                            if (uniqueCombinations.has(combination)) {
                                let message = "Varients already exist with ";
                                if (dto.varients[i].option1) message += dto.varients[i].option1;
                                if (dto.varients[i].option2) { message += ", "; message += dto.varients[i].option2 };
                                if (dto.varients[i].option3) { message += " and "; message += dto.varients[i].option3 };
                                throw new ConflictException(message);
                            }
                            uniqueCombinations.add(combination);
                        }

                        // Creating the options with the unique value passed to the varient's options
                        if (uniqueArray1.length && dto.options[0]) {
                            await tx.options.create({
                                data: {
                                    name: (dto.options[0].name) ? dto.options[0].name : null,
                                    position: 1,
                                    values: uniqueArray1,
                                    productId: newProduct.id
                                }
                            })
                        }

                        if (uniqueArray2.length && dto.options[1]) {
                            await tx.options.create({
                                data: {
                                    name: (dto.options[1].name) ? dto.options[1].name : null,
                                    position: 2,
                                    values: uniqueArray2,
                                    productId: newProduct.id
                                }
                            })
                        }

                        if (uniqueArray3.length && dto.options[2]) {
                            await tx.options.create({
                                data: {
                                    name: (dto.options[2].name) ? dto.options[2].name : null,
                                    position: 3,
                                    values: uniqueArray3,
                                    productId: newProduct.id
                                }
                            })
                        }

                        // Creating the varients
                        for (let i = 0; i < dto.varients.length; i++) {
                            if (!dto.varients[i].option1 && !dto.varients[i].option2 && !dto.varients[i].option3) continue
                            await tx.varients.create({
                                data: {
                                    title: dto.varients[i].title,
                                    option1: dto.varients[i].option1,
                                    option2: dto.varients[i].option2,
                                    option3: dto.varients[i].option3,
                                    price: (dto.varients[i].price) ? dto.varients[i].price : newProduct.price,
                                    comparePrice: (dto.varients[i].comparePrice) ? dto.varients[i].comparePrice : newProduct.comparePrice,
                                    productId: newProduct.id
                                }
                            })
                        }

                    }
                    else {
                        throw new UnprocessableEntityException("You need to define varients for the options")
                    }
                }
                else {

                    // Creating default options for the product
                    await tx.options.create({
                        data: {
                            name: null,
                            position: null,
                            values: [],
                            productId: newProduct.id
                        }
                    })

                    // Creating deafult varients for the product
                    await tx.varients.create({
                        data: {
                            title: null,
                            option1: null,
                            option2: null,
                            option3: null,
                            price: (dto.price) ? dto.price : 0.0,
                            comparePrice: (dto.comparePrice) ? dto.comparePrice : (dto.price) ? dto.price : 0.0,
                            productId: newProduct.id
                        }
                    })
                }

                // Increasing the count of total products
                await tx.productCounts.update({
                    where: { id: 1 },
                    data: { count: { increment: 1 } }
                })

                // Fetching the newly created product
                const newlyCreatedProduct = await tx.products.findUnique({
                    where: { id: newProduct.id },
                    include: {
                        options: true,
                        varients: true
                    }
                })
                return newlyCreatedProduct;
            })
            return result;
        } catch (error) {
            throw error instanceof HttpException ? error : new InternalServerErrorException("An error occured while creating the product")
        }
    }

    async getAllProducts() {
        const allProducts = await this.prisma.products.findMany({
            include: {
                options: true,
                varients: true
            }
        })
        return allProducts;
    }

    async getTotalProductsCount() {
        const productCounts = await this.prisma.productCounts.findUnique({
            where: { id: 1 }
        })
        return productCounts.count;
    }

    async getSpecificProduct(id: number) {
        const product = await this.prisma.products.findUnique({
            where: { id: id },
            include: {
                options: true,
                varients: true
            }
        })
        return product;
    }

    async updateSpecificProduct(id: number, dto: UpdateProductDto, images: Express.Multer.File[]) {
        try {
            const result = this.prisma.$transaction(async (tx) => {
                const currentProduct = await tx.products.update({
                    where: { id: id },
                    include: {
                        options: true,
                        varients: true
                    },
                    data: {
                        title: dto.title,
                        description: dto.description,
                        productType: dto.productType,
                        price: dto.price,
                        comparePrice: (dto.comparePrice) ? dto.comparePrice : dto.price,
                        vendor: dto.vendor,
                        status: (dto.status) ? dto.status : ProductStatus.draft
                    }
                })

                if (dto.options) {
                    if (dto.varients) {

                        // Ignoring the option values from the varients where options are not given and checking whether values are given in the varients for provided options
                        this.checkProvidedVarientValuesForNullOptions(dto);

                        // Collecting unique present elements for all the options
                        const uniqueOption1 = new Set<string>();
                        const uniqueOption2 = new Set<string>();
                        const uniqueOption3 = new Set<string>();

                        for (let i = 0; i < dto.varients.length; i++) {
                            if (dto.varients[i].option1) {
                                uniqueOption1.add(dto.varients[i].option1);
                            }
                            if (dto.varients[i].option2) {
                                uniqueOption2.add(dto.varients[i].option2);
                            }
                            if (dto.varients[i].option3) {
                                uniqueOption3.add(dto.varients[i].option3);
                            }
                        }

                        let uniqueArray1 = [...uniqueOption1];
                        let uniqueArray2 = [...uniqueOption2];
                        let uniqueArray3 = [...uniqueOption3];

                        // Positioning the options in ascending order whether they are present or not
                        if (!uniqueArray2.length && uniqueArray3.length) {
                            dto.options[1].name = dto.options[2].name;
                            dto.options[2].name = null;
                            uniqueArray2 = uniqueArray3;
                            uniqueArray3 = [];
                            for (let i = 0; i < dto.varients.length; i++) {
                                if (dto.varients[i].option3) {
                                    dto.varients[i].option2 = dto.varients[i].option3
                                    dto.varients[i].option3 = null
                                }
                            }
                        }

                        if (!uniqueArray1.length && uniqueArray2.length) {
                            dto.options[0].name = dto.options[1].name;
                            dto.options[1].name = null;
                            uniqueArray1 = uniqueArray2;
                            uniqueArray2 = [];
                            for (let i = 0; i < dto.varients.length; i++) {
                                if (dto.varients[i].option2) {
                                    dto.varients[i].option1 = dto.varients[i].option2
                                    dto.varients[i].option2 = null
                                }
                            }
                        }

                        // Checking whether the options combination in the varients are already present or not
                        const uniqueCombinations = new Set<string>()
                        for (let i = 0; i < dto.varients.length; i++) {
                            const combination = JSON.stringify([dto.varients[i].option1, dto.varients[i].option2, dto.varients[i].option3]);
                            if (uniqueCombinations.has(combination)) {
                                let message = "Varients already exist with ";
                                if (dto.varients[i].option1) message += dto.varients[i].option1;
                                if (dto.varients[i].option2) { message += ", "; message += dto.varients[i].option2 };
                                if (dto.varients[i].option3) { message += " and "; message += dto.varients[i].option3 };
                                throw new ConflictException(message);
                            }
                            uniqueCombinations.add(combination);
                        }

                        // Deleting the previous options
                        await tx.options.deleteMany({
                            where: { productId: currentProduct.id }
                        })

                        // Deleting the previous varients
                        await tx.varients.deleteMany({
                            where: { productId: currentProduct.id }
                        })

                        // Creating the options with the unique value passed to the varient's options
                        if (uniqueArray1.length && dto.options[0]) {
                            await tx.options.create({
                                data: {
                                    name: (dto.options[0].name) ? dto.options[0].name : null,
                                    position: 1,
                                    values: uniqueArray1,
                                    productId: currentProduct.id
                                }
                            })
                        }

                        if (uniqueArray2.length && dto.options[1]) {
                            await tx.options.create({
                                data: {
                                    name: (dto.options[1].name) ? dto.options[1].name : null,
                                    position: 2,
                                    values: uniqueArray2,
                                    productId: currentProduct.id
                                }
                            })
                        }

                        if (uniqueArray3.length && dto.options[2]) {
                            await tx.options.create({
                                data: {
                                    name: (dto.options[2].name) ? dto.options[2].name : null,
                                    position: 3,
                                    values: uniqueArray3,
                                    productId: currentProduct.id
                                }
                            })
                        }

                        // Creating the varients
                        for (let i = 0; i < dto.varients.length; i++) {
                            if (!dto.varients[i].option1 && !dto.varients[i].option2 && !dto.varients[i].option3) continue
                            await tx.varients.create({
                                data: {
                                    title: dto.varients[i].title,
                                    option1: dto.varients[i].option1,
                                    option2: dto.varients[i].option2,
                                    option3: dto.varients[i].option3,
                                    price: (dto.varients[i].price) ? dto.varients[i].price : currentProduct.price,
                                    comparePrice: (dto.varients[i].comparePrice) ? dto.varients[i].comparePrice : currentProduct.comparePrice,
                                    productId: currentProduct.id
                                }
                            })
                        }

                    }
                    else {
                        throw new UnprocessableEntityException("You need to define varients for the options")
                    }
                }

                // Fetching the updated product from the database
                const updatedProduct = await tx.products.findUnique({
                    where: { id: id },
                    include: {
                        options: true,
                        varients: true
                    }
                })
                return updatedProduct;
            })
            return result;
        } catch (error) {
            throw error instanceof HttpException ? error : new InternalServerErrorException("An error occured while updating the product");
        }
    }

    async deleteSpecificProduct(id: number) {
        try {
            await this.prisma.$transaction(async (tx) => {
                await this.prisma.products.delete({
                    where: { id: id }
                })
                await this.prisma.productCounts.update({
                    where: { id: 1 },
                    data: { count: { decrement: 1 } }
                })
            })
            return "Product removed successfully";
        } catch (error) {
            throw new InternalServerErrorException("An error occured while deleting a product");
        }
    }

}
