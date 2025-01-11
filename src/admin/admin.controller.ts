import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/guard';
import { CreateAdminDto, UpdateAdminDto, UserDto } from './dto/admin.dto';

@UseGuards(JwtGuard)
@Controller('admins')
export class AdminController {

    constructor (private adminService : AdminService) {}
    
    @Post()
    createAdmin(@GetUser() user : UserDto, @Body() dto : CreateAdminDto) {
        return this.adminService.createAdmin(user, dto);
    }

    @Get()
    getAdmins(@GetUser() user : UserDto){
        return this.adminService.getAdmins(user);
    }

    @Get(':id')
    getSpecificAdmin(@GetUser() user : UserDto, @Param('id') id : string){
        return this.adminService.getSpecificAdmin(user, parseInt(id));
    }

    @Patch(':id')
    updateSpecificAdmin(@GetUser() user : UserDto, @Param('id') id : string, @Body() dto : UpdateAdminDto){
        return this.adminService.updateSpecificAdmin(user, parseInt(id), dto);
    }

    @Delete(':id')
    deleteSpecificAdmin(@GetUser() user : UserDto, @Param('id') id : string){
        return this.adminService.deleteSpecificAdmin(user, parseInt(id));
    }
}
