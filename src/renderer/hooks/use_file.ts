import { FILE_PATH } from 'constatnts/storage_key';
import { cloneDeep } from 'lodash';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldBoolean,
  SchemaFieldFile,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
  SchemaFieldType,
  validateValue,
} from 'models/schema';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SCHEMA_CONFIG } from 'renderer/constants';
import { EVENT, eventBus } from 'renderer/event';
import { getConfigPath } from 'renderer/utils/file';
import { FileTreeFile } from './use_project';

// const HIDDEN_ID = '$$__index';

function buildSchema(json: any, cacheSchemaMap: any = {}): SchemaField {
  switch (json?.type) {
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
        const subfield = buildSchema(data, cacheSchemaMap);
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
      const instance = new SchemaFieldArray(buildSchema(data, cacheSchemaMap));
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.String: {
      let instance = new SchemaFieldString();
      if (cacheSchemaMap[json.config.extends]) {
        instance = cacheSchemaMap[json.config.extends];
      }
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
    case SchemaFieldType.File: {
      const instance = new SchemaFieldFile();
      instance.setup(json.config);
      return instance;
    }
  }
  return new SchemaFieldObject();
}

function useFile({
  currentFile,
  projectConfig,
  projectTranslations,
}: {
  currentFile: any | null;
  projectConfig: any;
  projectTranslations: any;
}) {
  const [currentFileData, setCurrentFileData] = useState<any[] | null>(null);
  const [schemaConfig, setSchemaConfig] = useState<any>(null);
  const [schema, setSchema] = useState<SchemaField | null>(null);
  const [saving, setSaving] = useState(false);
  const projectTransltionsRef = useRef<any>(projectTranslations);
  projectTransltionsRef.current = projectTranslations;
  const currentFileDataRef = useRef<any>(currentFileData);
  currentFileDataRef.current = currentFileData;
  const currentFileIdRef = useRef<any>(null);

  useEffect(() => {
    if (!projectConfig) {
      return;
    }
    if (projectTranslations.___needInit) {
      return;
    }

    if (!currentFile || !currentFile.path) {
      setCurrentFileData(null);
      setSchemaConfig(null);
      setSchema(null);
      return;
    }

    const readFile = async () => {
      if (!currentFile || !currentFile.path) {
        return;
      }

      currentFileIdRef.current = currentFile.id;
      let newSchemaConfig: any = {};
      const valuePath = currentFile.path;
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

      setSchemaConfig(newSchemaConfig);

      const projectSchemaMap = Object.keys(projectConfig?.schemas || {}).reduce(
        (res: any, key) => {
          res[key] = buildSchema(projectConfig.schemas[key]);
          return res;
        },
        {}
      );
      const newSchema = buildSchema(newSchemaConfig.schema, projectSchemaMap);
      setSchema(newSchema);

      const val2 = await window.electron.ipcRenderer.readJsonFile({
        filePath: currentFile.path,
        action: 'read-data',
      });
      const data = JSON.parse(val2.data);
      const formatData = data.map((item: any) => {
        return validateValue(
          item,
          item,
          newSchema,
          newSchemaConfig,
          projectTransltionsRef.current
        );
      });
      setCurrentFileData(formatData);
    };

    if (
      currentFileDataRef.current === null ||
      currentFileIdRef.current !== currentFile.id
    ) {
      readFile();
    }
  }, [currentFile, projectConfig, projectTranslations]);

  useEffect(() => {
    const onSave = async (valueList: any[]) => {
      if (!currentFile || !schema) {
        return;
      }
      setSaving(true);
      const data = cloneDeep(valueList).map((item) => {
        return validateValue(
          item,
          item,
          schema,
          schemaConfig,
          projectTransltionsRef.current
        );
      }, []);

      const valuePath = currentFile.path;
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
          localStorage.setItem(currentFile.path, val2.res.path);
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
        // window.location.reload();
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
