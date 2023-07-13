import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config"
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService, private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET'),
        })
    }

    async validate(payload: { sub: number, email: string }) {
        console.log('validate');
        console.log(payload);

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            }
        })

        delete user.hash;
        console.log(user);
        return user;
    }
} 