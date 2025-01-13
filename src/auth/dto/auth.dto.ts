import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { PermissionType } from "../enum";

export class AdminSignupDto {
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
}

export class PermissionsDto {
    @IsNotEmpty()
    adminId : Number;

    @IsNotEmpty()
    @IsEnum(PermissionType)
    permissionType : PermissionType;

    @IsBoolean()
    @IsOptional()
    create: boolean = true;

    @IsBoolean()
    @IsOptional()
    read: boolean = true;

    @IsBoolean()
    @IsOptional()
    update: boolean = true;

    @IsBoolean()
    @IsOptional()
    delete: boolean = true;
}

export class AdminSigninDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9@!#-_]+$/, {
        message: "Only @ ! # - _ alphanumeric characters are allowed"
    })
    password: string;
}