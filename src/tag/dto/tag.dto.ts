import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class TagDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class UpdateTagDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class AddProductInTagDto {
    @IsNotEmpty()
    @IsNumber()
    productId : number;
}