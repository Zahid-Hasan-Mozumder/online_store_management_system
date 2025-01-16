import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthorizeAdmin } from 'src/admin/decorator';
import { VarientsDto } from 'src/product/dto';
import { VarientService } from './varient.service';

@Controller()
export class VarientController {

    constructor(private varientService : VarientService) {}

    @Post('/product/:productId/varients')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "create" })
    createVarient(@Param('productId') productId : string, @Body() dto : VarientsDto) {
        return this.varientService.createVarient(parseInt(productId), dto);
    }
    
    @Get('/product/:productId/varients')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getAllVarients(@Param('productId') productId : string) {
        return this.varientService.getAllVarients(parseInt(productId));
    }

    @Get('/product/:productId/varients/:id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getSpecificVarients(@Param('id') id : string) {
        return this.varientService.getSpecificVarient(parseInt(id));
    }

    @Put('/product/:productId/varients/:id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "update" })
    updateSpecificVarients(@Param('productId') productId : string, @Param('id') id : string, @Body() dto : VarientsDto) {
        return this.varientService.updateSpecificVarient(parseInt(productId), parseInt(id), dto);
    }

    @Delete('/product/:productId/varients/:id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "delete" })
    deleteSpecificVarients(@Param('productId') productId : string, @Param('id') id : string) {
        return this.varientService.deleteSpecificVarient(parseInt(productId), parseInt(id));
    }
}
