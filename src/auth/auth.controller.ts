import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AdminSigninDto, AdminSignupDto, ClientSigninDto, ClientSignupDto } from "./dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Auth')
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

    @Post('customer/signup')
    customerSignup(@Body() dto : ClientSignupDto){
        return this.authService.clientSignup(dto);
    }

    @Post('customer/signin')
    customerSignin(@Body() dto : ClientSigninDto){
        return this.authService.clientSignin(dto);
    }
}