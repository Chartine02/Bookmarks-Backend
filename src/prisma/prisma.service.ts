import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
constructor () {
    super({
        datasources:{
            db:{
                url:'postgresql://postgres:Information@25@localhost:5432/nest?schema=public'
            }
        }
    })
}
}
