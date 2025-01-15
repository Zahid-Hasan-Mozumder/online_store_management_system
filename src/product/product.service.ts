import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OptionsDto, ProductDto, VarientsDto } from './dto';
import { ProductStatus } from './enum';

@Injectable()
export class ProductService {

    constructor (private prisma : PrismaService) {}

    async createProduct(dto : ProductDto, images : Express.Multer.File[]){

        var newProduct = await this.prisma.products.create({
            data : {
                title : dto.title,
                description : dto.description,
                productType : dto.productType,
                price : dto.price,
                comparePrice : dto.comparePrice,
                vendor : dto.vendor,
                status : (dto.status) ? dto.status : ProductStatus.draft
            }
        })

        if(dto.options){
            if(dto.varients){
                for(let i = 0; i < dto.varients.length; i++){
                    if(!dto.options[0]) dto.varients[i].option1 = null;
                    if(!dto.options[1]) dto.varients[i].option2 = null;
                    if(!dto.options[2]) dto.varients[i].option3 = null;
                }

                const uniqueOption1 = new Set<string>();
                const uniqueOption2 = new Set<string>();
                const uniqueOption3 = new Set<string>();

                for(let i = 0; i < dto.varients.length; i++){
                    if(dto.varients[i].option1) uniqueOption1.add(dto.varients[i].option1)
                    if(dto.varients[i].option2) uniqueOption2.add(dto.varients[i].option2)
                    if(dto.varients[i].option3) uniqueOption3.add(dto.varients[i].option3)
                }

                let uniqueArray1 = [...uniqueOption1];
                let uniqueArray2 = [...uniqueOption2];
                let uniqueArray3 = [...uniqueOption3];

                if(!uniqueArray2.length && uniqueArray3.length){
                    dto.options[1].name = dto.options[2].name;
                    dto.options[2].name = null;
                    uniqueArray2 = uniqueArray3;
                    uniqueArray3 = [];
                    for(let i = 0; i < dto.varients.length; i++){
                        if(dto.varients[i].option3){
                            dto.varients[i].option2 = dto.varients[i].option3
                            dto.varients[i].option3 = null
                        }
                    }
                }

                if(!uniqueArray1.length && uniqueArray2.length){
                    dto.options[0].name = dto.options[1].name;
                    dto.options[1].name = null;
                    uniqueArray1 = uniqueArray2;
                    uniqueArray2 = [];
                    for(let i = 0; i < dto.varients.length; i++){
                        if(dto.varients[i].option2){
                            dto.varients[i].option1 = dto.varients[i].option2
                            dto.varients[i].option2 = null
                        }
                    }
                }

                const uniqueCombinations = new Set<[string, string, string]>()
                for(let i = 0; i < dto.varients.length; i++){
                    if(uniqueCombinations.has([dto.varients[i].option1, dto.varients[i].option2, dto.varients[i].option3])){
                        throw new ConflictException("Varient already exist");
                    }
                    uniqueCombinations.add([dto.varients[i].option1, dto.varients[i].option2, dto.varients[i].option3]);
                }

                if(uniqueArray1.length && dto.options[0] && dto.options[0].name){
                    await this.prisma.options.create({
                        data : {
                            name : dto.options[0].name,
                            position : 1,
                            values : uniqueArray1,
                            productId : newProduct.id
                        }
                    })
                }
                
                if(uniqueArray2.length && dto.options[1] && dto.options[1].name){
                    await this.prisma.options.create({
                        data : {
                            name : dto.options[1].name,
                            position : 2,
                            values : uniqueArray2,
                            productId : newProduct.id
                        }
                    })
                }

                if(uniqueArray3.length && dto.options[2] && dto.options[2].name){
                    await this.prisma.options.create({
                        data : {
                            name : dto.options[2].name,
                            position : 3,
                            values : uniqueArray3,
                            productId : newProduct.id
                        }
                    })
                }

                for(let i = 0; i < dto.varients.length; i++){
                    if(!dto.varients[i].option1 && !dto.varients[i].option2 && !dto.varients[i].option3) continue
                    await this.prisma.varients.create({
                        data : {
                            option1 : dto.varients[i].option1,
                            option2 : dto.varients[i].option2,
                            option3 : dto.varients[i].option3,
                            price : (dto.varients[i].price) ? dto.varients[i].price : newProduct.price,
                            comparePrice : (dto.varients[i].comparePrice) ? dto.varients[i].comparePrice : newProduct.comparePrice,
                            productId : newProduct.id
                        }
                    })
                }

            }
            else{
                throw new UnprocessableEntityException("You need to define varients for the options")
            }
        }
        else{

            const newOptions = await this.prisma.options.create({
                data : {
                    name : null,
                    position : null,
                    values : [],
                    productId : newProduct.id
                }
            })

            const newVarients = await this.prisma.varients.create({
                data : {
                    option1 : null,
                    option2 : null,
                    option3 : null,
                    price : (dto.price) ? dto.price : 0.0,
                    comparePrice : (dto.comparePrice) ? dto.comparePrice : (dto.price) ? dto.price : 0.0,
                    productId : newProduct.id
                }
            })
        }
        
        const newlyCreatedProduct = await this.prisma.products.findUnique({
            where : {
                id : newProduct.id
            },
            include : {
                options : true,
                varients : true
            }
        })

        return newlyCreatedProduct;
    }
}
