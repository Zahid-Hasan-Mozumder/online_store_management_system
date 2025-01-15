import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard";
import { PermissionGuard } from "../guard";

export const AuthorizeAdmin = (data : { role : string, permission : string, activity : string }) => {
    return applyDecorators(
        SetMetadata('data', data),
        UseGuards(JwtGuard, PermissionGuard)
    )
}