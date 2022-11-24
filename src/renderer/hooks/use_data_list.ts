import { cloneDeep, get, set } from 'lodash';
import {
  iterSchema,
  SchemaField,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import { useEffect, useState } from 'react';
import { useLatest } from 'react-use';
import { EVENT, eventBus } from 'renderer/event';
import { iterObject } from 'utils/object';
import { generateUUID } from 'utils/uuid';
import useListWithKey from './utils/use_list_with_key';

function useDataList({
  currentFileData,
  schema,
  projectTranslations,
  projectConfig,
  currentLang,
}: {
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
  ] = useListWithKey<any>(currentFileData || []);
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
    setActualValueList(currentFileData || []);
    setFilters((prev) => ({ ...prev }));
  }, [currentFileData, setActualValueList]);

  useEffect(() => {
    const onChanged = (d: any, index: number) => {
      // updateActualValueList(index, d);

      let changeItemKey: any = displayValueListRef.current[index].key;
      setDisplayValueList((prev) => {
        return prev.map((item, j) =>
          j === index ? { key: item.key, data: d } : item
        );
      });

      if (changeItemKey) {
        updateActualValueList(
          actualValueListRef.current.findIndex(
            (item) => item.key === changeItemKey
          ),
          d
        );
      }
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

      iterObject(v, (_, d, path) => {
        if (typeof d === 'string' && projectTranslations[d]) {
          const fieldTranslations = projectTranslations[get(v, path)];
          set(
            v,
            path,
            generateUUID()
            // `${path.substring(path.lastIndexOf('.') + 1)}_` + generateUUID()
          );
          eventBus.emit(
            EVENT.UPDATE_TERM_TRANSLATION,
            get(v, path),
            fieldTranslations
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
    const onFilterChanged = (filterVal: any) => {
      setFilters(filterVal);
    };

    eventBus.on(EVENT.FILTER_CHANGED, onFilterChanged);
    return () => {
      eventBus.off(EVENT.FILTER_CHANGED, onFilterChanged);
    };
  }, []);

  useEffect(() => {
    if (schema === null || currentFileData == null) {
      return;
    }
    eventBus.emit(EVENT.SAVE_FILE, actualValueListRef.current);
  }, [schema]);

  return {
    actualValueList,
    displayValueList,
    filters,
  };
}

export default useDataList;
