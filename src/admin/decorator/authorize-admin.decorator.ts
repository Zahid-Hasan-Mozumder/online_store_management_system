import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { permission } from "process";
import { JwtGuard } from "src/auth/guard";
import { PermissionGuard } from "../guard";

export const AuthorizeAdmin = (data : { role : string, permission : string }) => {
    return applyDecorators(
        SetMetadata('data', data),
        UseGuards(JwtGuard, PermissionGuard)
    )
}