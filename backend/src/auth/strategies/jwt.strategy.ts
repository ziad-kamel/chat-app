import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenBlacklistService } from "../services/token-blacklist.service.js";

interface JwtPayload{
    sub: string
    jti: string
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private readonly configService: ConfigService,
        private readonly tokenBlacklistService: TokenBlacklistService,
    ){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey: configService.getOrThrow("JWT_SECRET")
        })
    }
    
    async validate(payload: JwtPayload) {
        if (this.tokenBlacklistService.isRevoked(payload.jti)) {
            return false;
        }
        return {userId: payload.sub}
    }
}