interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface LibraryHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (folderId: string | null) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (viewMode: "grid" | "list") => void;
  onAddGame: () => void;
}

function LibraryHeader({
  breadcrumbs,
  onBreadcrumbClick,
  viewMode,
  onViewModeChange,
  onAddGame,
}: LibraryHeaderProps) {
  return (
    <header className="bg-gray-950 px-6 py-5">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((item, index) => (
              <div key={item.id ?? "library"} className="flex items-center">
                {index > 0 && <span className="px-1 text-gray-600">/</span>}

                <button
                  type="button"
                  onClick={() => onBreadcrumbClick(item.id)}
                  className="px-1 py-0.5 text-2xl font-bold text-white transition hover:text-gray-300"
                >
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex border border-gray-800">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-2 text-sm font-medium transition ${
                viewMode === "grid"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:bg-gray-900 hover:text-gray-300"
              }`}
            >
              Tiles
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`px-3 py-2 text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:bg-gray-900 hover:text-gray-300"
              }`}
            >
              List
            </button>
          </div>

          <button
            type="button"
            onClick={onAddGame}
            className="bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            + Add Game
          </button>
        </div>
      </div>
    </header>
  );
}

export default LibraryHeader;
