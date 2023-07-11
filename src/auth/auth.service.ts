import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime";

@Injectable({})
export class AuthService {
    prisma: PrismaService;

    constructor(prisma: PrismaService) {
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

            delete user.hash;
            return { msg: user };
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
            if (pwMatches) {
                throw new ForbiddenException('Credentials incorrect');
            }

            delete user.hash;
            return user;
        } catch (error) {
            throw new ForbiddenException('Credentials incorrect');
        }
    }
}