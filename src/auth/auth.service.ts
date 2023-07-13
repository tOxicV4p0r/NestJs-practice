import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt/dist";
import { ConfigService } from "@nestjs/config/dist";

@Injectable({})
export class AuthService {
    prisma: PrismaService;

    constructor(prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {
        this.prisma = prisma;
    }

    async signup(dto: AuthDto) {
        const hash = await argon.hash(dto.password);

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            });

            // delete user.hash;
            // return { msg: user };
            return this.signToken(user.id, user.email);
        } catch (error) {
            console.log(error instanceof Prisma.PrismaClientKnownRequestError)
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }

            }
            throw error;
        }
    }

    async login(dto: AuthDto) {

        console.log(dto);
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email,
                }
            });

            if (!user) {
                throw new ForbiddenException('Credentials incorrect');
            }

            const pwMatches = await argon.verify(user.hash, dto.password);

            console.log(pwMatches);
            if (!pwMatches) {
                throw new ForbiddenException('Credentials incorrect');
            }

            return this.signToken(user.id, user.email);
        } catch (error) {
            throw new ForbiddenException('Credentials incorrect');
        }
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email,
        }

        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret,
        });

        return { access_token: token };
    }
}