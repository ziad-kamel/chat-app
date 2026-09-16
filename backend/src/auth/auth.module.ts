import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityModule } from '../common/security/security.module.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule.register({defaultStrategy:'jwt'}),
    UserModule,
    SecurityModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5m' }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtAuthGuard,JwtStrategy],
  exports:[JwtAuthGuard]
})
export class AuthModule { }
