import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { ProductStatus } from "../enum";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class OptionsDto {

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    name : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    position : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    values : string[];
}

export class VarientsDto {

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    title : string;
    
    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    option1 : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    option2 : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    option3 : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    price : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    comparePrice : number;
}

export class ImagesDto {
    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    title : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    url : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    position : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    height : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    width : number;
}

export class ProductDto {

    @ApiProperty({description : "Title of the product", required : true})
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    title : string;

    @ApiProperty({description : "Description of the product", required : false})
    @IsOptional()
    @IsString()
    description : string;

    @ApiProperty({description : "Product type of the product", required : false})
    @IsOptional()
    @IsString()
    productType : string;
    
    @ApiProperty({description : "Price of the product", required : false})
    @IsOptional()
    @IsNumber()
    price : number;

    @ApiProperty({description : "Compare price of the product", required : false})
    @IsOptional()
    @IsNumber()
    comparePrice : number;

    @ApiProperty({description : "Vendor/Provider of the product", required : false})
    @IsOptional()
    @IsString()
    vendor : string;

    @ApiProperty({description : "Status of the product", required : false})
    @IsOptional()
    @IsEnum(ProductStatus)
    status : ProductStatus;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    collections : string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags : string[];

    @ApiProperty({required : false})
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionsDto)
    options : OptionsDto[];

    @ApiProperty({required : false})
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VarientsDto)
    varients : VarientsDto[];

    @ApiProperty({required : false})
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImagesDto)
    images : ImagesDto[];
}

export class UpdateProductDto {
    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    title : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    description : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    productType : string;
    
    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    price : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    comparePrice : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    vendor : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsEnum(ProductStatus)
    status : ProductStatus;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    collections : string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags : string[];

    @ApiProperty({required : false})
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionsDto)
    options : OptionsDto[];

    @ApiProperty({required : false})
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VarientsDto)
    varients : VarientsDto[];

    @ApiProperty({required : false})
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImagesDto)
    images : ImagesDto[];
}