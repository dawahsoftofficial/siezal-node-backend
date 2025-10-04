import { Module } from '@nestjs/common';
import { AdminStaffController } from './controller/staff-admin.controller';
import { StaffService } from './staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminStaffController],
  providers: [StaffService],
  exports: [StaffService]
})
export class StaffModule { }
