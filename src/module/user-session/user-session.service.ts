import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { UserSession } from "src/database/entities/user-session.entity";
import { Repository } from "typeorm";
import { IUserSession } from "./interface/user-session.interface";

@Injectable()
export class UserSessionService extends BaseSqlService<
  UserSession,
  IUserSession
> {
  constructor(
    @InjectRepository(UserSession)
    private readonly UserSessionRepository: Repository<UserSession>
  ) {
    super(UserSessionRepository);
  }

  deleteSession = async (sessionId: string, userId: number) => {
    return this.UserSessionRepository.delete({ sessionId, userId });
  };
  findBySessionIdAndRefreshToken = async (
    sessionId: string,
    refreshToken: string
  ) => {
    return this.UserSessionRepository.findOne({
      where: { sessionId, refreshToken },
      relations: {
        user: true,
      },
    });
  };
}
