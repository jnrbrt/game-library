import type { Folder } from "../../api/folders";

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

interface FolderNodeProps {
  folder: Folder;
  folders: Folder[];
  depth: number;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

function FolderNode({
  folder,
  folders,
  depth,
  selectedFolderId,
  onFolderSelect,
}: FolderNodeProps) {
  const children = folders.filter((item) => item.parentId === folder.id);

  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onFolderSelect(folder.id)}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
          isSelected
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
        }`}
        style={{
          paddingLeft: `${12 + depth * 20}px`,
        }}
      >
        <span className="text-gray-500">▸</span>

        <span className="truncate">{folder.name}</span>
      </button>

      {children.map((child) => (
        <FolderNode
          key={child.id}
          folder={child}
          folders={folders}
          depth={depth + 1}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
        />
      ))}
    </div>
  );
}

function FolderTree({
  folders,
  selectedFolderId,
  onFolderSelect,
}: FolderTreeProps) {
  const rootFolders = folders.filter((folder) => folder.parentId === null);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onFolderSelect(null)}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
          selectedFolderId === null
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
        }`}
      >
        <span className="text-gray-500">⌂</span>

        <span>Library</span>
      </button>

      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          folders={folders}
          depth={0}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
        />
      ))}
    </div>
  );
}

export default FolderTree;
