import { ForbiddenException, Injectable } from "@nestjs/common";
import { AdminSigninDto, AdminSignupDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { Admins } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PermissionType } from "./enum";

@Injectable()
export class AuthService {

    constructor(
        private prisma : PrismaService,
        private config : ConfigService,
        private jwt : JwtService
    ) {}

    async adminSignup(dto : AdminSignupDto) {
        const adminCount = await this.prisma.admins.count();
        
        if(adminCount){
            throw new ForbiddenException("You can't signup as a new admin")    
        }

        const hashedPassword = await argon.hash(dto.password);

        const superAdmin = await this.prisma.admins.create({
            data : {
                firstName : dto.firstName,
                lastName : dto.lastName,
                email : dto.email,
                password : hashedPassword
            }
        })

        const adminPermissions = await this.prisma.permissions.create({
            data : {
                adminId : superAdmin.id,
                permissionType : PermissionType.admin,
                create : true,
                read : true,
                update : true,
                delete : true
            }
        })

        const productPermissions = await this.prisma.permissions.create({
            data : {
                adminId : superAdmin.id,
                permissionType : PermissionType.product,
                create : true,
                read : true,
                update : true,
                delete : true
            }
        })

        const clientPermissions = await this.prisma.permissions.create({
            data : {
                adminId : superAdmin.id,
                permissionType : PermissionType.client,
                create : true,
                read : true,
                update : true,
                delete : true
            }
        })

        delete superAdmin.password

        return {
            message : "You have signed up as the super admin. Congratulations!",
            admin : superAdmin,
            adminPermissions : adminPermissions,
            productPermissions : productPermissions,
            clientPermissions : clientPermissions
        }
    }

    async adminSignin(dto : AdminSigninDto) {
        const admin = await this.prisma.admins.findUnique({
            where: {
                email : dto.email
            }
        })

        if(!admin){
            throw new ForbiddenException("There is no admin with this email")
        }

        if(!await argon.verify(admin.password, dto.password)){
            throw new ForbiddenException("Password is incorrect")
        }
        
        return {
            access_token : await this.signAdminToken(admin, "admin")
        }
    }

    async signAdminToken(admin : Admins, role : string) {
        delete admin.password
        const payload = {
            sub : admin.id,
            email : admin.email,
            role : role
        }
        const secret = this.config.get('SECRET_KEY')
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn : '15m',
                secret : secret
            }
        )
        return token;
    }
}