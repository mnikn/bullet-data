import { add, cloneDeep } from 'lodash';
import { SchemaField } from 'models/schema';
import { useEffect, useState } from 'react';
import { useLatest } from 'react-use';
import { EVENT, eventBus } from 'renderer/event';
import { FileTreeFile } from './use_project';
import useListWithKey from './utils/use_list_with_key';

const cacheFileDataList: any = {};

function useDataList({
  currentFile,
  currentFileData,
  schema,
}: {
  currentFile: FileTreeFile | null;
  currentFileData: any[];
  schema: SchemaField | null;
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
  const displayValueList = actualValueList;

  useEffect(() => {
    if (
      currentFileRef.current &&
      cacheFileDataList[currentFileRef.current.fullPath]
    ) {
      setActualValueList(cacheFileDataList[currentFileRef.current.fullPath]);
      return;
    }
    setActualValueList(currentFileData);
  }, [currentFileData, setActualValueList]);

  useEffect(() => {
    const onChanged = (d: any, index: number) => {
      updateActualValueList(index, d);
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
      const v = cloneDeep(actualValueListRef.current[i]);
      insertActualValueList(i, v);
    };
    eventBus.on(EVENT.DATA_ITEM_DUPLICATED, onDuplicated);
    return () => {
      eventBus.off(EVENT.DATA_ITEM_DUPLICATED, onDuplicated);
    };
  }, [schema, insertActualValueList]);

  useEffect(() => {
    const onDelete = (i: number) => {
      removeActualValueList(i);
    };
    eventBus.on(EVENT.DATA_ITEM_DELETE, onDelete);
    return () => {
      eventBus.off(EVENT.DATA_ITEM_DELETE, onDelete);
    };
  }, [removeActualValueList]);

  useEffect(() => {
    if (currentFileRef.current) {
      cacheFileDataList[currentFileRef.current.fullPath] = actualValueList.map(
        (item) => item.data
      );
    }
  }, [actualValueList]);

  return {
    actualValueList,
    displayValueList,
    filters,
    setFilters,
  };
}

export default useDataList;
