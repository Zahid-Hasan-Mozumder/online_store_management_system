import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class TagDto {
    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class UpdateTagDto {
    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class AddProductInTagDto {
    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsNumber()
    productId : number;
}