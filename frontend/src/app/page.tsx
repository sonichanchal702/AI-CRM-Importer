"use client";

import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/upload-modal";
import { CsvPreviewTable } from "@/components/csv-preview-table";
import { ResultsView } from "@/components/results-table";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Stage = "upload" | "preview" | "processing" | "results";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("upload");
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleFileConfirmed = (file: File) => {
    setFileName(file.name);
    setSelectedFile(file);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setCsvColumns(results.meta.fields || []);
        setStage("preview");
      },
    });
  };

  const handleCancelPreview = () => {
    setCsvData([]);
    setCsvColumns([]);
    setFileName("");
    setSelectedFile(null);
    setStage("upload");
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setStage("processing");
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${API_URL}/api/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setStage("results");
    } catch (err) {
      console.error(err);
      setError("Import failed. Please check the backend server and try again.");
      setStage("preview");
    }
  };

  const handleReset = () => {
    setStage("upload");
    setCsvData([]);
    setCsvColumns([]);
    setFileName("");
    setSelectedFile(null);
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">AI CRM Importer</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Upload any CRM CSV and let AI map it automatically.
      </p>

      {error && (
        <div className="w-full max-w-5xl border border-red-300 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {stage === "upload" && (
        <Button onClick={() => setModalOpen(true)}>Upload CSV</Button>
      )}

      <UploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onFileConfirmed={handleFileConfirmed}
      />

      {stage === "preview" && (
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

      {stage === "processing" && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">AI is mapping your CRM fields...</p>
        </div>
      )}

      {stage === "results" && result && (
        <div className="w-full flex flex-col items-center gap-4">
          <ResultsView result={result} />
          <Button variant="outline" onClick={handleReset}>
            Import Another File
          </Button>
        </div>
      )}
    </main>
  );
}