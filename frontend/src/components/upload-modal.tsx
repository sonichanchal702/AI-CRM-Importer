"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X } from "lucide-react";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileConfirmed: (file: File) => void;
}

export function UploadModal({ open, onOpenChange, onFileConfirmed }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleConfirm = () => {
    if (selectedFile) {
      onFileConfirmed(selectedFile);
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import leads via CSV</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to bulk import leads into your system.
          </p>
        </DialogHeader>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-indigo-500 bg-indigo-50" : "border-border"
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drop your CSV file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
            <p className="text-xs text-muted-foreground mt-3">Supported file: .csv (max 5MB)</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed px-2">
              Any column names work — AI maps them automatically to CRM fields like name, email, mobile, city, and status.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button onClick={() => setSelectedFile(null)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedFile}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Upload File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}