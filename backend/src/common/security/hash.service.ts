import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService{
    private readonly SALT_ROUND: number;

    constructor (private readonly configService: ConfigService){
        const salt = this.configService.get<string>('SALT');
        this.SALT_ROUND = salt ? parseInt(salt,10) : 10
    }

    //create method for hashing
    hash(plainText:string){
        return bcrypt.hashSync(plainText, this.SALT_ROUND)
    }

    //create method for comparing
    compare(plainText:string, hashedText:string){
        return bcrypt.compareSync(plainText, hashedText)
    }
}