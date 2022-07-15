import { SchemaField } from 'models/schema';
import { createContext } from 'react';
import { DEFAULT_PROJECT_CONFIG } from './constants';
import { FileTreeFile, FileTreeFolder } from './hooks/use_project';

export default createContext<{
  currentLang: string;
  setCurrentLang: (value: string) => void;
  schemaConfig: any;
  schema: SchemaField | null;
  projectConfig: any;
  projectFileTree: (FileTreeFile | FileTreeFolder)[] | null;
  projectTranslations: any;
  currentFile: FileTreeFile | null;
  recentOpenFiles: FileTreeFile[];
  actualValueList: any[];
}>({
  currentLang: '',
  setCurrentLang: () => {},
  schemaConfig: {},
  schema: null,
  projectConfig: null,
  projectFileTree: null,
  projectTranslations: {},
  currentFile: null,
  recentOpenFiles: [],
  actualValueList: [],
});
