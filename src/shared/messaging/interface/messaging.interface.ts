export interface IMessagingProvider {
  sendSms?(to: string, body: string): Promise<any>;
  sendWhatsapp?(to: string, body: string): Promise<any>;
  makeCall?(to: string, url: string): Promise<any>;
}
