import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AdminDto } from "../dto";

@Injectable()
export class PermissionGuard implements CanActivate {

    constructor(private readonly reflector : Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        
        const data = this.reflector.get<{ role : string; permission : String; activity : string }>('data', context.getHandler());
        const request : Express.Request & { user : AdminDto } = context.switchToHttp().getRequest();

        if(request.user?.role !== data.role){
            throw new ForbiddenException("Only admin can access this resource")
        }

        if(
            !(
                (data.permission === "admin" && data.activity === "create" && request.user?.adminPermissions.create) ||
                (data.permission === "admin" && data.activity === "read" && request.user?.adminPermissions.read) ||
                (data.permission === "admin" && data.activity === "update" && request.user?.adminPermissions.update) ||
                (data.permission === "admin" && data.activity === "delete" && request.user?.adminPermissions.delete) ||

                (data.permission === "product" && data.activity === "create" && request.user?.productPermissions.create) ||
                (data.permission === "product" && data.activity === "read" && request.user?.productPermissions.read) ||
                (data.permission === "product" && data.activity === "update" && request.user?.productPermissions.update) ||
                (data.permission === "product" && data.activity === "delete" && request.user?.productPermissions.delete)
            )
        ) {
            throw new ForbiddenException("You don't have permission to access this resource")
        } 

        return true;    
    }
}
