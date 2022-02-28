import { FILE_PATH, RECENTE_FILE_PATHS } from 'constatnts/storage_key';
import cloneDeep from 'lodash/cloneDeep';
import uniq from 'lodash/uniq';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldObject,
  SchemaFieldType,
} from 'models/schema';
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
    valuePath.substring(0, 3) + baseUrl + '\\' + `.${fileName}.config.json`
  );
}

function validateValue(
  totalObjValue: any,
  value: any,
  schema: SchemaField,
  schemaConfig: any
): any {
  if (schema.config.enableWhen) {
    const fn = eval(schema.config.enableWhen);
    if (!fn(totalObjValue)) {
      return schema.config.defaultValue;
    }
  }
  if (schema.type === SchemaFieldType.Array) {
    if (Array.isArray(value)) {
      return value.map((item) => {
        return validateValue(
          item,
          item,
          (schema as SchemaFieldArray).fieldSchema,
          schemaConfig
        );
      });
    } else {
      return schema.config.defaultValue;
    }
  }
  if (schema.type === SchemaFieldType.Object) {
    if (typeof value === 'object' && value !== null) {
      const objFields = (schema as SchemaFieldObject).fields.map((t) => t.id);
      const r1 = Object.keys(value).reduce((res2: any, key) => {
        if (objFields.includes(key)) {
          res2[key] = validateValue(
            value,
            value[key],
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data,
            schemaConfig
          );
        }
        return res2;
      }, {});
      const r2 = objFields.reduce((res: any, key) => {
        if (!Object.keys(value).includes(key)) {
          res[key] = validateValue(
            value,
            null,
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data,
            schemaConfig
          );
        }
        return res;
      }, {});
      return { ...r1, ...r2 };
    } else {
      return (schema as SchemaFieldObject).configDefaultValue;
    }
  }

  if (schema.type === SchemaFieldType.String) {
    if (schema.config.needI18n) {
      if (typeof value === 'object' && value !== null) {
        return value;
      } else {
        return schemaConfig.i18n.reduce((res, item) => {
          return { ...res, [item]: schema.config.defaultValue };
        }, '');
      }
    }
    if (typeof value === 'string') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Number) {
    if (typeof value === 'number') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Boolean) {
    if (typeof value === 'boolean') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Select) {
    if (typeof value === 'string') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  return value;
}

const HIDDEN_ID = '$$__index';

const useAction = ({ valueList, schema, schemaConfig }) => {
  const [saving, setSaving] = useState(false);
  const save = useCallback(() => {
    setSaving(true);
    const valuePath = localStorage.getItem(FILE_PATH);
    const data = cloneDeep(valueList).map((item) => {
      item[HIDDEN_ID] = undefined;
      return validateValue(item, item, schema, schemaConfig);
    }, []);
    if (valuePath) {
      const configPath = getConfigPath(valuePath);
      window.electron.ipcRenderer.writeJsonFile(
        {
          action: 'save-value-file',
          filePath: valuePath,
          data: JSON.stringify(data, null, 2),
        },
        () => {
          window.electron.ipcRenderer.writeJsonFile(
            {
              action: 'save-config-file',
              filePath: configPath,
              data: JSON.stringify(schemaConfig, null, 2),
            },
            () => {
              setTimeout(() => {
                setSaving(false);
              }, 300);
            }
          );
        }
      );
    } else {
      window.electron.ipcRenderer.saveFileDialog(
        {
          action: 'save-value-file',
          data: JSON.stringify(data, null, 2),
        },
        () => {
          localStorage.setItem(FILE_PATH, val2.res.path);
          const configPath = getConfigPath(val2.res.path);
          window.electron.ipcRenderer.writeJsonFile(
            {
              action: 'save-config-file',
              filePath: configPath,
              data: JSON.stringify(schemaConfig, null, 2),
            },
            () => {
              setTimeout(() => {
                setSaving(false);
              }, 300);
            }
          );
        }
      );
    }
  }, [valueList, schema, schemaConfig]);

  useEffect(() => {
    const onOpenFile = (res) => {
      const path = res.res[0].path;
      localStorage.setItem(FILE_PATH, path);
      const recents = JSON.parse(
        localStorage.getItem(RECENTE_FILE_PATHS) || '[]'
      ).concat(path);
      localStorage.setItem(RECENTE_FILE_PATHS, JSON.stringify(uniq(recents)));
      window.electron.ipcRenderer.addRecentFile({
        newFilePath: path,
        all: recents,
      });
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

  return {
    saving,
    save,
  };
};

export default useAction;
