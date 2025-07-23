import {
  BaseEntity as defaultBaseEntity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseEntity extends defaultBaseEntity{
  @PrimaryGeneratedColumn()
  id?: number;

  // Timestamps
  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt: Date;
}
