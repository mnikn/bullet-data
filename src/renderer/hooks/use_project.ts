import { FILE_PATH, PROJECT_PATH } from 'constatnts/storage_key';
import csv from 'csvtojson';
import { parse } from 'json2csv';
import { get, set } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SCHEMA_CONFIG } from 'renderer/constants';
import { EVENT, eventBus } from 'renderer/event';
import {
  getBaseUrl,
  getConfigPath,
  getProjectBaseUrl,
} from 'renderer/utils/file';
import { iterObject } from 'utils/object';
import { generateUUID } from 'utils/uuid';

export interface FileTreeFolder {
  type: 'folder';
  partName: string;
  currentPath: string;
  children: (FileTreeFile | FileTreeFolder)[];
}

export interface FileTreeFile {
  type: 'file';
  partName: string;
  currentPath: string | null;
  fullPath: string | null;
}

function useProject() {
  const [projectFileTree, setProjectFileTree] = useState<any[] | null>(null);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [projectFolders, setProjectFolders] = useState<any[]>([]);
  const [projectConfig, setProjectConfig] = useState<any>(null);

  const [currentLang, setCurrentLang] = useState<string>('');

  const [projectTranslations, setProjectTranslations] = useState<any>({
    '___needInit': true
  });

  useEffect(() => {
    const onRefresh = () => {
      setProjectFileTree((prev) => {
        if (!prev) {
          return prev;
        }
        return [...prev];
      });
    };
    eventBus.on(EVENT.REFRESH_PROJECT_FILE_TREE, onRefresh);
    return () => {
      eventBus.off(EVENT.REFRESH_PROJECT_FILE_TREE, onRefresh);
    };
  }, []);

  useEffect(() => {
    const files = projectFiles.filter((item) => item.path.includes('.json'));
    const buildFileTree = (root: any) => {
      let childFolders = projectFolders.filter(
        (item) => item.parentFolderId === root.id
      );
      childFolders = childFolders.map((folder: any) => {
        return {
          id: folder.id,
          parentFolderId: folder.parentFolderId,
          type: 'folder',
          children: buildFileTree(folder),
          partName: folder.path
            .substr(
              folder.path.indexOf(getBaseUrl(folder.path)) +
                getBaseUrl(folder.path).length,
              folder.path.length
            )
            .replace('\\', ''),
          fullPath: folder.path,
        };
      });

      const childFiles = files
        .filter((item2) => item2.parentFolderId === root.id)
        .map((item) => {
          return {
            id: item.id,
            parentFolderId: item.parentFolderId,
            partName: item.path
              .substr(
                item.path.indexOf(getBaseUrl(item.path)) +
                  getBaseUrl(item.path).length,
                item.path.length
              )
              .replace('\\', ''),
            fullPath: item.path,
            type: 'file',
          };
        });
      return [...childFolders, ...childFiles];
    };

    const rootDirs = projectFolders
      .filter((item) => !item.parentFolderId)
      .map((r) => {
        return {
          parentFolderId: r.parentFolderId,
          id: r.id,
          type: 'folder',
          children: buildFileTree(r),
          fullPath: r.path,
          partName: r.path
            .substr(
              r.path.indexOf(getBaseUrl(r.path)) + getBaseUrl(r.path).length,
              r.path.length
            )
            .replace('\\', ''),
        };
      });

    const rootFiles = projectFiles
      .filter(
        (item) =>
          item.path.includes('.json') &&
          getBaseUrl(item.path) === getProjectBaseUrl()
      )
      .map((item) => {
        return {
          id: item.id,
          parentFolderId: item.parentFolderId,
          partName: item.path
            .substr(
              item.path.indexOf(getBaseUrl(item.path)) +
                getBaseUrl(item.path).length,
              item.path.length
            )
            .replace('\\', ''),
          fullPath: item.path,
          type: 'file',
        };
      });

    const tree = [...rootDirs, ...rootFiles];
    setProjectFileTree(tree);
  }, [projectFiles, projectFolders]);

  useEffect(() => {
    let projectPath = localStorage.getItem(PROJECT_PATH);
    if (!projectPath) {
      return;
    }
    const baseUrl = getBaseUrl(projectPath);

    window.electron.ipcRenderer
      .call('readFolderV2', {
        filePath: baseUrl,
      })
      .then((res) => {
        const files = res.data.filter((item) => item.path.includes('.json'));
        setProjectFolders(res.dirs);
        setProjectFiles(files);
      });
  }, []);

  useEffect(() => {
    const updateProjectTranslations = (key: string, term: any) => {
      setProjectTranslations((prev: any) => {
        return {
          ...prev,
          [key]: term,
        };
      });
    };

    const updateTranslateKeyAll = (key: string, val: any) => {
      setProjectTranslations((prev: any) => {
        const newTranslations = { ...prev };
        newTranslations[key] = {
          ...newTranslations[key],
        };
        projectConfig.i18n.forEach((lang) => {
          newTranslations[key][lang] =
            val?.[lang] || newTranslations[key]?.[lang] || '';
        });
        return newTranslations;
      });
    };

    eventBus.on(EVENT.UPDATE_TRANSLATION, updateProjectTranslations);
    eventBus.on(EVENT.UPDATE_TERM_TRANSLATION, updateTranslateKeyAll);
    eventBus.on(EVENT.SET_TRANSLATION, setProjectTranslations);
    return () => {
      eventBus.off(EVENT.UPDATE_TRANSLATION, updateProjectTranslations);
      eventBus.off(EVENT.UPDATE_TERM_TRANSLATION, updateTranslateKeyAll);
      eventBus.off(EVENT.SET_TRANSLATION, setProjectTranslations);
    };
  }, [projectConfig]);

  useEffect(() => {
    const projectPath = localStorage.getItem(PROJECT_PATH);
    if (projectPath) {
      window.electron.ipcRenderer
        .readJsonFile({
          filePath: projectPath,
          action: 'read-project-config',
        })
        .then((val: any) => {
          if (val.data) {
            const v = JSON.parse(val.data);
            setProjectConfig(v);
            setCurrentLang(v.i18n[0]);

            window.electron.ipcRenderer
              .call('readFile', {
                filePath: getProjectBaseUrl() + '\\' + 'translations.csv',
              })
              .then((val2) => {
                if (!val2.data) {
                  return;
                }
                const translations: any = {};
                csv({
                  output: 'csv',
                })
                  .fromString(val2.data)
                  .then((str) => {
                    str.forEach((s, i) => {
                      s.forEach((s2, j) => {
                        if (j === 0) {
                          translations[s2] = {};
                        } else {
                          translations[s[0]][v.i18n[j - 1]] = s2;
                        }
                      });
                    });
                    setProjectTranslations(translations);
                  });
              });
          }
        });
    }
  }, []);

  useEffect(() => {
    const onSave = () => {
      const options = { fields: ['keys', ...projectConfig.i18n] };

      const data: any[] = [];
      Object.keys(projectTranslations).forEach((key) => {
        data.push({
          keys: key,
          ...projectTranslations[key],
        });
      });
      const ff = parse(data, options);
      window.electron.ipcRenderer.call('writeFile', {
        filePath: getProjectBaseUrl() + '\\' + 'translations.csv',
        data: ff,
      });
    };

    const newFile = (targetFolder: any, fileName: string) => {
      const filePath =
        (targetFolder?.fullPath || getProjectBaseUrl()) +
        '\\' +
        fileName +
        '.json';
      const newFile = {
        id: generateUUID(),
        name: fileName,
        parentFolderId: targetFolder?.id || null,
        path: filePath,
      };
      setProjectFiles((prev) => {
        return prev.concat(newFile);
      });
      window.electron.ipcRenderer
        .call('saveFile', {
          path: filePath,
          data: '[]',
        })
        .then(() => {
          return window.electron.ipcRenderer.call('saveFile', {
            path: getConfigPath(newFile.path as string),
            data: JSON.stringify(DEFAULT_SCHEMA_CONFIG, null, 2),
          });
        })
        .then(() => {
          eventBus.emit(EVENT.REFRESH_PROJECT_FILE_TREE);
        });
    };

    const deleteFile = (file: any) => {
      window.electron.ipcRenderer
        .call('deleteFile', {
          path: file.fullPath,
        })
        .then(() => {
          return window.electron.ipcRenderer.call('deleteFile', {
            path: getConfigPath(file.fullPath),
          });
        })
        .then(() => {
          setProjectFiles((prev) => {
            return prev.filter((item) => item.id !== file.id);
          });
        });
    };

    const renameFile = (file: any, name: string) => {
      const parentFolder = projectFolders.find(
        (item) => item.id === file.parentFolderId
      );
      const finalSourcePath = file.fullPath;
      const finalTargetPath =
        (parentFolder?.path || getProjectBaseUrl()) + '\\' + name + '.json';
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
          const matchFile = projectFiles.find((item) => {
            return item.id === file.id;
          });

          if (matchFile) {
            if (finalSourcePath === localStorage.getItem(FILE_PATH)) {
              localStorage.setItem(FILE_PATH, finalTargetPath);
            }
            matchFile.path = finalTargetPath;
            matchFile.partName = name + '.json';
            setProjectFiles((prev) => {
              return [...prev];
            });
          }
        });
    };
    eventBus.on(EVENT.SAVE_TRANSLATION, onSave);
    eventBus.on(EVENT.NEW_FILE, newFile);
    eventBus.on(EVENT.RENAME_FILE, renameFile);
    eventBus.on(EVENT.DELETE_FILE, deleteFile);
    return () => {
      eventBus.off(EVENT.NEW_FILE, newFile);
      eventBus.off(EVENT.SAVE_TRANSLATION, onSave);
      eventBus.off(EVENT.RENAME_FILE, renameFile);
      eventBus.off(EVENT.DELETE_FILE, deleteFile);
    };
  }, [projectTranslations, projectConfig]);

  useEffect(() => {
    eventBus.on(EVENT.SWITCH_LANG, setCurrentLang);
    return () => {
      eventBus.off(EVENT.SWITCH_LANG, setCurrentLang);
    };
  }, []);

  return {
    projectTranslations,
    projectFileTree,
    projectFiles,
    projectFolders,
    projectConfig,
    currentLang,
  };
}

export default useProject;
