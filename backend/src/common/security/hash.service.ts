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
    async hash(plainText:string):Promise<string>{
        const hashed = await bcrypt.hashSync(plainText, this.SALT_ROUND)
        return hashed
    }

    //create method for comparing
    async compare(plainText:string, hashedText:string):Promise<boolean>{
        return await bcrypt.compareSync(plainText, hashedText)
    }
}