import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { AdminUserController } from './controller/user-admin.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { AddressModule } from '../address/address.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AddressModule, NotificationModule],
  controllers: [UserController, AdminUserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
