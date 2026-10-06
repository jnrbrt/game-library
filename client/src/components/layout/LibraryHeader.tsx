interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface LibraryHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (folderId: string | null) => void;
  onAddGame: () => void;
}

function LibraryHeader({
  breadcrumbs,
  onBreadcrumbClick,
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

        <button
          type="button"
          onClick={onAddGame}
          className="shrink-0 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + Add Game
        </button>
      </div>
    </header>
  );
}

export default LibraryHeader;
