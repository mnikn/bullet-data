import { FILE_PATH } from 'constatnts/storage_key';
import { readFile } from 'fs';
import { cloneDeep } from 'lodash';
import {
  SchemaField,
  DEFAULT_CONFIG,
  SchemaFieldType,
  SchemaFieldObject,
  SchemaFieldArray,
  SchemaFieldString,
  SchemaFieldNumber,
  SchemaFieldBoolean,
  SchemaFieldSelect,
  validateValue,
} from 'models/schema';
import { useEffect, useState } from 'react';
import { DEFAULT_SCHEMA_CONFIG } from 'renderer/constants';
import { EVENT, eventBus } from 'renderer/event';
import { getConfigPath, getProjectBaseUrl } from 'renderer/utils/file';
import { generateUUID } from 'utils/uuid';
import { FileTreeFile } from './use_project';

// const HIDDEN_ID = '$$__index';

function buildSchema(json: any): SchemaField {
  switch (json.type) {
    case SchemaFieldType.Object: {
      const instance = new SchemaFieldObject();
      instance.setup(json.config);
      instance.fields = Object.keys(json.fields).map((key: string) => {
        const data: any = {
          type: json.fields[key].type,
          config: json.fields[key].config,
        };
        if (json.fields[key].type === SchemaFieldType.Array) {
          data.fieldSchema = json.fields[key].fieldSchema;
        } else if (json.fields[key].type === SchemaFieldType.Object) {
          data.fields = json.fields[key].fields;
        }
        const subfield = buildSchema(data);
        return {
          id: key,
          name: json.fields[key].name,
          data: subfield,
        };
      });
      instance.config.defaultValue = instance.configDefaultValue;
      return instance;
    }
    case SchemaFieldType.Array: {
      const data: any = {
        type: json.fieldSchema.type,
        config: json.fieldSchema.config,
      };

      if (json.fieldSchema.type === SchemaFieldType.Array) {
        data.fieldSchema = json.fieldSchema.fieldSchema;
      } else if (json.fieldSchema.type === SchemaFieldType.Object) {
        data.fields = json.fieldSchema.fields;
      }
      const instance = new SchemaFieldArray(buildSchema(data));
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.String: {
      const instance = new SchemaFieldString();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Number: {
      const instance = new SchemaFieldNumber();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Boolean: {
      const instance = new SchemaFieldBoolean();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Select: {
      const instance = new SchemaFieldSelect();
      instance.setup(json.config);
      return instance;
    }
  }
  return new SchemaFieldObject();
}

const fileDataCache: any = {};

function useFile({ currentFile }: { currentFile: FileTreeFile | null }) {
  const [currentFileData, setCurrentFileData] = useState<any[]>([]);
  const [schemaConfig, setSchemaConfig] = useState<any>(null);
  const [schema, setSchema] = useState<SchemaField | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentFile || !currentFile.fullPath) {
      setCurrentFileData([]);
      setSchemaConfig(null);
      setSchema(null);
      return;
    }

    const readFile = async () => {
      if (!currentFile || !currentFile.fullPath) {
        return;
      }

      let newSchemaConfig: any = {};
      if (
        Object.keys(fileDataCache).includes(currentFile.fullPath) &&
        fileDataCache[currentFile.fullPath].schemaConfig
      ) {
        newSchemaConfig = fileDataCache[currentFile.fullPath].schemaConfig;
      } else {
        const valuePath = currentFile.fullPath;
        if (valuePath) {
          const configUrl = getConfigPath(valuePath);
          if (configUrl) {
            const val = await window.electron.ipcRenderer.readJsonFile({
              filePath: configUrl,
              action: 'read-file-config',
            });

            if (val.data) {
              const v = JSON.parse(val.data);
              newSchemaConfig = v;
            }
          } else {
            newSchemaConfig = DEFAULT_SCHEMA_CONFIG;
          }
        } else {
          newSchemaConfig = DEFAULT_SCHEMA_CONFIG;
        }
      }

      setSchemaConfig(newSchemaConfig);
      fileDataCache[currentFile.fullPath] = {
        ...fileDataCache[currentFile.fullPath],
        schemaConfig: newSchemaConfig,
      };

      const newSchema = buildSchema(newSchemaConfig.schema);
      setSchema(newSchema);

      // set data
      if (
        Object.keys(fileDataCache).includes(currentFile.fullPath) &&
        fileDataCache[currentFile.fullPath].data
      ) {
        setCurrentFileData(fileDataCache[currentFile.fullPath].data);
        return;
      }

      const val2 = await window.electron.ipcRenderer.readJsonFile({
        filePath: currentFile.fullPath,
        action: 'read-data',
      });
      const data = JSON.parse(val2.data);
      const formatData = data.map((item: any) => {
        return validateValue(item, item, newSchema, newSchemaConfig);
      });
      setCurrentFileData(formatData);
      fileDataCache[currentFile.fullPath] = {
        ...fileDataCache[currentFile.fullPath],
        data: formatData,
      };
    };

    readFile();
  }, [currentFile]);

  useEffect(() => {
    const onSave = async (valueList: any[]) => {
      if (!currentFile || !schema) {
        return;
      }
      setSaving(true);
      const data = cloneDeep(valueList).map((item) => {
        return validateValue(item, item, schema, schemaConfig);
      }, []);

      const valuePath = currentFile.fullPath;
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
          data: JSON.stringify(schemaConfig, null, 2),
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
          localStorage.setItem(currentFile.fullPath, val2.res.path);
          const configPath = getConfigPath(val2.res.path);
          await window.electron.ipcRenderer.writeJsonFile({
            action: 'save-config-file',
            filePath: configPath,
            data: JSON.stringify(schemaConfig, null, 2),
          });
          setTimeout(() => {
            setSaving(false);
          }, 300);
        }
      }
      eventBus.emit(EVENT.SAVE_TRANSLATION);
    };
    eventBus.on(EVENT.SAVE_FILE, onSave);
    return () => {
      eventBus.off(EVENT.SAVE_FILE, onSave);
    };
  }, [currentFile, schema, schemaConfig]);

  useEffect(() => {
    const schemaChanged = async (config: any) => {
      setSchemaConfig(config);
      const configPath = getConfigPath(localStorage.getItem(FILE_PATH) || '');
      if (configPath) {
        await window.electron.ipcRenderer.writeJsonFile({
          action: 'save-config-file',
          filePath: configPath,
          data: JSON.stringify(config, null, 2),
        });
        const newSchema = buildSchema(config.schema);
        setSchema(newSchema);
        window.location.reload();
      }
      // eventBus.emit(EVENT.SAVE_FILE, currentFileData);
    };
    eventBus.on(EVENT.FILE_SCHEMA_CHANGED, schemaChanged);
    return () => {
      eventBus.off(EVENT.FILE_SCHEMA_CHANGED, schemaChanged);
    };
  }, []);

  return {
    schema,
    schemaConfig,
    currentFileData,
    saving,
  };
}

export default useFile;
