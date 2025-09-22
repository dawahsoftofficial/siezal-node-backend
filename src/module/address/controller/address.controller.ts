import { ApiTags } from "@nestjs/swagger";
import { PublicRouteController } from "src/common/decorators/app.decorator";
import { AddressService } from "../address.service";

@ApiTags("User Address Management")
@PublicRouteController("address")
export class AddressController {
  constructor(private readonly addressService: AddressService) { }
}
