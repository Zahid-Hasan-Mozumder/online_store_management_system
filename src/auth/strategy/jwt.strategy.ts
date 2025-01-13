import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { PermissionType } from "../enum";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(
        private config: ConfigService,
        private prisma: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('SECRET_KEY')
        })
    }

    async validate(payload: any) {
        if (payload.role === "admin") {
            const admin = await this.prisma.admins.findUnique({
                where: {
                    id: payload.sub
                },
                include: {
                    permissions: true
                }
            })
            return {
                id: payload.sub,
                email: admin.email,
                adminPermissions: admin.permissions.find(permission => permission.permissionType === PermissionType.admin),
                productPermissions: admin.permissions.find(permission => permission.permissionType === PermissionType.product),
                clientPermissions: admin.permissions.find(permission => permission.permissionType === PermissionType.client),
                role: payload.role
            }
        } else {
            return {
                id: payload.sub,
                email: payload.email,
                role: payload.role
            }
        }

    }
}