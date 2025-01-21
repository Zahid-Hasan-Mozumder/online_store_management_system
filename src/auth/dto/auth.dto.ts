import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Matches, MaxLength, ValidateNested } from "class-validator";
import { PermissionType } from "../enum";
import { ApiProperty } from "@nestjs/swagger";

export class AdminSignupDto {

    @ApiProperty({description : "First name of the admin", required: false})
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    firstName: string;

    @ApiProperty({description : "Last name of the admin", required: true})
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    lastName: string;

    @ApiProperty({description : "Email of the admin", required: true})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({description: "Password of the admin (Only : a-z A-Z 0-9 @ ! # - _)", required: true})
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9@!#-_]+$/, {
        message: "Only @ ! # - _ alphanumeric characters are allowed"
    })
    password: string;
}

export class PermissionsDto {
    @ApiProperty({description : "Admin's ID", required: true})
    @IsNotEmpty()
    adminId : Number;

    @ApiProperty({description : "Permission Type for admin", required: true})
    @IsNotEmpty()
    @IsEnum(PermissionType)
    permissionType : PermissionType;

    @ApiProperty({description : "Create Permission (Default : true)", required: false})
    @IsBoolean()
    @IsOptional()
    create: boolean = true;

    @ApiProperty({description : "Read Permission (Default : true)", required: false})
    @IsBoolean()
    @IsOptional()
    read: boolean = true;

    @ApiProperty({description : "Update Permission (Default : true)", required: false})
    @IsBoolean()
    @IsOptional()
    update: boolean = true;

    @ApiProperty({description : "Delete Permission (Default : true)", required: false})
    @IsBoolean()
    @IsOptional()
    delete: boolean = true;
}

export class AdminSigninDto {

    @ApiProperty({description : "Email of the admin", required: true})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({description: "Password of the admin (Only : a-z A-Z 0-9 @ ! # - _)", required: true})
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9@!#-_]+$/, {
        message: "Only @ ! # - _ alphanumeric characters are allowed"
    })
    password: string;
}

export class ClientAddressDto {
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

export class ClientSignupDto {
    @ApiProperty({description : "First name of the customer", required: false})
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    firstName: string;

    @ApiProperty({description : "Last name of the customer", required: true})
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    lastName: string;

    @ApiProperty({description : "Email of the customer", required: true})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({description: "Password of the customer (Only : a-z A-Z 0-9 @ ! # - _)", required: true})
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9@!#-_]+$/, {
        message: "Only @ ! # - _ alphanumeric characters are allowed"
    })
    password: string;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ClientAddressDto)
    address : ClientAddressDto;
}

export class ClientSigninDto {

    @ApiProperty({description : "Email of the customer", required: true})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({description: "Password of the customer (Only : a-z A-Z 0-9 @ ! # - _)", required: true})
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9@!#-_]+$/, {
        message: "Only @ ! # - _ alphanumeric characters are allowed"
    })
    password: string;
}

export class ClientActivateDto {

    @ApiProperty({description : "First name of the customer", required: false})
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    firstName : string;

    @ApiProperty({description : "Last name of the customer", required: true})
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    lastName : string;

    @ApiProperty({description : "Email of the customer", required: true})
    @IsNotEmpty()
    @IsEmail()
    email : string;

    @ApiProperty({description: "Password of the customer (Only : a-z A-Z 0-9 @ ! # - _)", required: true})
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9@!#-_]+$/, {
        message: "Only @ ! # - _ alphanumeric characters are allowed"
    })
    password : string;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ClientAddressDto)
    address : ClientAddressDto;
}