"use client";

import { CsvPreviewTable } from "./csv-preview-table";

interface SkippedRecord {
  record: Record<string, string>;
  reason: string;
}

interface ImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  records: Record<string, string>[];
  skippedRecords?: SkippedRecord[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    GOOD_LEAD_FOLLOW_UP: "text-[var(--status-good)] bg-[var(--status-good-bg)]",
    DID_NOT_CONNECT: "text-[var(--status-dnc)] bg-[var(--status-dnc-bg)]",
    BAD_LEAD: "text-[var(--status-bad)] bg-[var(--status-bad-bg)]",
    SALE_DONE: "text-[var(--status-sale)] bg-[var(--status-sale-bg)]",
  };
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className={`text-xs font-mono px-2 py-1 rounded ${styles[status] || ""}`}>
      {status}
    </span>
  );
}

export function ResultsView({ result }: { result: ImportResult }) {
  const columns = result.records.length > 0 ? Object.keys(result.records[0]) : [];

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-semibold">{result.totalRows}</p>
          <p className="text-sm text-muted-foreground">Total Rows</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-semibold text-green-600">{result.imported}</p>
          <p className="text-sm text-muted-foreground">Imported</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-semibold text-amber-600">{result.skipped}</p>
          <p className="text-sm text-muted-foreground">Skipped</p>
        </div>
      </div>

      {result.skippedRecords && result.skippedRecords.length > 0 && (
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer text-sm font-medium">
            View {result.skippedRecords.length} skipped record(s)
          </summary>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            {result.skippedRecords.map((s, i) => (
              <li key={i}>
                {s.reason} — {JSON.stringify(s.record).slice(0, 80)}...
              </li>
            ))}
          </ul>
        </details>
      )}

      {result.records.length > 0 && (
        <CsvPreviewTable data={result.records} columns={columns} />
      )}
    </div>
  );
}