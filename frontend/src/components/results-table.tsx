"use client";

import { CsvPreviewTable } from "./csv-preview-table";

interface ImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  records: Record<string, string>[];
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

      {result.records.length > 0 && (
        <CsvPreviewTable data={result.records} columns={columns} />
      )}
    </div>
  );
}