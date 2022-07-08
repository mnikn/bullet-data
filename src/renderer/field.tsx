import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import get from 'lodash/get';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldBoolean,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
  SchemaFieldType,
} from 'models/schema';
import { useContext, useEffect, useRef, useState } from 'react';
import { generateUUID } from 'utils/uuid';
import CollapseCard from './components/collapse_card';
import Context from './context';
import useListWithKey from './hooks/utils/use_list_with_key';
import FieldNumber from './number_field';

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
      <Grid container spacing={{ xs: 2, md: 2 }}>
        {(schema as SchemaFieldObject).fields.map((item, i) => {
          if (item.data.config.enableWhen) {
            const fn = eval(item.data.config.enableWhen);
            if (!fn(value)) {
              return null;
            }
          }
          if (item.data.type === SchemaFieldType.Number) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldNumber
                  label={item.name}
                  value={value[item.id]}
                  schema={item.data as SchemaFieldNumber}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.String) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldString
                  label={item.name}
                  schema={item.data as SchemaFieldString}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Boolean) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldBoolean
                  label={item.name}
                  schema={item.data as SchemaFieldBoolean}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Select) {
            return (
              <Grid item xs={item.data.config.colSpan} key={item.id}>
                <FieldSelect
                  label={item.name}
                  schema={item.data as SchemaFieldSelect}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Object) {
            const summary = item.data.config.summary.replace(
              /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
              (all) => {
                const word = all.substring(2, all.length - 2);
                if (word === '_key') {
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
                    schema={item.data}
                    value={value[item.id]}
                    onValueChange={(v) => objectValueChange(v, item.id)}
                  />
                </CollapseCard>
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Array) {
            return (
              <FieldArray
                key={item.id}
                label={item.name}
                schema={item.data as SchemaFieldArray}
                value={value[item.id]}
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
  }
  return null;
};

export const FieldArray = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldArray;
  value: any[];
  onValueChange?: (value: any) => void;
}) => {
  /* const [list, setList] = useState<any[]>(
   *   value.map((item) => {
   *     return {
   *       id: generateUUID(),
   *       value: item,
   *     };
   *   })
   * );
   */
  const [list, { push, removeAt, updateAt, set }] = useListWithKey(value);

  const addItem = () => {
    push(schema.fieldSchema.config.defaultValue);
  };

  const moveUpItem = (sourceIndex: number) => {
    const targetIndex = Math.max(sourceIndex - 1, 0);
    const newList = list.map((item, j) => {
      if (j === sourceIndex) {
        return list[targetIndex];
      }
      if (j === targetIndex) {
        return list[sourceIndex];
      }
      return item;
    }, []);
    set(newList);
  };
  const moveDownItem = (sourceIndex: number) => {
    const targetIndex = Math.min(sourceIndex + 1, prev.length - 1);
    const newList = list.map((item, j) => {
      if (j === sourceIndex) {
        return list[targetIndex];
      }
      if (j === targetIndex) {
        return list[sourceIndex];
      }
      return item;
    }, []);
    set(newList);
  };
  const deleteItem = (i: number) => {
    removeAt(i);
    /* setList((prev) => {
     *   return prev.filter((_, j) => j !== i);
     * }); */
  };

  useEffect(() => {
    if (onValueChange) {
      onValueChange(list.map((item) => item.data));
    }
  }, [list]);

  const onItemChange = (v: any, i: number) => {
    updateAt(v, i);
    /* setList((prev) => {
     *   return prev.map((item, j) =>
     *     j === i ? { id: item.id, value: v } : item
     *   );
     * }); */
  };

  return (
    <Grid item xs={schema.config.colSpan}>
      <CollapseCard
        title={label || ''}
        initialExpand={schema.config.initialExpand}
      >
        <Stack spacing={1}>
          {list.map((item, i) => {
            return (
              <Stack
                key={item.id}
                spacing={1}
                direction="row"
                style={{ width: '100%', alignItems: 'center' }}
              >
                <Stack spacing="2" direction="row" sx={{ flexGrow: 1 }}>
                  <CollapseCard
                    title={`# ${i + 1}`}
                    initialExpand={
                      (schema.fieldSchema as SchemaField).config.initialExpand
                    }
                  >
                    <FieldContainer
                      schema={schema.fieldSchema as SchemaField}
                      value={item.value}
                      onValueChange={(v) => onItemChange(v, i)}
                    />
                  </CollapseCard>
                  <IconButton onClick={() => moveUpItem(i)} color="primary">
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton onClick={() => moveDownItem(i)} color="primary">
                    <ArrowDownwardIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteItem(i)} color="primary">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            );
          })}
          <Button variant="contained" onClick={addItem}>
            Add Item
          </Button>
        </Stack>
      </CollapseCard>
    </Grid>
  );
};

export const FieldString = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldString;
  value: string;
  onValueChange?: (value: any) => void;
}) => {
  const textDomRef = useRef<any>(null);
  const { currentLang, schemaConfig } = useContext(Context);
  const [errorText, setErrorText] = useState<string | null>(null);
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    if (schema.config.required && !textValue) {
      setErrorText('Text cannot be empty');
      return;
    }
    if (textValue.length < schema.config.minLen) {
      setErrorText(`Text length must more than ${schema.config.minLen}`);
      return;
    }
    if (textValue.length > schema.config.maxLen) {
      setErrorText(`Text length must less than ${schema.config.maxLen}`);
      return;
    }
    if (schema.config.customValidate) {
      const fn = eval(schema.config.customValidate);
      if (fn) {
        const success = fn(textValue);
        if (!success) {
          setErrorText(
            schema.config.customValidateErrorText || 'Custom validate error'
          );
          return;
        }
      }
    }
    setErrorText(null);
    if (onValueChange) {
      onValueChange(
        schema.config.needI18n
          ? { ...value, [currentLang]: textValue }
          : textValue
      );
    }
  };

  useEffect(() => {
    if (textDomRef.current) {
      let dom = textDomRef.current.querySelector('input');
      if (!dom) {
        dom = textDomRef.current.querySelector('textarea');
      }
      dom.value =
        schemaConfig.i18n.length > 0 && schema.config.needI18n
          ? value
            ? value[currentLang]
            : ''
          : value || '';
    }
  }, [currentLang]);
  return (
    <>
      {schema.config.type === 'multiline' && (
        <TextField
          defaultValue={
            schemaConfig.i18n.length > 0 && schema.config.needI18n
              ? value
                ? value[currentLang]
                : ''
              : value || ''
          }
          ref={textDomRef}
          style={{ width: '100%' }}
          label={label}
          size="small"
          rows={schema.config.rows}
          error={!!errorText}
          multiline
          required={schema.config.required}
          helperText={errorText}
          onChange={onTextChange}
        />
      )}
      {schema.config.type === 'singleline' && (
        <TextField
          size="small"
          ref={textDomRef}
          defaultValue={
            schemaConfig.i18n.length > 0 && schema.config.needI18n
              ? value
                ? value[currentLang]
                : ''
              : value || ''
          }
          style={{ width: '100%' }}
          label={label}
          required={schema.config.required}
          error={!!errorText}
          helperText={errorText || schema.config.helperText}
          onChange={onTextChange}
        />
      )}
    </>
  );
};

export const FieldBoolean = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldBoolean;
  value: boolean;
  onValueChange?: (value: boolean) => void;
}) => {
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e.target.checked);
    }
  };
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={value} />}
        label={label || ''}
        onChange={onChange}
      />
    </FormGroup>
  );
};

export const FieldSelect = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldSelect;
  value: string;
  onValueChange?: (value: boolean) => void;
}) => {
  const onChange = (e: any) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={value}
        label={label || ''}
        onChange={onChange}
        size="small"
      >
        {schema.config.options.map((item, i) => {
          return (
            <MenuItem key={i} value={item}>
              {item}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
