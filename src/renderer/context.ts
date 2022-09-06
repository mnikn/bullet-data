import { SchemaField } from 'models/schema';
import { createContext } from 'react';

export default createContext<{
  currentLang: string;
  setCurrentLang: (value: string) => void;
  schemaConfig: any;
  schema: SchemaField | null;
  projectConfig: any;
  projectFileTree: any[] | null;
  projectTranslations: any;
  currentFile: any | null;
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
  actualValueList: [],
});
