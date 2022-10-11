import { Grid } from '@mui/material';
import classNames from 'classnames';
import get from 'lodash/get';
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
} from 'models/schema';
import { useContext, useEffect, useState } from 'react';
import {
  RiArrowDownFill,
  RiArrowUpFill,
  RiDeleteBin2Fill,
} from 'react-icons/ri';
import { generateUUID } from 'utils/uuid';
import Context from '../../context';
import CollapseCard from '../collapse_card';
import FieldBoolean from './boolean_field';
import FieldFile from './file_field';
import FieldNumber from './number_field';
import FieldSelect from './select_field';
import FieldString from './string_field';

const ACITON_ICON_CLASS =
  'cursor-pointer font-bold text-2xl text-zinc-900 hover:text-zinc-500 transition-all z-10';

export const FieldContainer = ({
  schema,
  value,
  onValueChange,
}: {
  schema: SchemaField;
  value: any;
  onValueChange?: (value: any) => void;
}) => {
  const { currentLang } = useContext(Context);
  if (schema.type === SchemaFieldType.Object) {
    const objectValueChange = (v: any, id: string) => {
      if (onValueChange) {
        onValueChange({
          ...value,
          [id]: v,
        });
      }
    };

    return (
      <Grid container spacing={{ xs: 2, md: 5 }}>
        {(schema as SchemaFieldObject).fields.map((item, i) => {
          if (item.data.config.enableWhen) {
            try {
              const fn = eval(item.data.config.enableWhen);
              if (!fn(value)) {
                return null;
              }
            } catch (err) {
              return null;
            }
          }
          if (item.data.type === SchemaFieldType.Number) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldNumber
                  label={item.name || item.id}
                  value={get(value, item.id)}
                  schema={item.data as SchemaFieldNumber}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.String) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldString
                  label={item.name || item.id}
                  schema={item.data as SchemaFieldString}
                  value={get(value, item.id)}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Boolean) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldBoolean
                  label={item.name || item.id}
                  schema={item.data as SchemaFieldBoolean}
                  value={get(value, item.id)}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Select) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldSelect
                  label={item.name || item.id}
                  schema={item.data as SchemaFieldSelect}
                  value={get(value, item.id)}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.File) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldFile
                  label={item.name || item.id}
                  schema={item.data as SchemaFieldFile}
                  value={get(value, item.id)}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Object) {
            const summary = item.data.config.summary.replace(
              /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
              (all) => {
                const word = all.substring(2, all.length - 2);
                if (word === '___key') {
                  return item.name;
                }
                const v = get(value[item.id], word, '');
                if (typeof v === 'object') {
                  return v[currentLang];
                }
                return v;
              }
            );
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <CollapseCard
                  title={summary}
                  initialExpand={item.data.config.initialExpand}
                >
                  <FieldContainer
                    schema={item.data || item.id}
                    value={get(value, item.id)}
                    onValueChange={(v) => objectValueChange(v, item.id)}
                  />
                </CollapseCard>
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Array) {
            return (
              <FieldArray
                key={item.id}
                label={item.name || item.id}
                schema={item.data as SchemaFieldArray}
                value={get(value, item.id)}
                onValueChange={(v) => objectValueChange(v, item.id)}
              />
            );
          }
          return null;
        })}
      </Grid>
    );
  } else if (schema.type === SchemaFieldType.String) {
    return (
      <Grid item xs={schema.config.colSpan}>
        <FieldString
          schema={schema as SchemaFieldString}
          value={value}
          onValueChange={(v) => onValueChange(v)}
        />
      </Grid>
    );
  } else if (schema.type === SchemaFieldType.Number) {
    return (
      <Grid item xs={schema.config.colSpan}>
        <FieldNumber
          schema={schema as SchemaFieldNumber}
          value={value}
          onValueChange={(v) => onValueChange(v)}
        />
      </Grid>
    );
  } else if (schema.type === SchemaFieldType.Select) {
    return (
      <Grid item xs={schema.config.colSpan}>
        <FieldSelect
          schema={schema as SchemaFieldSelect}
          value={value}
          onValueChange={(v) => onValueChange(v)}
        />
      </Grid>
    );
  } else if (schema.type === SchemaFieldType.Boolean) {
    return (
      <Grid item xs={schema.config.colSpan}>
        <FieldBoolean
          schema={schema as SchemaFieldBoolean}
          value={value}
          onValueChange={(v) => onValueChange(v)}
        />
      </Grid>
    );
  } else if (schema.type === SchemaFieldType.File) {
    return (
      <Grid item xs={schema.config.colSpan}>
        <FieldFile
          schema={schema as SchemaFieldFile}
          value={value}
          onValueChange={(v) => onValueChange(v)}
        />
      </Grid>
    );
  }
  return null;
};

