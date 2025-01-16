import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CollectionDto {
    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class UpdateCollectionDto {
    @ApiProperty({required : false})
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class AddProductInCollectionDto {
    @ApiProperty({required : true})
    @IsNotEmpty()
    @IsNumber()
    productId : number;
}