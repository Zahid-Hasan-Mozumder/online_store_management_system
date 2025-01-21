import { Controller, Get, Post, Put } from '@nestjs/common';
import { RouteService } from './route.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthorizeAdmin } from 'src/admin/decorator';

@ApiTags('Route')
@Controller('routes')
export class RouteController {

    constructor(private routeService : RouteService) {}

    @ApiBearerAuth()
    @Post()
    @AuthorizeAdmin({ role : "admin", permission: "product", activity : "create"})
    processOrders() {
        return this.routeService.processOrders(); 
    }

    @ApiBearerAuth()
    @Put('update')
    @AuthorizeAdmin({ role : "admin", permission: "product", activity : "update"})
    updateOrders() {
        return this.routeService.updateOrders(); 
    }
}
