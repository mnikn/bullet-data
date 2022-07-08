import { useCallback, useEffect, useRef } from 'react';
import { useList } from 'react-use';
import { generateUUID } from 'utils/uuid';

export interface ListData<T> {
  data: T;
  key: string;
}

const useListWithKey = <T>(
  initialData: T[]
): [
  ListData<T>[],
  {
    push: (val: T) => void;
    updateAt: (index: number, val: T) => void;
    removeAt: (index: number) => void;
    set: (val: T[]) => void;
    insertAt: (index: number, val: T) => void;
  }
] => {
  const [dataList, { push, updateAt, removeAt, set, insertAt }] = useList<
    ListData<T>
  >(
    initialData.map((item) => {
      return {
        data: item,
        key: generateUUID(),
      };
    })
  );
  const prevDataListRef = useRef<ListData<T>[]>(dataList);

  const listItemPush = useCallback(
    (val: T) => {
      push({
        data: val,
        key: generateUUID(),
      });
    },
    [push]
  );

  const listItemUpdateAt = useCallback(
    (index: number, val: T) => {
      const prevItemData = prevDataListRef.current[index];
      updateAt(index, {
        data: val,
        key: prevItemData?.key ? prevItemData?.key : generateUUID(),
      });
    },
    [updateAt]
  );

  const listSet = useCallback(
    (val: T[]) => {
      const newList = val.map((item) => {
        return {
          data: item,
          key: generateUUID(),
        };
      });
      set(newList);
    },
    [set]
  );

  const listInsertAt = useCallback(
    (val: T, index: number) => {
      insertAt(index, {
        data: val,
        key: generateUUID(),
      });
    },
    [insertAt]
  );

  useEffect(() => {
    prevDataListRef.current = dataList;
  }, [dataList]);

  return [
    dataList,
    {
      push: listItemPush,
      updateAt: listItemUpdateAt,
      removeAt,
      set: listSet,
      insertAt: listInsertAt,
    },
  ];
};

export default useListWithKey;
