import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, CartCheckoutDto, CartDeleteDto, CartDto, CartUpdateDto, ClientDto, RemoveFromCartDto } from './dto';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@Controller('carts')
export class CartController {

    constructor(private cartService : CartService) {}

    @Post()
    createCart(@Body() dto : CartDto){
        return this.cartService.createCart(dto);
    }

    @Post('add')
    addToCart(@Body() dto : AddToCartDto){
        return this.cartService.addToCart(dto);
    }

    @Post('remove')
    removeFromCart(@Body() dto : RemoveFromCartDto){
        return this.cartService.removeFromCart(dto);
    }

    @Post('checkout')
    checkoutCart(@Body() dto : CartCheckoutDto){
        return this.cartService.checkoutCart(dto);
    }

    @Get()
    @UseGuards(JwtGuard)
    getCart(@GetUser() user : ClientDto){
        return this.cartService.getCart(user);
    }

    @Put()
    @UseGuards(JwtGuard)
    updateCart(@GetUser() user : ClientDto, @Body() dto : CartUpdateDto) {
        return this.cartService.updateCart(user, dto);
    }

    @Delete()
    @UseGuards(JwtGuard)
    deleteCart(@GetUser() user : ClientDto, @Body() dto : CartDeleteDto) {
        return this.cartService.deleteCart(user, dto);
    }
}
