import { Module } from '@nestjs/common';
import { AuthModeule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModeule, UserModule, BookmarkModule,PrismaModule],
})
export class AppModule { }
