import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function LibrarySwitcher() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMedia = location.pathname.startsWith("/media");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex min-w-0 items-center gap-2 text-left text-2xl font-bold text-white transition hover:text-gray-300"
      >
        <span className="truncate">
          {isMedia ? "Media Library" : "Game Library"}
        </span>

        <span
          className={`shrink-0 text-base text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-3 w-56 border border-gray-700 bg-gray-900 p-1 shadow-2xl"
        >
          <Link
            to="/"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between px-3 py-3 text-sm font-medium transition ${
              !isMedia
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span>🎮 Game Library</span>
            {!isMedia && <span className="text-blue-400">✓</span>}
          </Link>

          <Link
            to="/media"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between px-3 py-3 text-sm font-medium transition ${
              isMedia
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span>🎬 Media Library</span>
            {isMedia && <span className="text-blue-400">✓</span>}
          </Link>
        </div>
      )}
    </div>
  );
}

export default LibrarySwitcher;
