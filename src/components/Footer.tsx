import { cn } from "@/lib/utils";

function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn(" py-8 bg-gray-800 text-white mx-4 mb-3", className)}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} WitConvertix. All rights reserved to{" "}
          <b>wittedtech</b>.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
