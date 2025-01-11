import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto, UpdateAdminDto, UserDto } from './dto';
import * as argon from "argon2";

@Injectable()
export class AdminService {

    constructor(private prisma: PrismaService) { }

    async checkPermissions(user: UserDto, create: boolean, read: boolean, update: boolean, deelete: boolean) {
        if (user.role !== "admin") {
            return false;
        }

        const admin = await this.prisma.admins.findUnique({
            where: {
                id: user.id
            }
        })

        const adminPermissions = admin.adminPermissions as {
            create: boolean,
            read: boolean,
            update: boolean,
            delete: boolean
        };

        if (
            !(
                (adminPermissions.create && create) ||
                (adminPermissions.read && read) ||
                (adminPermissions.update && update) ||
                (adminPermissions.delete && deelete)
            )
        ) {
            return false;
        }

        return true;
    }

    async createAdmin(user: UserDto, dto: CreateAdminDto) {
        
        if(!this.checkPermissions(user, true, false, false, false)){
            throw new ForbiddenException("You are not authorize for it");
        }

        const alreadyExistAdmin = await this.prisma.admins.findUnique({
            where: {
                email: dto.email
            }
        })

        if (alreadyExistAdmin) {
            throw new ConflictException("Admin already exist with this email");
        }

        const hashedPassword = await argon.hash(dto.password);

        const newAdmin = await this.prisma.admins.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                password: hashedPassword,
                adminPermissions: {
                    create: dto.adminPermissions.create,
                    read: dto.adminPermissions.read,
                    update: dto.adminPermissions.update,
                    delete: dto.adminPermissions.delete
                },
                productPermissions: {
                    create: dto.productPermissions.create,
                    read: dto.productPermissions.read,
                    update: dto.productPermissions.update,
                    delete: dto.productPermissions.delete
                },
                clientPermissions: {
                    create: dto.clientPermissions.create,
                    read: dto.clientPermissions.read,
                    update: dto.clientPermissions.update,
                    delete: dto.clientPermissions.delete
                }
            }
        })

        delete newAdmin.password;

        return {
            message: "Admin created successfully",
            admin: newAdmin
        }
    }

    async getAdmins(user: UserDto) {

        if(!this.checkPermissions(user, false, true, false, false)){
            throw new ForbiddenException("You are not authorize for it");
        }

        const admins = await this.prisma.admins.findMany()
        const filteredAdmins = admins.map(({ password, ...admin }) => admin)
        return {
            message: "List of all the admins",
            admins: filteredAdmins
        }
    }

    async getSpecificAdmin(user: UserDto, id: number) {

        if(!this.checkPermissions(user, false, true, false, false)){
            throw new ForbiddenException("You are not authorize for it");
        }

        const foundAdmin = await this.prisma.admins.findUnique({
            where: {
                id: id
            }
        })

        delete foundAdmin.password;

        return {
            message: "Information of the admin",
            admin: foundAdmin
        }
    }

    async updateSpecificAdmin(user: UserDto, id: number, dto: UpdateAdminDto) {

        if(!this.checkPermissions(user, false, false, true, false)){
            throw new ForbiddenException("You are not authorize for it");
        }

        const updatedAdmin = await this.prisma.admins.update({
            where: {
                id: id
            },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                adminPermissions: {
                    create: dto.adminPermissions.create,
                    read: dto.adminPermissions.read,
                    update: dto.adminPermissions.update,
                    delete: dto.adminPermissions.delete
                },
                productPermissions: {
                    create: dto.productPermissions.create,
                    read: dto.productPermissions.read,
                    update: dto.productPermissions.update,
                    delete: dto.productPermissions.delete
                },
                clientPermissions: {
                    create: dto.clientPermissions.create,
                    read: dto.clientPermissions.read,
                    update: dto.clientPermissions.update,
                    delete: dto.clientPermissions.delete
                }
            }
        })

        delete updatedAdmin.password;

        return {
            message: "Admin has been updated successfully",
            admin: updatedAdmin
        }
    }

    async deleteSpecificAdmin(user: UserDto, id: number) {

        if(!this.checkPermissions(user, false, false, false, true)){
            throw new ForbiddenException("You are not authorize for it");
        }

        await this.prisma.admins.delete({
            where: {
                id: id
            }
        })

        return {
            message: "Admin has been deleted successfully"
        }
    }
}
