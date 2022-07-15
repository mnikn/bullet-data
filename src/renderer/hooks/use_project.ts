import { FILE_PATH, PROJECT_PATH } from 'constatnts/storage_key';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PROJECT_CONFIG } from 'renderer/constants';
import { EVENT, eventBus } from 'renderer/event';
import { getBaseUrl, getProjectBaseUrl } from 'renderer/utils/file';
import { parse } from 'json2csv';
import csv from 'csvtojson';

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
  const [projectFileTree, setProjectFileTree] = useState<
    (FileTreeFolder | FileTreeFile)[] | null
  >(null);
  const [projectConfig, setProjectConfig] = useState<any>(null);

  const [currentLang, setCurrentLang] = useState<string>('');

  const [projectTranslations, setProjectTranslations] = useState<any>({});

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
    let projectPath = localStorage.getItem(PROJECT_PATH);
    if (!projectPath) {
      return;
    }
    const baseUrl = getBaseUrl(projectPath);
    window.electron.ipcRenderer.readFolder(
      {
        filePath: baseUrl,
        action: 'read-project-config',
      },
      (val: any) => {
        //console.log(val.dirs);
        if (val.data || val.dirs) {
          const allFiles = val.data.filter((item: string) =>
            item.includes('.json')
          );

          let formatFiles = allFiles.map((item) => {
            return item.substr(baseUrl.length + 1).split('\\');
          });

          // let formatFolders = val.dirs
          //   .filter((item) => {
          //     return !allFiles.find((a) => a.includes(item));
          //   })
          //   .map((item) => {
          //     return item.substr(baseUrl.length + 1).split('\\');
          //   });
          // formatFiles = formatFiles.concat(formatFolders);

          let fileGroups = {
            type: 'folder',
            partName: 'root',
            children: [],
          };

          const fileGroupSet: any = {};

          const buildFileGroups = (
            parent: any,
            path: string,
            pathArr: any[],
            expanded = false
          ) => {
            if (pathArr.length <= 0) {
              return;
            }
            if (pathArr.length === 1) {
              if (pathArr[0].includes('.json')) {
                parent.children.push({
                  type: 'file',
                  partName: pathArr[0],
                  currentPath: (path ? path + '\\' : '') + pathArr[0],
                  fullPath:
                    baseUrl + '\\' + (path ? path + '\\' : '') + pathArr[0],
                });
              } else {
                parent.children.push({
                  type: 'folder',
                  partName: pathArr[0],
                  currentPath: (path ? path + '\\' : '') + pathArr[0],
                  children: [],
                });
              }
              return;
            }

            const currentPath = (path ? path + '\\' : '') + pathArr[0];
            let newGroup = {
              type: 'folder',
              partName: pathArr[0],
              currentPath,
              children: [],
              expanded,
            };
            if (fileGroupSet[currentPath]) {
              newGroup = fileGroupSet[currentPath];
              newGroup.expanded = newGroup.expanded
                ? newGroup.expanded
                : expanded;
            }
            buildFileGroups(newGroup, currentPath, pathArr.slice(1), expanded);
            if (!fileGroupSet[currentPath]) {
              parent.children.push(newGroup);
            }
            fileGroupSet[currentPath] = newGroup;
          };

          formatFiles.forEach((d) => {
            buildFileGroups(
              fileGroups,
              '',
              d,
              localStorage.getItem(FILE_PATH) === baseUrl + '\\' + d.join('\\')
            );
          });

          setProjectFileTree(fileGroups.children);
        }
      }
    );
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
    eventBus.on(EVENT.UPDATE_TRANSLATION, updateProjectTranslations);
    return () => {
      eventBus.off(EVENT.UPDATE_TRANSLATION, updateProjectTranslations);
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
      const options = { fields: ['__id', ...projectConfig.i18n] };

      console.log('vv: ', projectTranslations);
      const data: any[] = [];
      Object.keys(projectTranslations).forEach((key) => {
        data.push({
          __id: key,
          ...projectTranslations[key],
        });
      });
      const ff = parse(data, options);
      window.electron.ipcRenderer.call('writeFile', {
        filePath: getProjectBaseUrl() + '\\' + 'translations.csv',
        data: ff,
      });
    };
    eventBus.on(EVENT.SAVE_TRANSLATION, onSave);
    return () => {
      eventBus.off(EVENT.SAVE_TRANSLATION, onSave);
    };
  }, [projectTranslations, projectConfig]);

  useEffect(() => {
    eventBus.on(EVENT.SWITCH_LANG, setCurrentLang);
    return () => {
      eventBus.off(EVENT.SWITCH_LANG, setCurrentLang);
    };
  }, []);

  return { projectTranslations, projectFileTree, projectConfig, currentLang };
}

export default useProject;
