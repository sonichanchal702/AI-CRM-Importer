import { z } from "zod";

export const crmRecordSchema = z.object({
  created_at: z.string().optional().default(""),
  name: z.string().optional().default(""),
  email: z.string().optional().default(""),
  country_code: z.string().optional().default(""),
  mobile_without_country_code: z.string().optional().default(""),
  company: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default(""),
  lead_owner: z.string().optional().default(""),
  crm_status: z.enum(["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE", ""]).optional().default(""),
  crm_note: z.string().optional().default(""),
  data_source: z.enum(["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots", ""]).optional().default(""),
  possession_time: z.string().optional().default(""),
  description: z.string().optional().default(""),
}).refine(
  (record) => record.email.trim() !== "" || record.mobile_without_country_code.trim() !== "",
  { message: "Record must have either email or mobile number" }
);

export const crmRecordArraySchema = z.array(crmRecordSchema);