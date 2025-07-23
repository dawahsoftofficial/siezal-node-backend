// src/database/seeders/user.seeder.ts

import { hashBcrypt } from 'src/common/utils/app.util';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { ERole } from 'src/common/enums/role.enum';

export class UserSeeder {
  public static async run(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(User);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await hashBcrypt('12345'),
        firstName: 'Admin',
        lastName: 'User',
        role:ERole.ADMIN
      },
    ];

    await userRepo.insert(users);
    console.log('✅ Users seeded successfully');
  }
}
