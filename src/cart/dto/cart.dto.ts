import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CartStatus } from "../enum";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CartLineItemsDto {
    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsNumber()
    productId : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    varientId : number;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsNumber()
    cartId : number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    vendor : string;

    @ApiProperty({required : false})
    @IsOptional()
    @IsNumber()
    quantity : number = 1;
}

export class CartDto {

    @IsOptional()
    @IsString()
    note : string;

    @IsOptional()
    @IsEnum(CartStatus)
    status : CartStatus;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CartLineItemsDto)
    cartLineItems : CartLineItemsDto[];
}