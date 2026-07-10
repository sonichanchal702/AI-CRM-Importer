import { GoogleGenerativeAI } from "@google/generative-ai";

const CRM_FIELDS = [
  "created_at", "name", "email", "country_code", "mobile_without_country_code",
  "company", "city", "state", "country", "lead_owner", "crm_status",
  "crm_note", "data_source", "possession_time", "description",
];

const ALLOWED_STATUS = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
const ALLOWED_SOURCE = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];

function buildPrompt(rows: Record<string, string>[]): string {
  return `You are a data extraction engine for a CRM import system. Convert the following raw CSV rows into structured CRM lead records.


RULES:
1. Map each row's fields to these CRM fields: ${CRM_FIELDS.join(", ")}
2. crm_status must be exactly one of: ${ALLOWED_STATUS.join(", ")} or empty string if unclear
3. data_source must be exactly one of: ${ALLOWED_SOURCE.join(", ")} or empty string if no confident match
4. created_at must be a valid date string parseable by JavaScript's new Date()
5. If multiple emails exist in a field, use the first as "email" and append the rest to crm_note
6. If multiple mobile numbers exist, use the first as mobile_without_country_code and append rest to crm_note
7. Put any unmatched but useful info (extra notes, remarks) into crm_note
8. If a row has NEITHER an email NOR a mobile number, exclude it entirely from your output
9. Return ONLY a JSON array of objects, no markdown, no explanation, no code fences


RAW ROWS:
${JSON.stringify(rows, null, 2)}


Return the JSON array now:`;
}



export async function extractCrmBatch(rows: Record<string, string>[]): Promise<any[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = buildPrompt(rows);

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse Gemini response as JSON: ${err}`);
  }
}
