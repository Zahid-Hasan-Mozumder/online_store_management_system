import { Body, Controller, Delete, Get, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthorizeAdmin } from 'src/admin/decorator';
import { ProductDto } from './dto';
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
    getAllProducts() {

    }

    @Get('count')
    getTotalProductsCount() {

    }

    @Get(':id')
    getSpecificProduct() {

    }

    @Put(':id')
    updateSpecificProduct() {

    }

    @Delete(':id')
    deleteSpecificProduct() {

    }
}
