import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ClientDto } from 'src/cart/dto';
import { OrderUpdateDto } from './dto/order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
    
    constructor(private orderService : OrderService) {}

    @ApiBearerAuth()
    @Put(':id')
    @UseGuards(JwtGuard)
    updateOrder(@GetUser() user : ClientDto, @Body() dto : OrderUpdateDto){
        return this.orderService.updateOrder(user, dto);
    }
}
