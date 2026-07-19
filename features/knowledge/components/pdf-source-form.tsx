"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { upload } from "@vercel/blob/client";
import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPdfSourceSchema } from "@/features/knowledge/schemas/create-pdf-source-schema";

type PdfSourceFormProps = {
  employeeId: string;
  locale: string;
  onSuccess?: () => void;
};

type FieldErrors = Partial<
  Record<"title" | "file", string>
>;

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function createPdfBlobPath(
  employeeId: string,
  fileName: string,
) {
  const safeFileName = sanitizeFileName(fileName);

  return [
    "knowledge",
    employeeId,
    `${crypto.randomUUID()}-${safeFileName}`,
  ].join("/");
}

function formatFileSize(sizeBytes: number) {
  const megabytes = sizeBytes / (1024 * 1024);

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

export function PdfSourceForm({
  employeeId,
  locale,
  onSuccess,
}: PdfSourceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null,
  );
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  function clearSelectedFile() {
    setFile(null);
    setProgress(0);
    setFieldErrors((current) => ({
      ...current,
      file: undefined,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0] ?? null;

    setMessage(null);
    setProgress(0);
    setFile(selectedFile);

    if (
      selectedFile &&
      title.trim().length === 0
    ) {
      setTitle(
        selectedFile.name.replace(/\.pdf$/i, ""),
      );
    }

    setFieldErrors((current) => ({
      ...current,
      file: undefined,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage(null);
    setFieldErrors({});

    const parsed = createPdfSourceSchema.safeParse({
      employeeId,
      locale,
      title,
      file,
    });

    if (!parsed.success) {
      const nextFieldErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (field === "title" || field === "file") {
          nextFieldErrors[field] ??= issue.message;
        }
      }

      setFieldErrors(nextFieldErrors);
      setMessage(
        "Please correct the highlighted fields.",
      );

      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const pathname = createPdfBlobPath(
        parsed.data.employeeId,
        parsed.data.file.name,
      );

      await upload(pathname, parsed.data.file, {
        access: "private",
        handleUploadUrl:
          "/api/knowledge/pdf/upload",
        contentType: "application/pdf",
        multipart: true,
        clientPayload: JSON.stringify({
          employeeId: parsed.data.employeeId,
          locale: parsed.data.locale,
          title: parsed.data.title,
          fileName: parsed.data.file.name,
          fileSizeBytes: parsed.data.file.size,
        }),
        onUploadProgress: ({
          percentage,
        }) => {
          setProgress(Math.round(percentage));
        },
      });

      setProgress(100);
      setMessage(
        "PDF uploaded successfully. Indexing will start shortly.",
      );

      router.refresh();

      window.setTimeout(() => {
        onSuccess?.();
      }, 700);
    } catch (error) {
      console.error("PDF upload failed:", error);

      setProgress(0);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload the PDF document.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const isSuccessful =
    progress === 100 &&
    message?.startsWith("PDF uploaded") === true;

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="pdf-source-title">
          Title
        </Label>

        <Input
          id="pdf-source-title"
          name="title"
          type="text"
          value={title}
          disabled={isUploading}
          placeholder="Product manual"
          aria-invalid={Boolean(fieldErrors.title)}
          onChange={(event) => {
            setTitle(event.target.value);
            setFieldErrors((current) => ({
              ...current,
              title: undefined,
            }));
          }}
        />

        {fieldErrors.title ? (
          <p className="text-sm text-destructive">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdf-source-file">
          PDF document
        </Label>

        <input
          ref={fileInputRef}
          id="pdf-source-file"
          name="file"
          type="file"
          accept="application/pdf,.pdf"
          disabled={isUploading}
          className="sr-only"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-background">
              <FileText className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUploading}
              aria-label="Remove selected PDF"
              onClick={clearSelectedFile}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:border-primary/60 hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <UploadCloud className="size-6 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              Choose a PDF document
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Maximum file size:{" "}
              {formatFileSize(MAX_FILE_SIZE_BYTES)}
            </p>
          </button>
        )}

        {fieldErrors.file ? (
          <p className="text-sm text-destructive">
            {fieldErrors.file}
          </p>
        ) : null}
      </div>

      {isUploading || progress > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isSuccessful
                ? "Upload complete"
                : "Uploading document"}
            </span>

            <span>{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {message ? (
        <div
          className={
            isSuccessful
              ? "flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-500"
              : "rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {isSuccessful ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : null}

          <span>{message}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Uploading {progress}%
          </>
        ) : (
          <>
            <UploadCloud className="size-4" />
            Upload PDF
          </>
        )}
      </Button>
    </form>
  );
}