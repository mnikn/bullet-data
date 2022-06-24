import { FILE_PATH, RECENTE_FILE_PATHS } from 'constatnts/storage_key';
import cloneDeep from 'lodash/cloneDeep';
import uniq from 'lodash/uniq';
import { validateValue } from 'models/schema';
import { useCallback, useEffect, useState } from 'react';

function getConfigPath(valuePath: string) {
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
  return (
    valuePath.substring(0, 3) + baseUrl + '\\' + `.${fileName}.config.bc`
  );
}

const HIDDEN_ID = '$$__index';

const useSave = ({ valueList, schema, schemaConfig }) => {
  const [saving, setSaving] = useState(false);
  const save = useCallback(
    async (newSchemaConfig?: any) => {
      setSaving(true);
      const storeSchemaConfig = newSchemaConfig
        ? newSchemaConfig
        : schemaConfig;
      const valuePath = localStorage.getItem(FILE_PATH);
      const data = cloneDeep(valueList).map((item) => {
        item[HIDDEN_ID] = undefined;
        return validateValue(item, item, schema, storeSchemaConfig);
      }, []);

      if (valuePath) {
        const configPath = getConfigPath(valuePath);
        await window.electron.ipcRenderer.writeJsonFile({
          action: 'save-value-file',
          filePath: valuePath,
          data: JSON.stringify(data, null, 2),
        });
        await window.electron.ipcRenderer.writeJsonFile({
          action: 'save-config-file',
          filePath: configPath,
          data: JSON.stringify(storeSchemaConfig, null, 2),
        });
        setTimeout(() => {
          setSaving(false);
        }, 700);
      } else {
        const val2 = await window.electron.ipcRenderer.saveFileDialog({
          action: 'save-value-file',
          data: JSON.stringify(data, null, 2),
        });
        if (val2?.res?.path) {
          localStorage.setItem(FILE_PATH, val2.res.path);
          const configPath = getConfigPath(val2.res.path);
          await window.electron.ipcRenderer.writeJsonFile({
            action: 'save-config-file',
            filePath: configPath,
            data: JSON.stringify(storeSchemaConfig, null, 2),
          });
          setTimeout(() => {
            setSaving(false);
          }, 300);
        }
      }
    },
    [valueList, schema, schemaConfig]
  );

  useEffect(() => {
    const onOpenFile = (res) => {
      const path = res.res[0].path;
      localStorage.setItem(FILE_PATH, path);
      const recents = JSON.parse(
        localStorage.getItem(RECENTE_FILE_PATHS) || '[]'
      ).concat(path);
      localStorage.setItem(RECENTE_FILE_PATHS, JSON.stringify(uniq(recents)));
      window.location.reload();
    };
    const onNewFile = () => {
      save();
      localStorage.clear();
      window.location.reload();
    };
    window.electron.ipcRenderer.on('saveFile', save);
    window.electron.ipcRenderer.on('openFile', onOpenFile);
    window.electron.ipcRenderer.on('newFile', onNewFile);

    return () => {
      window.electron.ipcRenderer.removeAllListeners('saveFile');
      window.electron.ipcRenderer.removeAllListeners('openFile');
      window.electron.ipcRenderer.removeAllListeners('newFile');
    };
  }, [save]);

  const newFile = () => {
    save();
    localStorage.removeItem(FILE_PATH);
    window.location.reload();
  };

  return {
    saving,
    save,
    newFile,
  };
};

export default useSave;
