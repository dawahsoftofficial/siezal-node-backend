import { ELeadStatus, ELeadType } from "src/common/enums/lead.enum";

export interface ILead {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  purpose?: string | null;
  comments?: string | null;
  status: ELeadStatus;
  type: ELeadType;
  createdAt: Date;
  updatedAt: Date;
}
