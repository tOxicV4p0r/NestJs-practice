import { Injectable } from "@nestjs/common";

@Injectable({})

export class AuthService {
    login() {
        return { msg: "signed up" };
    }

    signup() {
        return { msg: "signing in" };
    }
}