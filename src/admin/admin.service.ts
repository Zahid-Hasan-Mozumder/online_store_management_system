import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto, PaginationDto, UpdateAdminDto, AdminDto } from './dto';
import * as argon from "argon2";
import { PermissionType } from '../auth/enum';

@Injectable()
export class AdminService {

    constructor(private prisma: PrismaService) { }

    async createAdmin(user: AdminDto, dto: CreateAdminDto) {
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
                password: hashedPassword
            }
        })

        const adminPermissions = await this.prisma.permissions.create({
            data: {
                adminId: newAdmin.id,
                permissionType: PermissionType.admin,
                create: dto.adminPermissions.create,
                read: dto.adminPermissions.read,
                update: dto.adminPermissions.update,
                delete: dto.adminPermissions.delete
            }
        })

        const productPermissions = await this.prisma.permissions.create({
            data: {
                adminId: newAdmin.id,
                permissionType: PermissionType.product,
                create: dto.productPermissions.create,
                read: dto.productPermissions.read,
                update: dto.productPermissions.update,
                delete: dto.productPermissions.delete
            }
        })

        const clientPermissions = await this.prisma.permissions.create({
            data: {
                adminId: newAdmin.id,
                permissionType: PermissionType.client,
                create: dto.clientPermissions.create,
                read: dto.clientPermissions.read,
                update: dto.clientPermissions.update,
                delete: dto.clientPermissions.delete
            }
        })

        delete newAdmin.password;

        return {
            message: "Admin created successfully",
            admin: newAdmin,
            adminPermissions: adminPermissions,
            productPermissions: productPermissions,
            clientPermissions: clientPermissions
        }
    }

    async getAdmins(user: AdminDto, pagination : PaginationDto) {
        
        const page = Number(pagination.page);
        const limit = Number(pagination.limit);

        const admins = await this.prisma.admins.findMany()

        const paginationInfo = {
            totalPage : Math.ceil(admins.length / limit),
            totalItems : admins.length,
            currentPage : page,
            currentItems : Math.min(admins.length - ((page - 1) * limit), limit),
            prevPage : (page === 1) ? null : `/admins?page=${page - 1}&limit=${limit}`,
            nextPage : (page === Math.ceil(admins.length / limit)) ? null : `/admins?page=${page + 1}&limit=${limit}`
        }

        const necessaryAdmins = admins.slice((page - 1) * limit, page * limit);

        const filteredAdmins = necessaryAdmins.map(({ password, ...admin }) => admin)
        
        return {
            message: "List of all the admins",
            admins: filteredAdmins,
            pagination: paginationInfo
        }
    }

    async getSpecificAdmin(user: AdminDto, id: number) {
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

    async updateSpecificAdmin(user: AdminDto, id: number, dto: UpdateAdminDto) {
        const updatedAdmin = await this.prisma.admins.update({
            where: {
                id: id
            },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email
            }
        })

        const updatedAdminPermissions = await this.prisma.permissions.update({
            where: {
                id: updatedAdmin.id,
                permissionType: PermissionType.admin
            },
            data: {
                create: dto.adminPermissions.create,
                read: dto.adminPermissions.read,
                update: dto.adminPermissions.update,
                delete: dto.adminPermissions.delete
            }
        })

        const updatedProductPermissions = await this.prisma.permissions.update({
            where: {
                id: updatedAdmin.id,
                permissionType: PermissionType.product
            },
            data: {
                create: dto.productPermissions.create,
                read: dto.productPermissions.read,
                update: dto.productPermissions.update,
                delete: dto.productPermissions.delete
            }
        })

        const updatedClientPermissions = await this.prisma.permissions.update({
            where: {
                id: updatedAdmin.id,
                permissionType: PermissionType.client
            },
            data: {
                create: dto.clientPermissions.create,
                read: dto.clientPermissions.read,
                update: dto.clientPermissions.update,
                delete: dto.clientPermissions.delete
            }
        })

        delete updatedAdmin.password;

        return {
            message: "Admin has been updated successfully",
            admin: updatedAdmin,
            updatedAdminPermissions: updatedAdminPermissions,
            updatedProductPermissions: updatedProductPermissions,
            updatedClientPermissions: updatedClientPermissions
        }
    }

    async deleteSpecificAdmin(user: AdminDto, id: number) {
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
