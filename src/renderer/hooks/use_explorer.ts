import { FILE_PATH } from 'constatnts/storage_key';
import { useEffect, useState } from 'react';
import { DEFAULT_SCHEMA_CONFIG } from 'renderer/constants';
import { EVENT, eventBus } from 'renderer/event';
import {
  findFileInTree,
  findFolderInTree,
  getConfigPath,
  getProjectBaseUrl,
} from 'renderer/utils/file';
import { FileTreeFile, FileTreeFolder } from './use_project';

function useExplorer({
  projectFileTree,
}: {
  projectFileTree: (FileTreeFile | FileTreeFolder)[] | null;
}) {
  const [currentFile, setCurrentFile] = useState<FileTreeFile | null>(null);
  const [recentOpenFiles, setRecentOpenFiles] = useState<FileTreeFile[]>(
    currentFile ? [currentFile] : []
  );

  useEffect(() => {
    const newFile = (path: string, name: string) => {
      const newFile: FileTreeFile = {
        fullPath: getProjectBaseUrl() + '\\' + path,
        currentPath: path,
        partName: name,
        type: 'file',
      };
      setRecentOpenFiles((prev2) => prev2.concat(newFile));

      const folderPath = path.substring(0, path.lastIndexOf('\\'));
      let folder: FileTreeFolder | null = null;
      if (path) {
        folder = findFolderInTree(
          {
            currentPath: '',
            partName: '',
            children: projectFileTree || [],
            type: 'folder',
          },
          folderPath
        );
      }
      if (folder) {
        folder.children.push(newFile);
      } else {
        if (projectFileTree) {
          projectFileTree?.push(newFile);
        }
      }
      window.electron.ipcRenderer
        .call('saveFile', {
          path: newFile.fullPath,
          data: '[]',
        })
        .then(() => {
          return window.electron.ipcRenderer.call('saveFile', {
            path: getConfigPath(newFile.fullPath as string),
            data: JSON.stringify(DEFAULT_SCHEMA_CONFIG, null, 2),
          });
        })
        .then(() => {
          eventBus.emit(EVENT.REFRESH_PROJECT_FILE_TREE);
        });
    };

    const deleteFile = (path: string) => {
      setRecentOpenFiles((prev) =>
        prev.filter((item) => item.currentPath !== path)
      );

      const finalUrl = getProjectBaseUrl() + '\\' + path;
      if (projectFileTree) {
        window.electron.ipcRenderer
          .call('deleteFile', {
            path: finalUrl,
          })
          .then(() => {
            return window.electron.ipcRenderer.call('deleteFile', {
              path: getConfigPath(finalUrl),
            });
          })
          .then(() => {
            const folder = findFolderInTree(
              {
                currentPath: '',
                partName: '',
                children: projectFileTree,
                type: 'folder',
              },
              path.substring(0, path.lastIndexOf('\\'))
            );
            if (folder && folder.currentPath) {
              folder.children = folder.children.filter(
                (d) => d.currentPath !== path
              );
            } else {
              projectFileTree.splice(
                projectFileTree.findIndex((d2) => d2.currentPath === path),
                1
              );
            }
            if (currentFile?.currentPath === path) {
              setCurrentFile(null);
              localStorage.removeItem(FILE_PATH);
            }
            eventBus.emit(EVENT.REFRESH_PROJECT_FILE_TREE);
          });
      }
    };

    const renameFile = (sourcePath: string, targetPath: string) => {
      const finalSourcePath = getProjectBaseUrl() + '\\' + sourcePath;
      const finalTargetPath = getProjectBaseUrl() + '\\' + targetPath;
      window.electron.ipcRenderer
        .call('renameFile', {
          sourcePath: finalSourcePath,
          targetPath: finalTargetPath,
        })
        .then(() => {
          return window.electron.ipcRenderer.call('renameFile', {
            sourcePath: getConfigPath(finalSourcePath),
            targetPath: getConfigPath(finalTargetPath),
          });
        })
        .then(() => {
          const file = findFileInTree(
            {
              currentPath: '',
              partName: '',
              children: projectFileTree || [],
              type: 'folder',
            },
            sourcePath
          );

          if (file) {
            file.partName = targetPath.substring(
              targetPath.lastIndexOf('\\') + 1
            );
            file.currentPath = targetPath;
            file.fullPath = getProjectBaseUrl() + '\\' + targetPath;

            eventBus.emit(EVENT.REFRESH_PROJECT_FILE_TREE);
            if (
              getProjectBaseUrl() + '\\' + sourcePath ===
              localStorage.getItem(FILE_PATH)
            ) {
              localStorage.setItem(FILE_PATH, finalTargetPath);
              setCurrentFile(file);
            }
          }
        });
    };

    const newFolder = (path: string) => {
      // let parentFolder: FileTreeFolder | null = null;
      // if (path) {
      //   parentFolder = findFolderInTree(
      //     {
      //       currentPath: path,
      //       partName: '',
      //       children: projectFileTree || [],
      //       type: 'folder',
      //     },
      //     path
      //   );
      // }

      // console.log('ss: ', parentFolder);
      const finalPath = getProjectBaseUrl() + '\\' + path;
      console.log('vee: ', finalPath);
      window.electron.ipcRenderer
        .call('newFolder', {
          path: finalPath,
        })
        .then(() => {
          eventBus.emit(EVENT.REFRESH_PROJECT_FILE_TREE);
        });
    };
    eventBus.on(EVENT.NEW_FILE, newFile);
    eventBus.on(EVENT.DELETE_FILE, deleteFile);
    eventBus.on(EVENT.RENAME_FILE, renameFile);
    eventBus.on(EVENT.NEW_FOLDER, newFolder);
    return () => {
      eventBus.off(EVENT.NEW_FILE, newFile);
      eventBus.off(EVENT.DELETE_FILE, deleteFile);
      eventBus.off(EVENT.RENAME_FILE, renameFile);
      eventBus.off(EVENT.NEW_FOLDER, newFolder);
    };
  }, [projectFileTree, currentFile]);

  useEffect(() => {
    const onSetCurrentFile = (file: FileTreeFile) => {
      setCurrentFile(file);
      setRecentOpenFiles((prev) =>
        !prev.find((item) => item.currentPath === file.currentPath)
          ? prev.concat(file)
          : prev
      );
    };

    const onCloseFile = (f: FileTreeFile) => {
      setRecentOpenFiles((prev) => {
        const newArr = prev.filter(
          (item) => item.currentPath !== f.currentPath
        );
        if (currentFile?.currentPath === f.currentPath) {
          const newFile = newArr[0] || null;
          setCurrentFile(newFile);
          if (!newFile) {
            localStorage.removeItem(FILE_PATH);
          }
        }
        return newArr;
      });
    };
    eventBus.on(EVENT.SET_CURRENT_FILE, onSetCurrentFile);
    eventBus.on(EVENT.CLOSE_FILE, onCloseFile);
    return () => {
      eventBus.off(EVENT.SET_CURRENT_FILE, onSetCurrentFile);
      eventBus.off(EVENT.CLOSE_FILE, onCloseFile);
    };
  }, [currentFile]);

  useEffect(() => {
    if (!projectFileTree) {
      return;
    }
    let p = localStorage.getItem(FILE_PATH);
    const projectBaseUrl = getProjectBaseUrl() || '';
    if (p) {
      p = p.substring(projectBaseUrl.length + 1);
      console.log(projectFileTree, p);
      const file = projectFileTree.reduce((res, t) => {
        return res ? res : findFileInTree(t, p);
      }, null) as FileTreeFile;
      setCurrentFile(file);
      setRecentOpenFiles((prev) =>
        !prev.find((item) => item.currentPath === file.currentPath)
          ? prev.concat(file)
          : prev
      );
    }
  }, [projectFileTree]);

  return {
    currentFile,
    recentOpenFiles,
  };
}

export default useExplorer;
