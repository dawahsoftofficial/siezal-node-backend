import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: "GuestAuth", async: false })
export class GuestAuthConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    if (process.env.NODE_ENV === "local" || process.env.NODE_ENV === "dev") {
      return true;
    }

    const obj = args.object as any;

    const hasAppKey = obj.payload && obj.payload.trim() !== "";
    const hasAuth = obj.authorization && obj.authorization.trim() !== "";

    if (hasAppKey && hasAuth) return false;
    if (!hasAppKey && !hasAuth) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Either appkey or authorization must be provided, but not both.";
  }
}
