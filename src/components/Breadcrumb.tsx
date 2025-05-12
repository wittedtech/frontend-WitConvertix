import { useLocation, Link } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x); // Split path into segments

  // Map route segments to display names
  const routeNames: { [key: string]: string } = {
    witconvertix: "WitConvertix",
    "file-uploaded": "File Upload",
    "user-files": "Uploaded Files",
    "output-files": "Converted Files", // Assuming a potential future route
  };

  return (
    <nav className="text-lg font-semibold border-b-2 border-blue-500 pb-1 flex items-center">
      <span className="flex items-center">
        <Link to="/" className="text-gray-600 hover:underline">
          WitConvertix
        </Link>
        {pathnames.length > 0 && <span className="mx-2 text-gray-400"></span>}
      </span>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[value] || value;

        return (
          <span key={to} className="flex items-center">
            <Link
              to={to}
              className={`hover:underline ${
                isLast ? "text-blue-500" : "text-gray-600"
              }`}
            >
              {displayName}
            </Link>
            {!isLast && <span className="mx-2 text-gray-400"></span>}
          </span>
        );
      })}
    </nav>
  );
}
