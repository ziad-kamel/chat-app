import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityModule } from '../common/security/security.module.js';

@Module({
  imports: [
    UserModule,
    SecurityModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports:[AuthModule]
})
export class AuthModule { }
