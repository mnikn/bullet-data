import { add, cloneDeep, get } from 'lodash';
import {
  SchemaField,
  SchemaFieldNumber,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import { useEffect, useMemo, useState } from 'react';
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
}: {
  currentFile: FileTreeFile | null;
  currentFileData: any[];
  schema: SchemaField | null;
  projectTranslations: any;
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
  const [filters, setFilters] = useState<any>({});

  const displayValueList = useMemo(() => {
    return (actualValueList || []).filter((v) => {
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
          if (filterVal[prop].filterType === 'include') {
            return get(item, prop).includes(filterVal[prop].value);
          } else if (filterVal[prop].filterType === 'exclude') {
            return !get(item, prop).includes(filterVal[prop].value);
          } else if (filterVal[prop].filterType === 'equal') {
            return get(item, prop) === filterVal[prop].value;
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
    });
  }, [filters]);

  useEffect(() => {
    if (
      currentFileRef.current &&
      cacheFileDataList[currentFileRef.current.fullPath]
    ) {
      setActualValueList(cacheFileDataList[currentFileRef.current.fullPath]);
      return;
    }
    setActualValueList(currentFileData);
    setFilters({});
  }, [currentFileData, setActualValueList]);

  useEffect(() => {
    const onChanged = (d: any, index: number) => {
      updateActualValueList(index, d);
      setFilters((prev) => ({ ...prev }));
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
      const newItem = cloneDeep(schema.config.defaultValue);
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
      removeActualValueList(i);
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
