import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { ProductStatus } from "../enum";
import { Type } from "class-transformer";

export class OptionsDto {
    @IsOptional()
    @IsString()
    name : string;

    @IsOptional()
    @IsNumber()
    position : number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    values : string[];
}

export class VarientsDto {

    @IsOptional()
    @IsString()
    title : string;
    
    @IsOptional()
    @IsString()
    option1 : string;

    @IsOptional()
    @IsString()
    option2 : string;

    @IsOptional()
    @IsString()
    option3 : string;

    @IsOptional()
    @IsNumber()
    price : number;

    @IsOptional()
    @IsNumber()
    comparePrice : number;
}

export class ImagesDto {
    @IsOptional()
    @IsString()
    title : string;

    @IsOptional()
    @IsString()
    url : string;

    @IsOptional()
    @IsNumber()
    position : number;

    @IsOptional()
    @IsNumber()
    height : number;

    @IsOptional()
    @IsNumber()
    width : number;
}

export class ProductDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    title : string;

    @IsOptional()
    @IsString()
    description : string;

    @IsOptional()
    @IsString()
    productType : string;
    
    @IsOptional()
    @IsNumber()
    price : number;

    @IsOptional()
    @IsNumber()
    comparePrice : number;

    @IsOptional()
    @IsString()
    vendor : string;

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

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionsDto)
    options : OptionsDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VarientsDto)
    varients : VarientsDto[];

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImagesDto)
    images : ImagesDto[];
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    title : string;

    @IsOptional()
    @IsString()
    description : string;

    @IsOptional()
    @IsString()
    productType : string;
    
    @IsOptional()
    @IsNumber()
    price : number;

    @IsOptional()
    @IsNumber()
    comparePrice : number;

    @IsOptional()
    @IsString()
    vendor : string;

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

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionsDto)
    options : OptionsDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VarientsDto)
    varients : VarientsDto[];

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImagesDto)
    images : ImagesDto[];
}