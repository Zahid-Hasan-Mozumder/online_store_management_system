import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AdminDto } from "../dto";

@Injectable()
export class PermissionGuard implements CanActivate {

    constructor(private readonly reflector : Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        
        const data = this.reflector.get<{ role : string; permission : string }>('data', context.getHandler());
        const request : Express.Request & { user : AdminDto } = context.switchToHttp().getRequest();

        if(request.user?.role !== data.role){
            throw new ForbiddenException("Only admin can access this resource")
        }

        if(
            !(
                (data.permission === "create" && request.user?.adminPermissions.create) ||
                (data.permission === "read" && request.user?.adminPermissions.read) ||
                (data.permission === "update" && request.user?.adminPermissions.update) ||
                (data.permission === "delete" && request.user?.adminPermissions.delete)
            )
        ) {
            throw new ForbiddenException("You don't have permission to access this resource")
        } 

        return true;    
    }
}
