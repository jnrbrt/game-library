import { useState, type DragEvent } from "react";
import type { Folder } from "../../api/folders";

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderActions: (folder: Folder) => void;
  onFolderActionsClose: () => void;
  actionFolderId: string | null;
  onFolderRename: (folder: Folder) => void;
  isRenamingFolder: boolean;
  renameFolderName: string;
  onRenameFolderNameChange: (value: string) => void;
  onRenameSave: () => void;
  onFolderDelete: (folder: Folder) => void;
  confirmDeleteFolder: boolean;
  onDeleteRequest: (folder: Folder) => void;
  onDeleteCancel: () => void;
  isDeletingFolder: boolean;
  onGameDrop: (folderId: string, gameId: string) => void;
  onFolderDrop: (folderId: string, sourceFolderId: string) => void;
  onFolderDropToRoot: (sourceFolderId: string) => void;
}

interface FolderNodeProps {
  folder: Folder;
  folders: Folder[];
  depth: number;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderActions: (folder: Folder) => void;
  onFolderActionsClose: () => void;
  actionFolderId: string | null;
  onFolderRename: (folder: Folder) => void;
  isRenamingFolder: boolean;
  renameFolderName: string;
  onRenameFolderNameChange: (value: string) => void;
  onRenameSave: () => void;
  onFolderDelete: (folder: Folder) => void;
  confirmDeleteFolder: boolean;
  onDeleteRequest: (folder: Folder) => void;
  onDeleteCancel: () => void;
  isDeletingFolder: boolean;
  onGameDrop: (folderId: string, gameId: string) => void;
  onFolderDrop: (folderId: string, sourceFolderId: string) => void;
}

