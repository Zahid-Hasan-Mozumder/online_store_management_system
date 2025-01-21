import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class AddressDto {
    @IsNotEmpty()
    @IsString()
    address : string;
}

export class TimeWindowDto {
    @IsNotEmpty()
    @IsString()
    startTime : string;

    @IsNotEmpty()
    @IsString()
    endTime : string;
}

export class RouteOrderDto {

    @IsOptional()
    @IsString()
    name : string;

    @IsNotEmpty()
    @ValidateNested({each : true})
    @Type(() => AddressDto)
    locations : AddressDto[];

    @IsNotEmpty()
    @IsString()
    phone : string;

    @IsNotEmpty()
    @IsEmail()
    email : string;

    @IsOptional()
    @IsNumber()
    duration : number;

    @IsOptional()
    @IsNumber()
    load : number;

    @IsOptional()
    @IsString()
    instructions : string;

    @IsOptional()
    @ValidateNested({each : true})
    @Type(() => TimeWindowDto)
    timeWindows : TimeWindowDto[];

    @IsNotEmpty()
    @IsString()
    customerOrderNumber : string;
}