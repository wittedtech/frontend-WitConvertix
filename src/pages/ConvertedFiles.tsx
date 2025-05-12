import * as React from "react";
import { File } from "lucide-react";
import { toast } from "react-toastify";

interface ConvertedFile {
  name: string;
  url: string;
}

export default function ConvertedFiles() {
  const [convertedFiles, setConvertedFiles] = React.useState<ConvertedFile[]>(
    []
  );

  React.useEffect(() => {
    const fetchConvertedFiles = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/files/converted`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch converted files");
        }
        const data = await response.json();
        setConvertedFiles(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch converted files");
      }
    };
    fetchConvertedFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">
            Converted Files
          </h2>
          {convertedFiles.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">
              No converted files found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedFiles.map((cf) => (
                <div
                  key={cf.url}
                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-2">
                    <File className="h-8 w-8 text-green-500" />
                    <div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
