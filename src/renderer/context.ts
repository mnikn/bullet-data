import { SchemaField } from 'models/schema';
import { createContext } from 'react';
import { DEFAULT_PROJECT_CONFIG } from './constants';

export default createContext<{
  currentLang: string;
  setCurrentLang: (value: string) => void;
  schemaConfig: any;
  schema: SchemaField | null;
  projectConfig: any;
}>({
  currentLang: '',
  setCurrentLang: () => {},
  schemaConfig: {},
  schema: null,
  projectConfig: DEFAULT_PROJECT_CONFIG
});
