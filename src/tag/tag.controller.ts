import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthorizeAdmin } from 'src/admin/decorator';
import { AddProductInTagDto, TagDto, UpdateTagDto } from './dto';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {

    constructor(private tagService : TagService) {}

    @Post()
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "create" })
    createTag(@Body() dto : TagDto) {
        return this.tagService.createTag(dto);    
    }

    @Post(':id/add')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "create" })
    addProductToTag(@Param('id') id : string, @Body() dto : AddProductInTagDto) {
        return this.tagService.addProductToTag(parseInt(id), dto);
    }

    @Get()
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getAllTags() {
        return this.tagService.getAllTags();
    }

    @Get('count')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getTotalTagsCount() {
        return this.tagService.getTotalTagsCount();
    }

    @Get(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getSpecificTag(@Param('id') id : string) {
        return this.tagService.getSpecificTag(parseInt(id));
    }

    @Put(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "update" })
    updateSpecificTag(@Param('id') id : string, @Body() dto : UpdateTagDto) {
        return this.tagService.updateSpecificTag(parseInt(id), dto);
    }

    @Delete(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "delete" })
    deleteSpecificTag(@Param('id') id : string) {
        return this.tagService.deleteSpecificTag(parseInt(id));
    }
}
