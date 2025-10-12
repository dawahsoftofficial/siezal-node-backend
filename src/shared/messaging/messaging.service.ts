import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MetaWhatsappProvider } from "./provider/meta-whatsapp.provider";
import { TwilioProvider } from "./provider/twilio.provider";
import { SettingService } from "src/module/setting/setting.service";
import { EProviderType } from "./interface/message-provider.enum";

@Injectable()
export class MessagingService {
  constructor(
    private readonly config: ConfigService,
    private readonly twilio: TwilioProvider,
    private readonly meta: MetaWhatsappProvider,
    private readonly settingService: SettingService
  ) {}

  async sendWhatsapp(to: string, message: string) {
    return this.meta.sendWhatsapp(to, message);
  }

  async sendSms(to: string, message: string) {
    return this.twilio.sendSms(to, message);
  }

  async sendOtp(to: string, otp: string) {
    const smsServiceData = await this.settingService.fetchSmsService();

    // get all active providers
    const activeProviders = Object.entries(smsServiceData)
      .filter(([_, cfg]) => cfg.active)
      .map(([provider, cfg]) => ({
        type: provider as EProviderType,
        ...cfg,
      }));

    if (activeProviders.length === 0) {
      throw new Error("No active SMS provider found");
    }

    // prioritize primary provider first
    const sortedProviders = [
      ...activeProviders.filter((p) => p.primary),
      ...activeProviders.filter((p) => !p.primary),
    ];

    let lastError: any = null;

    for (const provider of sortedProviders) {
      try {
        if (provider.type === EProviderType.META) {
          return await this.sendWhatsapp(to, otp);
        } else if (provider.type === EProviderType.TWILIO) {
          return await this.sendSms(to, otp);
        } else {
          console.warn(`Unknown provider: ${provider.type}`);
        }
      } catch (err) {
        console.error(`❌ Failed via ${provider.type}:`, err.message);
        lastError = err;
      }
    }

    throw new Error(
      `All SMS providers failed to send OTP. Last error: ${lastError?.message}`
    );
  }

  async makeCall(to: string, url: string) {
    return this.twilio.makeCall(to, url);
  }
}
