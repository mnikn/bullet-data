import { FILE_PATH, PROJECT_PATH } from 'constatnts/storage_key';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PROJECT_CONFIG } from 'renderer/constants';
import { EVENT, eventBus } from 'renderer/event';
import { getBaseUrl } from 'renderer/utils/file';

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
  const [projectConfig, setProjectConfig] = useState<any>(
    DEFAULT_PROJECT_CONFIG
  );

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
        if (val.data) {
          const allFiles = val.data.filter((item: string) =>
            item.includes('.json')
          );

          let formatFiles = allFiles.map((item) => {
            return item.substr(baseUrl.length + 1).split('\\');
          });

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
              parent.children.push({
                type: 'file',
                partName: pathArr[0],
                currentPath: (path ? path + '\\' : '') + pathArr[0],
                fullPath:
                  baseUrl + '\\' + (path ? path + '\\' : '') + pathArr[0],
              });
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
    const projectPath = localStorage.getItem(PROJECT_PATH);
    if (projectPath) {
      window.electron.ipcRenderer.readJsonFile(
        {
          filePath: projectPath,
          action: 'read-project-config',
        },
        (val: any) => {
          if (val.data) {
            setProjectConfig(JSON.parse(val.data));
          }
        }
      );
    }
  }, []);

  return { projectFileTree, projectConfig };
}

export default useProject;
