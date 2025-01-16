import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthorizeAdmin } from '../admin/decorator';
import { AddProductInCollectionDto, CollectionDto, UpdateCollectionDto } from './dto';
import { CollectionService } from './collection.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Collection')
@Controller('collections')
export class CollectionController {

    constructor(private collectionService : CollectionService) {}

    @Post()
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "create" })
    createCollection(@Body() dto : CollectionDto) {
        return this.collectionService.createCollection(dto);    
    }

    @Post(':id/add')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "create" })
    addProductToCollection(@Param('id') id : string, @Body() dto : AddProductInCollectionDto) {
        return this.collectionService.addProductToCollection(parseInt(id), dto);
    }

    @Get()
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getAllCollections() {
        return this.collectionService.getAllCollections();
    }

    @Get('count')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getTotalCollectionsCount() {
        return this.collectionService.getTotalCollectionsCount();
    }

    @Get(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getSpecificCollection(@Param('id') id : string) {
        return this.collectionService.getSpecificCollection(parseInt(id));
    }

    @Put(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "update" })
    updateSpecificCollection(@Param('id') id : string, @Body() dto : UpdateCollectionDto) {
        return this.collectionService.updateSpecificCollection(parseInt(id), dto);
    }

    @Delete(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "delete" })
    deleteSpecificCollection(@Param('id') id : string) {
        return this.collectionService.deleteSpecificCollection(parseInt(id));
    }
}
