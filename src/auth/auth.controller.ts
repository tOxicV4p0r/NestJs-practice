import { Body, Controller, Get, Post, Req, ParseIntPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {

    }

    @Post('signup')
    signup(
        @Body() dto: AuthDto
    ) {
        // console.log(dto);
        return this.authService.signup(dto);
    }

    @Get('signin')
    signin() {
        return this.authService.login();
    }

}