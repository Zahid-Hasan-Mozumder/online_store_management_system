import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthorizeAdmin } from 'src/admin/decorator';
import { ProductDto, UpdateProductDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MulterImageStorage } from './multer';

@Controller('products')
export class ProductController {

    constructor(private productService: ProductService) {}

    @Post()
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "create" })
    @UseInterceptors(FilesInterceptor('images', 10, { storage: MulterImageStorage }))
    createProduct(@Body() dto: ProductDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.productService.createProduct(dto, images);
    }

    @Get()
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getAllProducts() {
        return this.productService.getAllProducts();
    }

    @Get('count')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getTotalProductsCount() {
        return this.productService.getTotalProductsCount();
    }

    @Get(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "read" })
    getSpecificProduct(@Param('id') id : string) {
        return this.productService.getSpecificProduct(parseInt(id));
    }

    @Put(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "update" })
    @UseInterceptors(FilesInterceptor('images', 10, { storage: MulterImageStorage }))
    updateSpecificProduct(@Param('id') id : string, @Body() dto : UpdateProductDto, @UploadedFiles() images : Express.Multer.File[]) {
        return this.productService.updateSpecificProduct(parseInt(id), dto, images);
    }

    @Delete(':id')
    @AuthorizeAdmin({ role: "admin", permission: "product", activity: "delete" })
    deleteSpecificProduct(@Param('id') id : string) {
        return this.productService.deleteSpecificProduct(parseInt(id));
    }
}
