import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CartStatus } from "../enum";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CartLineItemsDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    varientId: number;

    @ApiProperty({ required: true })
    @IsOptional()
    @IsNumber()
    cartId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    vendor: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    quantity: number = 1;
}

export class CartDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(CartStatus)
    status: CartStatus;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CartLineItemsDto)
    cartLineItems: CartLineItemsDto[];
}

export class AddToCartDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    cartId: number;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    varientId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    vendor: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    quantity: number = 1;
}

export class RemoveFromCartDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    lineItemId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    decrement: number = 1;
}

export class CartUpdateDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    cartId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(CartStatus)
    status: CartStatus;

    @ApiProperty({ required: true })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CartLineItemsDto)
    cartLineItems: CartLineItemsDto[];
}

export class CartDeleteDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    cartId: number;
}

export class ShippingAddressDto {
    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    firstName : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    lastName : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    address : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    city : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    country : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    zipCode : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    contactNo : string;
}

export class BillingAddressDto {
    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    firstName : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    lastName : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    address : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    city : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    country : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    zipCode : string;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    contactNo : string;
}

export class CartCheckoutDto {

    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsNumber()
    cartId : number;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress : ShippingAddressDto;

    @ApiProperty({required : true})
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => BillingAddressDto)
    billingAddress : BillingAddressDto;
}