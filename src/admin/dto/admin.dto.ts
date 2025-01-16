import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from "class-validator";

export class AdminDto {
    id : number;
    email : string;
    adminPermissions : {
        create : boolean,
        read : boolean,
        update : boolean,
        delete : boolean
    };
    productPermissions : {
        create : boolean,
        read : boolean,
        update : boolean,
        delete : boolean
    };
    clientPermissions : {
        create : boolean,
        read : boolean,
        update : boolean,
        delete : boolean
    };
    role : string;
}

export class PermissionsDto {

    @ApiProperty({description : "Create Permission (Default : false)", required: false})
    @IsBoolean()
    @IsOptional()
    create: boolean;

    @ApiProperty({description : "Read Permission (Default : false)", required: false})
    @IsBoolean()
    @IsOptional()
    read: boolean;

    @ApiProperty({description : "Update Permission (Default : false)", required: false})
    @IsBoolean()
    @IsOptional()
    update: boolean;

    @ApiProperty({description : "Delete Permission (Default : false)", required: false})
    @IsBoolean()
    @IsOptional()
    delete: boolean;

    constructor() {
        this.create = false;
        this.read = false;
        this.update = false;
        this.delete = false;
    }
}

export class CreateAdminDto {

    @ApiProperty({description: "First name of the admin", required: false})
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    firstName: string;

    @ApiProperty({description: "Last name of the admin", required: true})
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    lastName: string;

    @ApiProperty({description: "Email of the admin", required: true})
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

    @ApiProperty({description : "Admin permissions", required: false})
    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    adminPermissions: PermissionsDto = new PermissionsDto();

    @ApiProperty({description : "Product permissions", required: false})
    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    productPermissions: PermissionsDto = new PermissionsDto();

    @ApiProperty({description : "Client permissions", required: false})
    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    clientPermissions: PermissionsDto = new PermissionsDto();
}

export class UpdateAdminDto extends PartialType(CreateAdminDto){}