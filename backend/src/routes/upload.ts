import { Router } from "express";
import multer from "multer";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { extractCrmBatch } from "../services/gemini.service";
import { crmRecordSchema } from "../schemas/crm.schema";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

function parseCsvBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    Readable.from(buffer)
      .pipe(csvParser())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const rawRows = await parseCsvBuffer(req.file.buffer);

    if (rawRows.length === 0) {
      return res.status(400).json({ error: "CSV file is empty" });
    }

    const batches = chunkArray(rawRows, 25);

    const allResults: any[] = [];
    const skippedRecords: any[] = [];

    for (const batch of batches) {
      try {
        const extracted = await extractCrmBatch(batch);

        for (const record of extracted) {
          const validation = crmRecordSchema.safeParse(record);
          if (validation.success) {
            allResults.push(validation.data);
          } else {
            skippedRecords.push({ record, reason: "Missing email and mobile number" });
          }
        }

        const droppedCount = batch.length - extracted.length;
        if (droppedCount > 0) {
          skippedRecords.push({
            record: { note: `${droppedCount} row(s) in this batch excluded by AI` },
            reason: "Excluded by AI — no email or mobile number",
          });
        }
      } catch (batchError) {
        console.error("Batch processing failed:", batchError);
        batch.forEach((row) => skippedRecords.push({ record: row, reason: "AI extraction failed" }));
      }
    }

    res.json({
      totalRows: rawRows.length,
      imported: allResults.length,
      skipped: rawRows.length - allResults.length,
      records: allResults,
      skippedRecords,
    });
  } catch (err) {
    console.error("Import failed:", err);
    res.status(500).json({ error: "Failed to process CSV" });
  }
});

export default router;