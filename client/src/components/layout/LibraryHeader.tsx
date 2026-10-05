interface LibraryHeaderProps {
  onAddGame: () => void;
}

function LibraryHeader({ onAddGame }: LibraryHeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-950 px-6 py-5">
      <div className="flex w-full items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Library</h2>

          <p className="mt-1 text-sm text-gray-500">Your game collection</p>
        </div>

        <button
          type="button"
          onClick={onAddGame}
          className="bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + Add Game
        </button>
      </div>
    </header>
  );
}

export default LibraryHeader;