export const FieldArray = ({
  className,
  label,
  schema,
  value,
  onValueChange,
}: {
  className?: string;
  label?: string;
  schema: SchemaFieldArray;
  value: any[];
  onValueChange?: (value: any) => void;
}) => {
  const [list, setList] = useState<any[]>(
    (value || []).map((item) => {
      return {
        id: generateUUID(),
        value: item,
      };
    })
  );
  const { currentLang, projectTranslations } = useContext(Context);

  const addItem = () => {
    setList((prev) => {
      return prev.concat({
        id: generateUUID(),
        value: schema.fieldSchema.config.needI18n
          ? generateUUID()
          : schema.fieldSchema.config.defaultValue,
      });
    });
  };

  const moveUpItem = (sourceIndex: number) => {
    setList((prev) => {
      const targetIndex = Math.max(sourceIndex - 1, 0);
      return prev.map((item, j) => {
        if (j === sourceIndex) {
          return prev[targetIndex];
        }
        if (j === targetIndex) {
          return prev[sourceIndex];
        }
        return item;
      }, []);
    });
  };
  const moveDownItem = (sourceIndex: number) => {
    setList((prev) => {
      const targetIndex = Math.min(sourceIndex + 1, prev.length - 1);
      return prev.map((item, j) => {
        if (j === sourceIndex) {
          return prev[targetIndex];
        }
        if (j === targetIndex) {
          return prev[sourceIndex];
        }
        return item;
      }, []);
    });
  };
  const deleteItem = (i: number) => {
    setList((prev) => {
      return prev.filter((_, j) => j !== i);
    });
  };

  useEffect(() => {
    if (onValueChange) {
      onValueChange(list.map((item) => item.value));
    }
  }, [list]);

  const onItemChange = (v: any, i: number) => {
    setList((prev) => {
      return prev.map((item, j) =>
        j === i ? { id: item.id, value: v } : item
      );
    });
  };

  return (
    <Grid className={className} item xs={schema.config.colSpan}>
      <CollapseCard
        title={label || ''}
        initialExpand={schema.config.initialExpand}
      >
        <div className="flex flex-col">
          {list.map((item, i) => {
            const summary = schema.config.summary.replace(
              /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
              (all) => {
                const word = all.substring(2, all.length - 2);
                if (word === '___key') {
                  return item.name;
                }
                if (word === '___index') {
                  return i + 1;
                }
                if (word.includes('___val')) {
                  if (schema.fieldSchema.type !== 'object') {
                    return schema.fieldSchema.type === 'string' &&
                      schema.fieldSchema.config.needI18n
                      ? projectTranslations[item.value][currentLang]
                      : item.value;
                  } else {
                    const wpath = word.split('.').splice(1).join('.');
                    const v = get(item.value, wpath);

                    const field = schema.fieldSchema.fields.find(
                      (f) => f.id === wpath
                    );

                    return field?.data?.type === 'string' &&
                      field?.data?.config?.needI18n
                      ? v[currentLang]
                      : v;
                  }
                }
                return item.value;
              }
            );
            return (
              <div key={item.id} className="w-full flex items-center mb-10">
                <div className="flex w-full items-center">
                  <CollapseCard
                    className="bg-slate-400 mr-2"
                    title={summary}
                    initialExpand={schema.config.initialExpand}
                  >
                    <FieldContainer
                      schema={schema.fieldSchema as SchemaField}
                      value={item.value}
                      onValueChange={(v) => onItemChange(v, i)}
                    />
                  </CollapseCard>
                  <RiArrowUpFill
                    className={classNames(ACITON_ICON_CLASS, 'mr-2')}
                    onClick={() => moveUpItem(i)}
                  />
                  <RiArrowDownFill
                    className={classNames(ACITON_ICON_CLASS, 'mr-2')}
                    onClick={() => moveDownItem(i)}
                  />
                  <RiDeleteBin2Fill
                    className={ACITON_ICON_CLASS}
                    onClick={() => deleteItem(i)}
                  />
                </div>
              </div>
            );
          })}
          <button
            className="mt-12 w-4/6 p-4 mx-auto mb-4 bg-slate-300 border-b-4 border-zinc-900 text-zinc-900 font-bold text-md hover:bg-slate-200 transition-all"
            onClick={addItem}
          >
            Add Item
          </button>
        </div>
      </CollapseCard>
    </Grid>
  );
};
