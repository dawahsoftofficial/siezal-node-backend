import { Module } from '@nestjs/common';
import { AdminStaffController } from './controller/staff-admin.controller';
import { StaffService } from './staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Branch } from 'src/database/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Branch])],
  controllers: [AdminStaffController],
  providers: [StaffService],
  exports: [StaffService]
})
export class StaffModule { }
