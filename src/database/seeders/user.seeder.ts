// src/database/seeders/user.seeder.ts

import { hashBcrypt } from 'src/common/utils/app.util';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { ERole } from 'src/common/enums/role.enum';
import { IUser } from 'src/module/user/interface/user.interface';

export class UserSeeder {
  public static async run(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(User);

    const users = [
      {
        email: 'admin@siezal.com',
        password: await hashBcrypt('123456'),
        firstName: 'Admin',
        lastName: 'User',
        role: ERole.ADMIN,
        phone: '+923001234567',
        verifiedAt: new Date()
      }
    ];

    await userRepo.insert(users);
    console.log('✅ User seeded successfully');
  }
}
