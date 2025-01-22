import { ConflictException, ForbiddenException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto, PaginationDto, UpdateAdminDto, AdminDto } from './dto';
import * as argon from "argon2";
import { PermissionType } from '../auth/enum';

@Injectable()
export class AdminService {

    constructor(private prisma: PrismaService) { }

    async createAdmin(user: AdminDto, dto: CreateAdminDto) {
        
        // Check whether the admin already exist or not
        const alreadyExistAdmin = await this.prisma.admins.findUnique({
            where: { email: dto.email }
        })

        if (alreadyExistAdmin) {
            throw new ConflictException("Admin already exist with this email");
        }

        // Hashing the password using argon
        const hashedPassword = await argon.hash(dto.password);

        // Saving new admin to the database with all the permissions
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const newAdmin = await tx.admins.create({
                    data: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        email: dto.email,
                        password: hashedPassword
                    }
                })
                const adminPermissions = await tx.permissions.create({
                    data: {
                        adminId: newAdmin.id,
                        permissionType: PermissionType.admin,
                        create: dto.adminPermissions.create,
                        read: dto.adminPermissions.read,
                        update: dto.adminPermissions.update,
                        delete: dto.adminPermissions.delete
                    }
                })
                const productPermissions = await tx.permissions.create({
                    data: {
                        adminId: newAdmin.id,
                        permissionType: PermissionType.product,
                        create: dto.productPermissions.create,
                        read: dto.productPermissions.read,
                        update: dto.productPermissions.update,
                        delete: dto.productPermissions.delete
                    }
                })
                const clientPermissions = await tx.permissions.create({
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
            })
            return result;
        } catch (error) {
            throw error instanceof HttpException ? error : new InternalServerErrorException("An error occured while creating the admin");
        }

    }

    async getAdmins(user: AdminDto, pagination: PaginationDto) {
        const page = Number(pagination.page);
        const limit = Number(pagination.limit);

        // Fetching all the admins information from the database
        const admins = await this.prisma.admins.findMany()

        // Pagination information
        const paginationInfo = {
            totalPage: Math.ceil(admins.length / limit),
            totalItems: admins.length,
            currentPage: page,
            currentItems: Math.min(admins.length - ((page - 1) * limit), limit),
            prevPage: (page === 1) ? null : `/admins?page=${page - 1}&limit=${limit}`,
            nextPage: (page === Math.ceil(admins.length / limit)) ? null : `/admins?page=${page + 1}&limit=${limit}`
        }

        // Processing admins information based on pagination and security
        const necessaryAdmins = admins.slice((page - 1) * limit, page * limit);
        const filteredAdmins = necessaryAdmins.map(({ password, ...admin }) => admin)

        return {
            message: "List of all the admins",
            admins: filteredAdmins,
            pagination: paginationInfo
        }
    }

    async getSpecificAdmin(user: AdminDto, id: number) {
        const admin = await this.prisma.admins.findUnique({
            where: { id: id }
        })
        delete admin.password;
        return {
            message: "Information of the admin",
            admin: admin
        }
    }

    async updateSpecificAdmin(user: AdminDto, id: number, dto: UpdateAdminDto) {

        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const updatedAdmin = await tx.admins.update({
                    where: { id: id },
                    data: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        email: dto.email
                    }
                })
                const updatedAdminPermissions = await tx.permissions.update({
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
        
                const updatedProductPermissions = await tx.permissions.update({
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
        
                const updatedClientPermissions = await tx.permissions.update({
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
            })
            return result;
        } catch (error) {
            throw error instanceof HttpException ? error : new InternalServerErrorException("An error occured while updating the admin")
        }
        
    }

    async deleteSpecificAdmin(user: AdminDto, id: number) {
        await this.prisma.admins.delete({
            where: { id: id }
        })
        return { message: "Admin has been deleted successfully" }
    }
}
