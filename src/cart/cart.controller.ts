import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDto, ClientDto } from './dto';
import { GetUser } from 'src/auth/decorator';

@Controller('carts')
export class CartController {

    constructor(private cartService : CartService) {}

    @Post()
    createCart(@GetUser() user : ClientDto, @Body() dto : CartDto){
        return this.cartService.createCart(user, dto);
    }
}
