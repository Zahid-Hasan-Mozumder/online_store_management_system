import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/guard';
import { CreateAdminDto, UpdateAdminDto, AdminDto } from './dto/admin.dto';
import { PaginationDto } from './dto';
import { AuthorizeAdmin } from './decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admins')
export class AdminController {

    constructor (private adminService : AdminService) {}
    
    @Post()
    @AuthorizeAdmin({ role : "admin", permission: "admin", activity : "create"})
    createAdmin(@GetUser() user : AdminDto, @Body() dto : CreateAdminDto) {
        return this.adminService.createAdmin(user, dto);
    }

    @Get()
    @AuthorizeAdmin({ role : "admin", permission: "admin", activity : "read"})
    getAdmins(@GetUser() user : AdminDto, @Query() pagination : PaginationDto){
        return this.adminService.getAdmins(user, pagination);
    }

    @Get(':id')
    @AuthorizeAdmin({ role : "admin", permission: "admin", activity : "read"})
    getSpecificAdmin(@GetUser() user : AdminDto, @Param('id') id : string){
        return this.adminService.getSpecificAdmin(user, parseInt(id));
    }

    @Patch(':id')
    @AuthorizeAdmin({ role : "admin", permission: "admin", activity : "update"})
    updateSpecificAdmin(@GetUser() user : AdminDto, @Param('id') id : string, @Body() dto : UpdateAdminDto){
        return this.adminService.updateSpecificAdmin(user, parseInt(id), dto);
    }

    @Delete(':id')
    @AuthorizeAdmin({ role : "admin", permission: "admin", activity : "delete"})
    deleteSpecificAdmin(@GetUser() user : AdminDto, @Param('id') id : string){
        return this.adminService.deleteSpecificAdmin(user, parseInt(id));
    }
}
