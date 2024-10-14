import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor( private prisma: PrismaService){}

    async signup(dto: AuthDto){
        try {
            
            //generate password hash
            const hash = await argon.hash(dto.password)
    
            //save new user
            const user = await this.prisma.user.create({
                data:{
                    email:dto.email,
                    hash
                },
                // select:{
                //     id: true,
                //     email: true,
                //     createdAt: true
                // }
            })
            delete user.hash
    
            return user
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Credentials taken')
                }
            }
            throw error;
            
        }
    }

    async signin(dto: AuthDto){
        //find user by email
        //if user does not exist throw exception
        const user = await this.prisma.user.findUnique({
            where:{
                email: dto.email
            }
        })

        if(!user){
            throw new ForbiddenException('Credentials incorrect')
        }

        //compare password
        //if password is wrong throw an exception
        const pwMatch = await argon.verify(user.hash, dto.password)

        if(!pwMatch){
            throw new ForbiddenException('Credential incorrect')
        }
        delete user.hash
        //send back the user    
        return user
    }
}
