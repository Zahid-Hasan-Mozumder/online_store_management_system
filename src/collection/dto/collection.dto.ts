import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CollectionDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class UpdateCollectionDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    name : string;
}

export class AddProductInCollectionDto {
    @IsNotEmpty()
    @IsNumber()
    productId : number;
}