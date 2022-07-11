import { useEffect } from 'react';
import { useLatest } from 'react-use';
import { EVENT, eventBus } from 'renderer/event';

function useShortcut({
  actualValueList,
  projectConfig,
}: {
  actualValueList: any[];
  projectConfig: any;
}) {
  const actualValueListRef = useLatest(actualValueList);
  useEffect(() => {
    const onKeyDown = (e: any) => {
      if (e.code === 'KeyS' && e.ctrlKey) {
        eventBus.emit(
          EVENT.SAVE_FILE,
          actualValueListRef.current.map((item) => item.data)
        );
      }
      if (e.code === 'KeyL' && e.ctrlKey) {
        eventBus.emit(EVENT.SHOW_FILE_PREVIEW);
      }
      if (e.code === 'KeyO' && e.ctrlKey) {
        (window as any).electron.ipcRenderer.openFile();
      }

      // switch lang shortcut
      if (e.code.includes('Digit') && e.ctrlKey) {
        const index = Number(e.code.split('Digit')[1]) - 1;
        if (index >= 0 && projectConfig.i18n.length > index) {
          eventBus.emit(EVENT.SWITCH_LANG, projectConfig.i18n[index]);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [projectConfig]);
}

export default useShortcut;
