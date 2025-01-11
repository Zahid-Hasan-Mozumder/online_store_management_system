import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from "class-validator";

export class PermissionsDto {
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

    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    adminPermissions: PermissionsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    productPermissions: PermissionsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => PermissionsDto)
    clientPermissions: PermissionsDto;
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