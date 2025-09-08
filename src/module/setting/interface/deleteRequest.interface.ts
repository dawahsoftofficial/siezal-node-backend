import { EDeletionRequestStatus } from "src/common/enums/deletion-request-status.enum";

export interface IDeleteAccountRequest {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    purpose?: string | null;
    comments?: string | null;
    status: EDeletionRequestStatus;
    createdAt: Date;
    updatedAt: Date;
}
  