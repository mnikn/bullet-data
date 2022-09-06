import { PROJECT_PATH } from 'constatnts/storage_key';
import { FileTreeFile, FileTreeFolder } from 'renderer/hooks/use_project';

export function getBaseUrl(filePath: string) {
  const p = filePath.replace(/\\/g, '/');
  const p1 = p.split('.json')[0];
  const fileName = p1.split('/')[p1.split('/').length - 1];
  const baseUrl = p1
    .split('/')
    .filter((item) => item !== fileName)
    .join('\\');
  return baseUrl;
}

export function findFileInTree(
  tree: any,
  path: string
): any | null {
  if (tree.type === 'file') {
    if (tree.currentPath === path) {
      return tree;
    } else {
      return null;
    }
  }
  if (tree.type === 'folder') {
    return tree.children.reduce(
      (res: any | null, t) => (res ? res : findFileInTree(t, path)),
      null
    );
  }
  return null;
}

export function findFolderInTree(
  tree: any,
  path: string
): FileTreeFolder | null {
  if (tree.type === 'file') {
    return null;
  }
  if (tree.type === 'folder') {
    if (tree.currentPath === path) {
      return tree;
    }
    return tree.children.reduce(
      (res: FileTreeFolder | null, t) => (res ? res : findFolderInTree(t, path)),
      null
    );
  }
  return null;
}


export function getConfigPath(valuePath: string) {
  if (!valuePath) {
    return '';
  }
  const p = valuePath.replace(/\\/g, '/').slice(3);
  const p1 = p.split('.json')[0];
  const fileName = p1.split('/')[p1.split('/').length - 1];
  const baseUrl = p1
    .split('/')
    .filter((item) => item !== fileName)
    .join('\\');
  return valuePath.substring(0, 3) + baseUrl + '\\' + `.${fileName}.config.bc`;
}

export function getProjectBaseUrl() {
  let projectPath = localStorage.getItem(PROJECT_PATH);
  if (!projectPath) {
    return;
  }
  return getBaseUrl(projectPath);
}
