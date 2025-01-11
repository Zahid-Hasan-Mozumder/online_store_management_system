import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from "class-validator";

export class PermissionsDto {
    @IsBoolean()
    @IsOptional()
    create: boolean;

    @IsBoolean()
    @IsOptional()
    read: boolean;

    @IsBoolean()
    @IsOptional()
    update: boolean;

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

export class UserDto {
    id : number;
    email : string;
    role : string;
}

export class CreateAdminDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9@!#-_]+$/, {
        message: "Only @ ! # - _ alphanumeric characters are allowed"
    })
    password: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    adminPermissions: PermissionsDto = new PermissionsDto();

    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    productPermissions: PermissionsDto = new PermissionsDto();

    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    clientPermissions: PermissionsDto = new PermissionsDto();
}

export class UpdateAdminDto extends PartialType(CreateAdminDto){}