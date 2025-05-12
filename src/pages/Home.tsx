import * as React from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Image, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AnimatedCTA: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className }) => (
  <motion.a
    href={href}
    className={cn(
      "inline-block px-8 py-4 rounded-lg text-white font-semibold text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
      className
    )}
    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
    whileTap={{ scale: 0.95 }}
    animate={{
      backgroundImage: [
        "linear-gradient(to right, #3b82f6, #8b5cf6)",
        "linear-gradient(to right, #8b5cf6, #3b82f6)",
        "linear-gradient(to right, #3b82f6, #8b5cf6)",
      ],
      transition: { duration: 3, repeat: Infinity, ease: "linear" },
    }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.a>
);

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-3xl mb-4 text-blue-500">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
  </motion.div>
);

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Transform Your Files with WitConvertix
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Upload, preview, and convert files effortlessly with AI-powered
            intelligence tailored to your needs.
          </motion.p>
          <AnimatedCTA href="/witconvertix/file-uploaded">
            Start Converting Now <ArrowRight className="inline ml-2 h-5 w-5" />
          </AnimatedCTA>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">
            File Upload & Preview Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Seamless File Upload"
              description="Drag and drop up to 6 images (JPG, PNG, WEBP, max 50MB each) or click to select. Duplicate files are automatically blocked."
              icon={<Upload className="h-8 w-8" />}
            />
            <FeatureCard
              title="Interactive Previews"
              description="Zoom in/out, resize, or open images in a new tab. Preview ensures files are ready for conversion."
              icon={<Image className="h-8 w-8" />}
            />
            <FeatureCard
              title="AI-Driven Validation"
              description="AI checks file formats and prevents duplicates, ensuring a smooth upload experience."
              icon={<FileText className="h-8 w-8" />}
            />
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Want to see the code behind our file uploader?
            </p>
            <a
              href="https://github.com/witconvertix/FileUploader.tsx"
              className="text-blue-500 hover:text-blue-600 font-semibold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View FileUploader.tsx on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* AI Conversion Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">
            AI-Powered File Conversion
          </h2>
          <motion.div
            className="flex flex-col md:flex-row items-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="md:w-1/2">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Intelligent Format Detection
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                WitConvertix’s AI analyzes file metadata and content to
                accurately identify formats like PDF (text-based) or images
                (JPG, PNG, WEBP).
              </p>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Smart Conversion Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Based on file type, our AI recommends optimal conversion
                formats:
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>
                    <strong>PDFs</strong>: Convert to DOCX, TXT, HTML, or other
                    text-based formats for editing or sharing.
                  </li>
                  <li>
                    <strong>Images</strong>: Convert JPG, PNG, or WEBP to TIFF,
                    BMP, or other image formats for specific use cases.
                  </li>
                </ul>
              </p>
            </div>
            <div className="md:w-1/2">
              <motion.div
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                animate={{
                  scale: [1, 1.02, 1],
                  transition: { duration: 2, repeat: Infinity },
                }}
              >
                <img
                  src="https://via.placeholder.com/400x300?text=AI+Conversion+Demo"
                  alt="AI Conversion Demo"
                  className="w-full h-auto rounded-md"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Limitations & Uses Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">
            Limitations & Uses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Limitations
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Maximum of 6 files per upload session.</li>
                <li>File size limit of 50MB per file.</li>
                <li>Supported formats: JPG, PNG, WEBP only.</li>
                <li>Duplicate file names are blocked for clarity.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Uses
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  Prepare images for conversion to other formats (e.g., PNG to
                  TIFF).
                </li>
                <li>
                  Preview files before conversion to ensure quality and content.
                </li>
                <li>
                  Organize files for professional or personal projects with
                  ease.
                </li>
                <li>
                  Validate images using zoom and resize for detailed inspection.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Convert Your Files?
          </motion.h2>
          <AnimatedCTA href="/converter">
            Go to File Converter <ArrowRight className="inline ml-2 h-5 w-5" />
          </AnimatedCTA>
        </div>
      </section>

      {/* Footer */}
    </div>
  );
};

export default Home;
