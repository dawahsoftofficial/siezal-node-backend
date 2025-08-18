import { hashBcrypt } from 'src/common/utils/app.util';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { ERole } from 'src/common/enums/role.enum';

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
        verifiedAt: new Date(),
      },
      {
        email: 'john.doe@example.com',
        password: await hashBcrypt('password123'),
        firstName: 'John',
        lastName: 'Doe',
        role: ERole.USER,
        phone: '+923112223334',
        verifiedAt: new Date(),
      },
      {
        email: 'jane.smith@example.com',
        password: await hashBcrypt('password123'),
        firstName: 'Jane',
        lastName: 'Smith',
        role: ERole.USER,
        phone: '+923115556667',
        verifiedAt: new Date(),
      },
      {
        email: 'ahmed.khan@example.com',
        password: await hashBcrypt('password123'),
        firstName: 'Ahmed',
        lastName: 'Khan',
        role: ERole.USER,
        phone: '+923008889990',
        verifiedAt: new Date(),
      },
      {
        email: 'sara.ali@example.com',
        password: await hashBcrypt('password123'),
        firstName: 'Sara',
        lastName: 'Ali',
        role: ERole.USER,
        phone: '+923119998877',
        verifiedAt: new Date(),
      }
    ];

    await userRepo.insert(users);
    console.log('✅ Users seeded successfully');
  }
}
