import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserSession } from "src/database/entities/user-session.entity";
import { UserSessionService } from "./user-session.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserSession])],
  providers: [UserSessionService],
  exports: [UserSessionService],
})
export class UserSessionModule {}
