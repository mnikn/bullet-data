import { createContext } from 'react';

export default createContext<{ currentLang: string, setCurrentLang: (value: string) => void, schemaConfig: any }>({
  currentLang: '',
    setCurrentLang: () => {},
    schemaConfig: {}
});
