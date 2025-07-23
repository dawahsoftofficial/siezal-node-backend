import { UserService } from '../user.service';
import { UserRouteController } from 'src/common/decorators/app.decorator';

import { ApiTags } from '@nestjs/swagger';

@UserRouteController()
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}


}