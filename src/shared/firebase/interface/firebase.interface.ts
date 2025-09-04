import * as admin from "firebase-admin";
export interface IFcmPayload {
  title: string;
  body: string;
  imageUrl?: string;
  clickAction?: string;
  sound?: string;
  icon?: string;
  data?: Record<string, string>;
}

export interface IFcmResult {
  response: admin.messaging.BatchResponse;
  failedTokens: string[];
}
