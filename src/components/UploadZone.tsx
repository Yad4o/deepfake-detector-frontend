import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFile: (file: File) => void;
  loading: boolean;
  accept?: Record<string, string[]>;
  maxSizeMb?: number;
  label?: string;
}

export default function UploadZone({
  onFile,
  loading,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "video/mp4": [".mp4"],
    "video/avi": [".avi"],
    "video/mov": [".mov"],
    "video/webm": [".webm"],
  },
  maxSizeMb = 200,
  label = "Drop an image or video here",
}: Props) {
  const [sizeError, setSizeError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: unknown[]) => {
      setSizeError(null);
      if (rejected && (rejected as []).length > 0) {
        setSizeError(`File rejected — check type/size (max ${maxSizeMb} MB)`);
        return;
      }
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile, maxSizeMb]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMb * 1024 * 1024,
    multiple: false,
    disabled: loading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-brand-500 bg-brand-500/10"
            : "border-gray-700 hover:border-gray-500"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">
          {loading ? (
            <span className="inline-block animate-spin">&#9696;</span>
          ) : (
            <span>&#8682;</span>
          )}
        </div>
        <p className="text-gray-300 font-medium">
          {loading ? "Analyzing..." : isDragActive ? "Drop it!" : label}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          or click to select &bull; max {maxSizeMb} MB
        </p>
      </div>
      {sizeError && (
        <p className="text-red-400 text-sm mt-2 text-center">{sizeError}</p>
      )}
    </div>
  );
}