function FolderNode({
  folder,
  folders,
  depth,
  selectedFolderId,
  onFolderSelect,
  onFolderActions,
  onFolderActionsClose,
  actionFolderId,
  onFolderRename,
  isRenamingFolder,
  renameFolderName,
  onRenameFolderNameChange,
  onRenameSave,
  onFolderDelete,
  confirmDeleteFolder,
  onDeleteRequest,
  onDeleteCancel,
  isDeletingFolder,
  onGameDrop,
  onFolderDrop,
}: FolderNodeProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const children = folders.filter((item) => item.parentId === folder.id);

  const isSelected = selectedFolderId === folder.id;
  const isActionsOpen = actionFolderId === folder.id;

  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData("application/x-folder-id", folder.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    const types = event.dataTransfer.types;

    if (
      !types.includes("application/x-game-id") &&
      !types.includes("application/x-folder-id")
    ) {
      return;
    }

    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    const types = event.dataTransfer.types;

    if (
      !types.includes("application/x-game-id") &&
      !types.includes("application/x-folder-id")
    ) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget;

    if (
      relatedTarget instanceof Node &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const sourceFolderId = event.dataTransfer.getData(
      "application/x-folder-id",
    );

    if (sourceFolderId) {
      if (sourceFolderId === folder.id) {
        return;
      }

      onFolderDrop(folder.id, sourceFolderId);
      return;
    }

    const gameId = event.dataTransfer.getData("application/x-game-id");

    if (!gameId) {
      return;
    }

    onGameDrop(folder.id, gameId);
  };

  return (
    <div className="group min-w-0">
      <div className="flex min-w-0 items-center">
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`min-w-0 flex-1 border transition ${
            isDragOver
              ? "border-sky-500 bg-sky-500/15 shadow-[0_0_18px_rgba(14,165,233,0.18)]"
              : "border-transparent"
          }`}
        >
          <button
            type="button"
            draggable
            onDragStart={handleDragStart}
            onClick={() => onFolderSelect(folder.id)}
            className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-sm transition ${
              isDragOver
                ? "text-sky-200"
                : isSelected
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
            }`}
            style={{
              paddingLeft: `${12 + depth * 20}px`,
            }}
          >
            <span
              className={`shrink-0 transition ${
                isDragOver ? "text-sky-300" : "text-gray-500"
              }`}
            >
              ▸
            </span>

            <span className="min-w-0 flex-1 truncate" title={folder.name}>
              {folder.name}
            </span>

            <span
              className={`shrink-0 text-xs ${
                isDragOver ? "text-sky-300" : "text-gray-500"
              }`}
            >
              {folder.gameCount}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            if (isActionsOpen) {
              onFolderActionsClose();
            } else {
              onFolderActions(folder);
            }
          }}
          className={`mr-2 shrink-0 self-stretch px-3 text-lg leading-none transition ${
            isSelected
              ? "bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white"
              : "text-gray-600 hover:bg-gray-800/60 hover:text-white"
          }`}
          aria-label={`Actions for ${folder.name}`}
          title="Folder actions"
        >
          ⋯
        </button>
      </div>

      {isActionsOpen && (
        <div
          className="border border-gray-800 bg-gray-900 p-3"
          style={{
            marginLeft: `${12 + depth * 20}px`,
            marginRight: "8px",
          }}
        >
          {isRenamingFolder ? (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Rename folder
              </p>

              <input
                type="text"
                value={renameFolderName}
                onChange={(event) =>
                  onRenameFolderNameChange(event.target.value)
                }
                autoFocus
                className="mb-3 w-full border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onRenameSave}
                  className="flex-1 border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={onFolderActionsClose}
                  className="border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-800 hover:text-white"
                >
                  ×
                </button>
              </div>
            </>
          ) : confirmDeleteFolder ? (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">
                Delete folder
              </p>

              <p
                className="mb-3 truncate text-sm text-gray-400"
                title={folder.name}
              >
                Delete "{folder.name}"?
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onFolderDelete(folder)}
                  disabled={isDeletingFolder}
                  className="flex-1 border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDeletingFolder ? "Deleting..." : "Delete"}
                </button>

                <button
                  type="button"
                  onClick={onDeleteCancel}
                  disabled={isDeletingFolder}
                  className="border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-800 hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p
                className="mb-3 truncate text-xs font-semibold uppercase tracking-wider text-gray-500"
                title={folder.name}
              >
                {folder.name}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onFolderRename(folder)}
                  className="flex-1 border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white"
                >
                  Rename
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteRequest(folder)}
                  className="border border-red-500/30 bg-gray-900 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950/40 hover:text-red-300"
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={onFolderActionsClose}
                  className="border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-800 hover:text-white"
                >
                  ×
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {children.map((child) => (
        <FolderNode
          key={child.id}
          folder={child}
          folders={folders}
          depth={depth + 1}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
          onFolderActions={onFolderActions}
          onFolderActionsClose={onFolderActionsClose}
          actionFolderId={actionFolderId}
          onFolderRename={onFolderRename}
          isRenamingFolder={isRenamingFolder}
          renameFolderName={renameFolderName}
          onRenameFolderNameChange={onRenameFolderNameChange}
          onRenameSave={onRenameSave}
          onFolderDelete={onFolderDelete}
          confirmDeleteFolder={confirmDeleteFolder}
          onDeleteRequest={onDeleteRequest}
          onDeleteCancel={onDeleteCancel}
          isDeletingFolder={isDeletingFolder}
          onGameDrop={onGameDrop}
          onFolderDrop={onFolderDrop}
        />
      ))}
    </div>
  );
}

function FolderTree({
  folders,
  selectedFolderId,
  onFolderSelect,
  onFolderActions,
  onFolderActionsClose,
  actionFolderId,
  onFolderRename,
  isRenamingFolder,
  renameFolderName,
  onRenameFolderNameChange,
  onRenameSave,
  onFolderDelete,
  confirmDeleteFolder,
  onDeleteRequest,
  onDeleteCancel,
  isDeletingFolder,
  onGameDrop,
  onFolderDrop,
  onFolderDropToRoot,
}: FolderTreeProps) {
  const [isRootDragOver, setIsRootDragOver] = useState(false);

  const rootFolders = folders.filter((folder) => folder.parentId === null);

  const handleRootDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("application/x-folder-id")) {
      return;
    }

    event.preventDefault();
    setIsRootDragOver(true);
  };

  const handleRootDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("application/x-folder-id")) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleRootDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget;

    if (
      relatedTarget instanceof Node &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    setIsRootDragOver(false);
  };

  const handleRootDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsRootDragOver(false);

    const sourceFolderId = event.dataTransfer.getData(
      "application/x-folder-id",
    );

    if (!sourceFolderId) {
      return;
    }

    onFolderDropToRoot(sourceFolderId);
  };

  return (
    <div
      className="min-w-0 space-y-1"
      onDragEnter={handleRootDragEnter}
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
    >
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          folders={folders}
          depth={0}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
          onFolderActions={onFolderActions}
          onFolderActionsClose={onFolderActionsClose}
          actionFolderId={actionFolderId}
          onFolderRename={onFolderRename}
          isRenamingFolder={isRenamingFolder}
          renameFolderName={renameFolderName}
          onRenameFolderNameChange={onRenameFolderNameChange}
          onRenameSave={onRenameSave}
          onFolderDelete={onFolderDelete}
          confirmDeleteFolder={confirmDeleteFolder}
          onDeleteRequest={onDeleteRequest}
          onDeleteCancel={onDeleteCancel}
          isDeletingFolder={isDeletingFolder}
          onGameDrop={onGameDrop}
          onFolderDrop={onFolderDrop}
        />
      ))}

      <div
        className={`min-h-12 border border-dashed px-3 py-3 text-center text-xs transition ${
          isRootDragOver
            ? "border-sky-500 bg-sky-500/10 text-sky-300"
            : "border-transparent text-transparent"
        }`}
      >
        {isRootDragOver ? "Move folder to root" : "."}
      </div>
    </div>
  );
}

export default FolderTree;
