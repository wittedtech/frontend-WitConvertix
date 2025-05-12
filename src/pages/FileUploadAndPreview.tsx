import * as React from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  File,
  FileText,
  AudioLines,
  Video,
  FileImage,
  AlertCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import mammoth from "mammoth";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

interface FilePreview {
  file: File;
  fileId: string;
  preview: string;
  eligibleFormats: string[];
  selectedFormat: string | null;
  type: "textual" | "playable";
  textContent?: string;
}

interface ConvertedFile {
  name: string;
  url: string;
}

export default function FileUploaderAndPreview({
  onFilesChange,
  maxFiles = 6,
  maxSize = 50 * 1024 * 1024, // 50MB
}: FileUploaderProps) {
  const [filePreviews, setFilePreviews] = React.useState<FilePreview[]>([]);
  const [convertedFiles, setConvertedFiles] = React.useState<ConvertedFile[]>(
    []
  );
  const [convertingFiles, setConvertingFiles] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [conversionProgress, setConversionProgress] = React.useState(0);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(
    null
  );

  // Check authentication status and reset guest files on login
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );
        const wasAuthenticated = isAuthenticated;
        setIsAuthenticated(response.ok);
        console.log("Auth check response:", {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!wasAuthenticated && response.ok && filePreviews.length > 0) {
          console.log("User logged in, resetting guest files:", filePreviews);
          filePreviews.forEach((fp) => URL.revokeObjectURL(fp.preview));
          setFilePreviews([]);
          setConvertedFiles([]);
          onFilesChange([]);
          toast.info(
            "Please re-upload your files to continue as a logged-in user.",
            {
              autoClose: 5000,
            }
          );
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      }
    };
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, filePreviews, onFilesChange]);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);
      const newFilePreviews = [...filePreviews];

      for (const file of acceptedFiles) {
        if (newFilePreviews.length >= maxFiles) {
          toast.error(`Max ${maxFiles} files allowed at a time.`);
          return;
        }
        if (newFilePreviews.some((fp) => fp.file.name === file.name)) {
          setError(`Duplicate file "${file.name}" is not allowed.`);
          return;
        }

        const mimeType = file.type || "application/octet-stream";
        const preview = URL.createObjectURL(file);
        const type =
          mimeType.startsWith("audio") || mimeType.startsWith("video")
            ? "playable"
            : "textual";

        let fileId = "";
        let eligibleFormats: string[] = [];
        try {
          console.log("Uploading file:", {
            name: file.name,
            isAuthenticated,
            url: `${import.meta.env.VITE_BACKEND_URL}/api/files/upload`,
          });
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/files/upload`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
            }
          );
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to upload file");
          }
          const data = await response.json();
          fileId = data.fileId;
          eligibleFormats = data.eligibleFormats;
          console.log("Upload response:", data);
        } catch (err: any) {
          console.error("Upload error:", err);
          toast.error(err.message || "Failed to upload file");
          continue;
        }

        let textContent: string | undefined;
        if (
          mimeType === "application/msword" ||
          mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            textContent = result.value.slice(0, 500);
          } catch (err) {
            console.error("DOCX extract error:", err);
          }
        }

        newFilePreviews.push({
          file,
          fileId,
          preview,
          eligibleFormats,
          selectedFormat: null,
          type,
          textContent,
        });
      }

      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0].errors[0];
        if (firstError.code === "file-too-large") {
          setError(
            `File is too large. Max size is ${maxSize / 1024 / 1024}MB.`
          );
        } else if (firstError.code === "file-invalid-type") {
          setError(
            "Unsupported file type. Supported types include images (jpg, png, webp), PDFs, Word docs, audio (mp3), and videos (mp4)."
          );
        } else {
          setError("Invalid file. Please try again.");
        }
      }

      setFilePreviews(newFilePreviews);
      onFilesChange(newFilePreviews.map((fp) => fp.file));

      if (isAuthenticated === false) {
        toast.info("Log in to save your converted files for future use.", {
          autoClose: 5000,
        });
      }
    },
    [filePreviews, maxFiles, maxSize, onFilesChange, isAuthenticated]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "audio/mpeg": [".mp3"],
      "video/mp4": [".mp4"],
    },
    maxFiles,
    maxSize,
    onDrop,
  });

  const removeFile = (index: number) => {
    const newFilePreviews = filePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(filePreviews[index].preview);
    setFilePreviews(newFilePreviews);
    onFilesChange(newFilePreviews.map((fp) => fp.file));
  };

  const handleFormatChange = (index: number, format: string) => {
    setFilePreviews((prev) =>
      prev.map((fp, i) =>
        i === index ? { ...fp, selectedFormat: format } : fp
      )
    );
  };

  const handleConvert = async (index: number) => {
    if (convertingFiles.length > 0) {
      toast.error(
        "A conversion is in progress. Please wait until it completes."
      );
      return;
    }

    const preview = filePreviews[index];
    if (!preview.selectedFormat) {
      toast.error("Please select a format to convert to.");
      return;
    }

    setConvertingFiles([preview.fileId]);
    setConversionProgress(0);
    try {
      console.log("Converting file:", {
        fileId: preview.fileId,
        targetFormat: preview.selectedFormat,
        url: `${import.meta.env.VITE_BACKEND_URL}/api/files/convert`,
        isAuthenticated,
      });
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/files/convert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: preview.fileId,
            targetFormat: preview.selectedFormat,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("Convert error response:", data);
        throw new Error(data.error || "Failed to convert file");
      }

      const data = await response.json();
      console.log("Convert response:", data);
      setConvertedFiles((prev) => [
        ...prev,
        { name: data.fileName, url: data.downloadUrl },
      ]);
      setConversionProgress(100);
      toast.success(
        `Converted ${preview.file.name} to ${preview.selectedFormat}`
      );
    } catch (err: any) {
      console.error("Convert error:", err);
      toast.error(err.message || "Failed to convert file");
    } finally {
      setConvertingFiles([]);
    }
  };

  const handleConvertAll = async () => {
    if (convertingFiles.length > 0) {
      toast.error(
        "A conversion is in progress. Please wait until it completes."
      );
      return;
    }

    const validFiles = filePreviews.filter((fp) => fp.selectedFormat);
    if (validFiles.length === 0) {
      toast.error("Please select a conversion format for at least one file.");
      return;
    }

    setConvertingFiles(validFiles.map((fp) => fp.fileId));
    setConversionProgress(0);
    try {
      for (let index = 0; index < validFiles.length; index++) {
        const preview = validFiles[index];
        console.log("Converting file (all):", {
          fileId: preview.fileId,
          targetFormat: preview.selectedFormat,
          url: `${import.meta.env.VITE_BACKEND_URL}/api/files/convert`,
          isAuthenticated,
        });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/files/convert`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: preview.fileId,
              targetFormat: preview.selectedFormat,
            }),
            credentials: "include",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          console.error("Convert error response (all):", data);
          throw new Error(
            data.error || `Failed to convert ${preview.file.name}`
          );
        }

        const data = await response.json();
        console.log("Convert response (all):", data);
        setConvertedFiles((prev) => [
          ...prev,
          { name: data.fileName, url: data.downloadUrl },
        ]);
        setConversionProgress(((index + 1) / validFiles.length) * 100);
        toast.success(
          `Converted ${preview.file.name} to ${preview.selectedFormat}`
        );
      }
    } catch (err: any) {
      console.error("Convert error (all):", err);
      toast.error(err.message || "Some files failed to convert.");
    } finally {
      setConvertingFiles([]);
    }
  };

  const handleDownloadAll = () => {
    convertedFiles.forEach((cf) => {
      const link = document.createElement("a");
      link.href = cf.url;
      link.download = cf.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleFileClick = (file: File) => {
    const url = URL.createObjectURL(file);
    const newTab = window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (!newTab) {
      setError("Failed to open file. Please allow pop-ups and try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPreviewIcon = (fileType: string) => {
    if (fileType.startsWith("image"))
      return <FileImage className="h-12 w-12 text-blue-500" />;
    if (fileType === "application/pdf")
      return <FileText className="h-12 w-12 text-red-500" />;
    if (fileType.startsWith("audio"))
      return <AudioLines className="h-12 w-12 text-green-500" />;
    if (fileType.startsWith("video"))
      return <Video className="h-12 w-12 text-purple-500" />;
    if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return <FileText className="h-12 w-12 text-blue-600" />;
    return <File className="h-12 w-12 text-gray-500" />;
  };

  const groupedFiles = filePreviews.reduce((acc, fp) => {
    let group: string;
    if (fp.file.type.startsWith("image")) group = "Images";
    else if (fp.file.type === "application/pdf") group = "PDFs";
    else if (fp.file.type.startsWith("audio")) group = "Audio";
    else if (fp.file.type.startsWith("video")) group = "Videos";
    else if (
      fp.file.type === "application/msword" ||
      fp.file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      group = "Documents";
    else group = "Other";
    acc[group] = acc[group] || [];
    acc[group].push(fp);
    return acc;
  }, {} as Record<string, FilePreview[]>);

  React.useEffect(() => {
    return () => {
      filePreviews.forEach((fp) => URL.revokeObjectURL(fp.preview));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8 md:mb-12">
            Upload Your Files
          </h2>
          <div className="space-y-6">
            {isAuthenticated === false && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-md"
              >
                <AlertCircle className="h-5 w-5" />
                <p>
                  You are not logged in. Converted files will not be saved for
                  future use.{" "}
                  <a href="/login" className="underline hover:text-yellow-700">
                    Log in
                  </a>{" "}
                  to save your files.
                </p>
              </motion.div>
            )}
            <motion.div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                  : "border-gray-300 hover:border-blue-400",
                "bg-white dark:bg-gray-800"
              )}
              initial={{ scale: 1 }}
              animate={{ scale: isDragActive ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Input {...getInputProps()} className="hidden" />
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Upload className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </motion.div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {isDragActive
                    ? "Drop your files here!"
                    : "Drag & drop files or click to upload"}
                </p>
                <Button
                  variant="outline"
                  className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                >
                  Select Files
                </Button>
                <p className="text-xs text-gray-400 mt-1">
                  Supports images (jpg, png, webp), PDFs, Word docs, audio
                  (mp3), videos (mp4) (max {maxFiles} files,{" "}
                  {maxSize / 1024 / 1024}MB each)
                </p>
              </div>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            {filePreviews.length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupedFiles).map(([group, files]) => (
                  <div key={group} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        {group} ({files.length})
                      </h3>
                      {filePreviews.length > 1 && (
                        <Button
                          onClick={handleConvertAll}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                          disabled={convertingFiles.length > 0}
                        >
                          Convert All
                        </Button>
                      )}
                    </div>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      layout
                    >
                      <AnimatePresence>
                        {files.map((fp, index) => (
                          <motion.div
                            key={fp.fileId}
                            className="relative border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div
                              className="relative overflow-hidden rounded-md max-h-64 cursor-pointer"
                              onClick={() => handleFileClick(fp.file)}
                            >
                              {fp.type === "textual" ? (
                                fp.file.type.startsWith("image") ? (
                                  <img
                                    src={fp.preview}
                                    alt={fp.file.name}
                                    className="w-full h-auto rounded-md object-cover max-h-48"
                                  />
                                ) : fp.file.type === "application/pdf" ? (
                                  <iframe
                                    src={fp.preview}
                                    className="w-full h-48 rounded-md"
                                    title={fp.file.name}
                                  />
                                ) : fp.textContent ? (
                                  <div className="w-full h-48 p-2 overflow-auto bg-gray-100 dark:bg-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-300">
                                    {fp.textContent}
                                  </div>
                                ) : (
                                  <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-md">
                                    {getPreviewIcon(fp.file.type)}
                                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[90%]">
                                      {fp.file.name}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      {formatFileSize(fp.file.size)}
                                    </p>
                                  </div>
                                )
                              ) : (
                                <ReactPlayer
                                  url={fp.preview}
                                  controls
                                  width="100%"
                                  height="192px"
                                  className="rounded-md"
                                />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 text-red-500 hover:text-red-600 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(
                                  filePreviews.findIndex(
                                    (f) => f.fileId === fp.fileId
                                  )
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Label className="block mt-2 text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                              {fp.file.name}
                            </Label>
                            <div className="mt-2 flex items-center space-x-2">
                              <Select
                                onValueChange={(value) =>
                                  handleFormatChange(
                                    filePreviews.findIndex(
                                      (f) => f.fileId === fp.fileId
                                    ),
                                    value
                                  )
                                }
                                value={fp.selectedFormat || ""}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800">
                                  {fp.eligibleFormats.map((format, i) => (
                                    <SelectItem key={i} value={format}>
                                      {format.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className={cn(
                                  "transition-colors",
                                  fp.selectedFormat
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                                    : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConvert(
                                    filePreviews.findIndex(
                                      (f) => f.fileId === fp.fileId
                                    )
                                  );
                                }}
                                disabled={
                                  !fp.selectedFormat ||
                                  convertingFiles.length > 0
                                }
                                aria-label="Convert file to selected format"
                              >
                                {convertingFiles.includes(fp.fileId)
                                  ? "Converting..."
                                  : "Convert"}
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}

            {convertingFiles.length > 0 && (
              <motion.div
                className="space-y-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Converting Files
                </h3>
                <div className="border-2 border-dashed rounded-lg p-6 bg-white dark:bg-gray-800">
                  <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.svg
                      className="h-12 w-12 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                    >
                      <path d="M12 2v4m0 12v4m-6.36-2.36l-2.83-2.83m12.73 2.83l2.83-2.83M2 12h4m12-4l2.83-2.83M6.36 18.36l-2.83 2.83M18 12h4" />
                    </motion.svg>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Processing {convertingFiles.length} file(s)...
                    </p>
                    <Progress
                      value={conversionProgress}
                      className="w-full md:w-[60%]"
                    />
                    <p className="text-xs text-gray-400">
                      {conversionProgress.toFixed(0)}% Complete
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {convertedFiles.length > 0 && (
              <motion.div
                className="space-y-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Converted Files
                  </h3>
                  {convertedFiles.length > 1 && (
                    <Button
                      onClick={handleDownloadAll}
                      className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  )}
                </div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  layout
                >
                  <AnimatePresence>
                    {convertedFiles.map((cf, index) => (
                      <motion.div
                        key={cf.url}
                        className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-2">
                          <File className="h-8 w-8 text-green-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                              {cf.name}
                            </p>
                            <a
                              href={cf.url}
                              download
                              className="text-blue-500 hover:underline text-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = cf.url;
                              }}
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
