import { add, cloneDeep, get } from 'lodash';
import {
  iterSchema,
  SchemaField,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLatest } from 'react-use';
import { EVENT, eventBus } from 'renderer/event';
import { iterObject } from 'utils/object';
import { generateUUID } from 'utils/uuid';
import { FileTreeFile } from './use_project';
import useListWithKey from './utils/use_list_with_key';

const cacheFileDataList: any = {};

function useDataList({
  currentFile,
  currentFileData,
  schema,
  projectTranslations,
  projectConfig,
  currentLang,
}: {
  currentFile: FileTreeFile | null;
  currentFileData: any[];
  schema: SchemaField | null;
  projectTranslations: any;
  projectConfig: any;
  currentLang: string;
}) {
  const [
    actualValueList,
    {
      set: setActualValueList,
      updateAt: updateActualValueList,
      insertAt: insertActualValueList,
      push: pushActualValueList,
      removeAt: removeActualValueList,
    },
  ] = useListWithKey<any>(currentFileData);
  const currentFileRef = useLatest(currentFile);
  const actualValueListRef = useLatest(actualValueList);
  const projectTranslationsRef = useLatest(projectTranslations);
  const [filters, setFilters] = useState<any>({});

  const [displayValueList, setDisplayValueList] =
    useState<any[]>(actualValueList);
  const displayValueListRef = useLatest(displayValueList);
  const projectConfigRef = useLatest(projectConfig);

  useEffect(() => {
    setDisplayValueList(
      (actualValueListRef.current || []).filter((v) => {
        const filterVal = filters;
        const item = v.data;
        const needFilter = Object.keys(filterVal).reduce((res, prop) => {
          if (!res) {
            return res;
          }
          if (!filterVal[prop].value) {
            return res;
          }
          if (filterVal[prop].schema instanceof SchemaFieldString) {
            let value = get(item, prop);
            console.log(filterVal[prop].schema, filterVal);
            if (projectTranslationsRef.current[value]) {
              value = projectTranslationsRef.current[value][currentLang];
            }
            if (filterVal[prop].filterType === 'include') {
              return value.includes(filterVal[prop].value);
            } else if (filterVal[prop].filterType === 'exclude') {
              return !value.includes(filterVal[prop].value);
            } else if (filterVal[prop].filterType === 'equal') {
              return value === filterVal[prop].value;
            }
          } else if (filterVal[prop].schema instanceof SchemaFieldNumber) {
            if (filterVal[prop].filterType === 'less') {
              return get(item, prop) > filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'less_equal') {
              return get(item, prop) >= filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'bigger') {
              return get(item, prop) < filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'bigger_equal') {
              return get(item, prop) <= filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'equal') {
              return get(item, prop) === filterVal[prop].value;
            }
          } else if (filterVal[prop].schema instanceof SchemaFieldSelect) {
            if (filterVal[prop].filterType === 'exists') {
              return get(item, prop) === filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'not_exists') {
              return get(item, prop) !== filterVal[prop].value;
            }
          }
          return res;
        }, true);
        return needFilter;
      })
    );
  }, [filters, currentLang]);

  useEffect(() => {
    if (
      currentFileRef.current &&
      cacheFileDataList[currentFileRef.current.fullPath]
    ) {
      setActualValueList(cacheFileDataList[currentFileRef.current.fullPath]);
      setFilters((prev) => ({ ...prev }));
      return;
    }
    setActualValueList(currentFileData);
    setFilters((prev) => ({ ...prev }));
  }, [currentFileData, setActualValueList]);

  useEffect(() => {
    const onChanged = (d: any, index: number) => {
      // updateActualValueList(index, d);

      let changeItem: any = null;
      setDisplayValueList((prev) => {
        changeItem = prev[index];
        return prev.map((item, j) =>
          j === index ? { key: item.key, data: d } : item
        );
      });

      if (changeItem) {
        updateActualValueList(
          actualValueListRef.current.findIndex(
            (item) => item.key === changeItem.key
          ),
          d
        );
      }
      // setFilters((prev) => ({ ...prev }));
    };
    eventBus.on(EVENT.DATA_ITEM_CHANGED, onChanged);
    return () => {
      eventBus.off(EVENT.DATA_ITEM_CHANGED, onChanged);
    };
  }, [updateActualValueList]);

  useEffect(() => {
    const onAdd = () => {
      if (!schema) {
        return;
      }
      const newItem = cloneDeep(
        (schema as SchemaFieldObject).configDefaultValue
      );
      iterSchema(schema, (s, path) => {
        if (s.config.needI18n) {
          const key = get(newItem, path);
          if (typeof key === 'string') {
            eventBus.emit(
              EVENT.UPDATE_TRANSLATION,
              key,
              projectConfigRef.current.i18n.reduce((r, k) => {
                r[k] = '';
                return r;
              }, {})
            );
          }
        }
      });
      pushActualValueList(newItem);
      setFilters((prev) => ({ ...prev }));
    };
    eventBus.on(EVENT.DATA_ITEM_ADD, onAdd);
    return () => {
      eventBus.off(EVENT.DATA_ITEM_ADD, onAdd);
    };
  }, [schema, pushActualValueList]);

  useEffect(() => {
    const onDuplicated = (i: number) => {
      if (!schema) {
        return;
      }
      const v = cloneDeep(actualValueListRef.current[i].data);

      iterObject(v, (k, d) => {
        if (typeof d === 'string' && projectTranslations[d]) {
          v[k] = generateUUID();
          eventBus.emit(
            EVENT.UPDATE_TRANSLATION,
            v[k],
            projectConfigRef.current.i18n.reduce((r, k) => {
              r[k] = '';
              return r;
            }, {})
          );
        }
      });
      insertActualValueList(v, i + 1);
      setFilters((prev) => ({ ...prev }));
    };
    eventBus.on(EVENT.DATA_ITEM_DUPLICATED, onDuplicated);
    return () => {
      eventBus.off(EVENT.DATA_ITEM_DUPLICATED, onDuplicated);
    };
  }, [schema, insertActualValueList, projectTranslations]);

  useEffect(() => {
    const onDelete = (i: number) => {
      const dItem = displayValueListRef.current[i];
      const index = actualValueListRef.current.findIndex(
        (item) => item.key === dItem.key
      );
      removeActualValueList(index);
      setFilters((prev) => ({ ...prev }));
    };
    eventBus.on(EVENT.DATA_ITEM_DELETE, onDelete);
    return () => {
      eventBus.off(EVENT.DATA_ITEM_DELETE, onDelete);
    };
  }, [removeActualValueList]);

  useEffect(() => {
    const onSet = (val: any) => {
      setActualValueList(val);
      setFilters((prev) => ({ ...prev }));
    };
    eventBus.on(EVENT.DATA_LIST_SET, onSet);
    return () => {
      eventBus.off(EVENT.DATA_LIST_SET, onSet);
    };
  }, [setActualValueList]);

  useEffect(() => {
    if (currentFileRef.current) {
      cacheFileDataList[currentFileRef.current.fullPath] = actualValueList.map(
        (item) => item.data
      );
    }
  }, [actualValueList]);

  useEffect(() => {
    const onFilterChanged = (filterVal: any) => {
      console.log('eww: ', filterVal);
      setFilters(filterVal);
    };

    eventBus.on(EVENT.FILTER_CHANGED, onFilterChanged);
    return () => {
      eventBus.off(EVENT.FILTER_CHANGED, onFilterChanged);
    };
  }, []);

  return {
    actualValueList,
    displayValueList,
    filters,
  };
}

export default useDataList;
