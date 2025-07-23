import { UserService } from '../user.service';
import { AdminRouteController, ApplyHeader } from 'src/common/decorators/app.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin users')
@AdminRouteController('users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

}
