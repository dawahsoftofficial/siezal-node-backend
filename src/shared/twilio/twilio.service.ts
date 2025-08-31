import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ELogLevel, ELogType } from "src/common/enums/app.enum";
import { AuditLogService } from "src/module/audit-log/audit-log.service";
import { Twilio } from "twilio";

@Injectable()
export class TwilioService {
  private client: Twilio;

  constructor(
    private config: ConfigService,
    private auditLogService: AuditLogService
  ) {
    this.client = new Twilio(
      this.config.getOrThrow<string>("TWILIO_ACCOUNT_SID"),
      this.config.getOrThrow<string>("TWILIO_AUTH_TOKEN")
    );
  }

  async sendSms(to: string, body: string) {
    try {
      const response = await this.client.messages.create({
        body,
        from: this.config.getOrThrow<string>("TWILIO_PHONE_NUMBER"),
        to,
      });
      const data = await this.generateLogOtp("Send Sms", ELogLevel.INFO, {
        to,
        body,
        status: "SUCCESS",
        sid: response.sid,
      });

      return response;
    } catch (error) {
      await this.generateLogOtp("Send Sms", ELogLevel.ERROR, {
        to,
        body,
        status: "error",
        error: error.message,
      });
    }
  }

  async sendWhatsapp(to: string, body: string) {
    try {
      const response = await this.client.messages.create({
        body,
        from:
          "whatsapp:" + this.config.getOrThrow<string>("TWILIO_PHONE_NUMBER"),
        to: "whatsapp:" + to,
      });

      await this.generateLogOtp("Send whatsapp", ELogLevel.INFO, {
        to,
        body,
        status: "SUCCESS",
        sid: response.sid,
      });

      return response;
    } catch (error) {
      await this.generateLogOtp("Send Whatsapp", ELogLevel.ERROR, {
        to,
        body,
        status: "error",
        error: error.message,
      });
    }
  }

  async makeCall(to: string, url: string) {
    try {
      const response = await this.client.calls.create({
        url, // TwiML Bin or your endpoint returning <Response><Say>...</Say></Response>
        to,
        from: this.config.getOrThrow<string>("TWILIO_PHONE_NUMBER"),
      });
      await this.generateLogOtp("Make Call", ELogLevel.INFO, {
        to,
        url,
        status: "SUCCESS",
        sid: response.sid,
      });

      return response;
    } catch (error) {
      await this.generateLogOtp("make Call", ELogLevel.ERROR, {
        to,
        url,
        status: "ERROR",
        error: error.message,
      });
    }
  }

  private generateLogOtp = async (
    message: string,
    level?: ELogLevel,
    stackTrace?: any
  ) => {
    const data = {
      level: level || ELogLevel.INFO,
      type: ELogType.OTP,
      message: message,
      stackTrace: stackTrace,
    };
    await this.auditLogService.create(data);
  };
}
