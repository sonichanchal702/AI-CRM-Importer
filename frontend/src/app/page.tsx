"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/upload-modal";
import { CsvPreviewTable } from "@/components/csv-preview-table";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileConfirmed = (file: File) => {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setCsvColumns(results.meta.fields || []);
      },
    });
  };

  const handleCancelPreview = () => {
    setCsvData([]);
    setCsvColumns([]);
    setFileName("");
  };

  const handleConfirmImport = () => {
    // Next step: call backend AI extraction API here
    console.log("Confirmed import, ready to send to backend:", csvData.length, "rows");
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">AI CRM Importer</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Upload any CRM CSV and let AI map it automatically.
      </p>

      {csvData.length === 0 && (
        <Button onClick={() => setModalOpen(true)}>Upload CSV</Button>
      )}

      <UploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onFileConfirmed={handleFileConfirmed}
      />

      {csvData.length > 0 && (
        <div className="w-full max-w-5xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-muted-foreground">
                {csvData.length} rows · {csvColumns.length} columns
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelPreview}>
                Cancel
              </Button>
              <Button onClick={handleConfirmImport}>Confirm Import</Button>
            </div>
          </div>
          <CsvPreviewTable data={csvData} columns={csvColumns} />
        </div>
      )}
    </main>
  );
}