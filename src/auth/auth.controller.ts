import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AdminSigninDto, AdminSignupDto } from "./dto";

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService) {}

    @Post('admin/signup')
    adminSignup(@Body() dto : AdminSignupDto){
        return this.authService.adminSignup(dto);
    }

    @Post('admin/signin')
    adminSignin(@Body() dto : AdminSigninDto){
        return this.authService.adminSignin(dto);
    }
}