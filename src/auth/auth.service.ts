import { ConflictException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";
import { AdminSigninDto, AdminSignupDto, ClientActivateDto, ClientSigninDto, ClientSignupDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { Admins, Clients } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CustomerStatus, PermissionType } from "./enum";
import { ClientStatus } from "src/cart/enum";

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private jwt: JwtService
    ) { }

    async adminSignup(dto: AdminSignupDto) {

        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const adminCount = await tx.admins.count();

                if (adminCount) {
                    throw new ForbiddenException("You can't signup as a new admin")
                }

                const hashedPassword = await argon.hash(dto.password);

                const superAdmin = await tx.admins.create({
                    data: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        email: dto.email,
                        password: hashedPassword
                    }
                })

                const adminPermissions = await tx.permissions.create({
                    data: {
                        adminId: superAdmin.id,
                        permissionType: PermissionType.admin,
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    }
                })

                const productPermissions = await tx.permissions.create({
                    data: {
                        adminId: superAdmin.id,
                        permissionType: PermissionType.product,
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    }
                })

                const clientPermissions = await tx.permissions.create({
                    data: {
                        adminId: superAdmin.id,
                        permissionType: PermissionType.client,
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    }
                })

                delete superAdmin.password

                return {
                    message: "You have signed up as the super admin. Congratulations!",
                    admin: superAdmin,
                    adminPermissions: adminPermissions,
                    productPermissions: productPermissions,
                    clientPermissions: clientPermissions
                }
            })

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while signing up as admin");
        }

    }

    async adminSignin(dto: AdminSigninDto) {
        const admin = await this.prisma.admins.findUnique({
            where: {
                email: dto.email
            }
        })

        if (!admin) {
            throw new ForbiddenException("There is no admin with this email")
        }

        if (!await argon.verify(admin.password, dto.password)) {
            throw new ForbiddenException("Password is incorrect")
        }

        return {
            access_token: await this.signAdminToken(admin, "admin")
        }
    }

    async signAdminToken(admin: Admins, role: string) {
        delete admin.password
        const payload = {
            sub: admin.id,
            email: admin.email,
            role: role
        }
        const secret = this.config.get('SECRET_KEY')
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '15m',
                secret: secret
            }
        )
        return token;
    }

    async clientSignup (dto : ClientSignupDto) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const client = await tx.clients.findUnique({
                    where : {
                        email : dto.email
                    }
                })
                if(client){
                    throw new ConflictException("Customer already exist with this email")
                }
                const hashedPassword = await argon.hash(dto.password)
                const newClient = await tx.clients.create({
                    data : {
                        firstName : dto.firstName,
                        lastName : dto.lastName,
                        email : dto.email,
                        password : hashedPassword,
                        status : CustomerStatus.active
                    }
                })
                delete newClient.password;
                return newClient;
            })
            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("An error occured while signing up as customer");
        }
    }

    async clientSignin(dto: ClientSigninDto) {
        const client = await this.prisma.clients.findUnique({
            where: {
                email: dto.email
            }
        })

        if (!client) {
            throw new ForbiddenException("There is no customer with this email")
        }

        if(client.status === ClientStatus.inactive) {
            throw new UnprocessableEntityException("You need to activate your account");
        }

        if (!await argon.verify(client.password, dto.password)) {
            throw new ForbiddenException("Password is incorrect")
        }

        return {
            access_token: await this.signClientToken(client, "client")
        }
    }

    async signClientToken(client: Clients, role: string) {
        delete client.password
        const payload = {
            sub: client.id,
            email: client.email,
            role: role
        }
        const secret = this.config.get('SECRET_KEY')
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '15m',
                secret: secret
            }
        )
        return token;
    }

    async clientActivate(dto : ClientActivateDto) {
        const hashedPassword = await argon.hash(dto.password)
        const updatedClient = await this.prisma.clients.update({
            where : { email : dto.email },
            data : {
                firstName : dto.firstName,
                lastName : dto.lastName,
                email : dto.email,
                password : hashedPassword,
                status : CustomerStatus.active
            }
        })
        delete updatedClient.password;
        return updatedClient;
    }
}