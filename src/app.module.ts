import { Module } from '@nestjs/common';
import { AuthModeule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [AuthModeule, UserModule, BookmarkModule],
})
export class AppModule {}
