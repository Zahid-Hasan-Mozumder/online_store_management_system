import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { OrderStatus } from "src/cart/enum";

export class OrderLineItemsDto {
    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsNumber()
    lineItemId : number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    quantity: number = 1;
}

export class ShippingAddressDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    city: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    country: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    zipCode: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    contactNo: string;
}

export class BillingAddressDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    city: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    country: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    zipCode: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    contactNo: string;
}

export class OrderUpdateDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    note : string;

    @ApiProperty({ required : false})
    @IsOptional()
    @IsEnum(OrderStatus)
    status : OrderStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested({each : true})
    @Type(() => OrderLineItemsDto)
    orderLineItems : OrderLineItemsDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress: ShippingAddressDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => BillingAddressDto)
    billingAddress: BillingAddressDto;
}