import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminAffiliatesController } from './admin-affiliates.controller';
import { ToolsModule } from '@modules/tools/tools.module';
import { UsersModule } from '@modules/users/users.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { AffiliatesModule } from '@modules/affiliates/affiliates.module';

@Module({
  imports: [ToolsModule, UsersModule, CategoriesModule, AffiliatesModule],
  controllers: [AdminController, AdminAffiliatesController],
})
export class AdminModule {}
