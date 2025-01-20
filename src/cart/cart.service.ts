import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartDto, ClientDto } from './dto';

@Injectable()
export class CartService {
    
    constructor(private prisma : PrismaService) {}

    async createCart(user : ClientDto, dto : CartDto) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {

                if(user) {
                    
                }
                const cart = await tx.carts.create({
                    data : {
                        
                    }
                })
            })
        } catch (error) {
            if(error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while creating the cart");
        }
    }
}
