import { SchemaField } from 'models/schema';
import { createContext } from 'react';

export default createContext<{
  currentLang: string;
  setCurrentLang: (value: string) => void;
  schemaConfig: any;
  schema: SchemaField | null;
}>({
  currentLang: '',
  setCurrentLang: () => {},
  schemaConfig: {},
  schema: null,
});
