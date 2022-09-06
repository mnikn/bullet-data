import { FILE_PATH } from 'constatnts/storage_key';
import { useEffect, useState } from 'react';
import { EVENT, eventBus } from 'renderer/event';

function useExplorer({
  projectFiles,
}: {
  projectFiles: any[];
}) {
  const [currentFile, setCurrentFile] = useState<any | null>(null);

  useEffect(() => {
    const onSetCurrentFile = (file: any) => {
      const f = projectFiles.find((item) => item.path === file.fullPath);
      setCurrentFile(f || null);
    };

    eventBus.on(EVENT.SET_CURRENT_FILE, onSetCurrentFile);
    return () => {
      eventBus.off(EVENT.SET_CURRENT_FILE, onSetCurrentFile);
    };
  }, [currentFile, projectFiles]);

  useEffect(() => {
    let p = localStorage.getItem(FILE_PATH);
    if (p) {
      const file = projectFiles.find((item) => item.path === p);
      setCurrentFile(file || null);
    } else {
      setCurrentFile(null);
    }
  }, [projectFiles]);

  return {
    currentFile,
  };
}

export default useExplorer;
