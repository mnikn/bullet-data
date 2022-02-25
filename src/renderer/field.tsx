import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Stack,
  Checkbox,
  FormControlLabel,
  TextField,
  FormGroup,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
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
import { useContext, useEffect, useRef, useState, forwardRef } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import get from 'lodash/get';
import { Base64 } from 'js-base64';
import CollapseCard from './components/collapse_card';
import Context from './context';
import { generateUUID } from 'utils/uuid';
import NumberFormat from 'react-number-format';

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

const NumberFormatCustom = forwardRef((props, ref) => {
  const { onChange, schema, ...other } = props;

  const format = (v) => {
    /* if (schema.config.type === 'percent') {
     *   return String(Number(v) * 100) + '%';
     * } */
    return v + schema.config.suffix;
  };

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: Number(values.value),
          },
        });
      }}
      format={format}
      type="text"
      defaultValue={props.defaultValue}
    />
  );
});

export const FieldNumber = ({
  label,
  value,
  schema,
  onValueChange,
}: {
  label?: string;
  value: number;
  schema: SchemaFieldNumber;
  onValueChange?: (value: any) => void;
}) => {
  const [errorText, setErrorText] = useState<string | null>(null);
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = Number(e.target.value);
    if (schema.config.required && !textValue) {
      setErrorText('Number cannot be empty');
      return;
    }
    if (textValue < schema.config.min) {
      setErrorText(`Number must more than ${schema.config.min}`);
      return;
    }
    if (textValue > schema.config.max) {
      setErrorText(`Number must less than ${schema.config.max}`);
      return;
    }
    if (schema.config.type === 'int' && !Number.isInteger(textValue)) {
      setErrorText(`Number must be integer`);
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
      onValueChange(Number(e.target.value));
    }
  };

  return (
    <TextField
      style={{ width: '100%' }}
      type="number"
      size="small"
      InputProps={{
        inputProps: {
          max: schema.config.max,
          min: schema.config.min,
          schema: schema,
        },
        inputComponent: NumberFormatCustom,
      }}
      required={schema.config.required}
      error={!!errorText}
      helperText={errorText || schema.config.helperText}
      label={label}
      defaultValue={value}
      onChange={onTextChange}
    />
  );
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
  const [list, setList] = useState<any[]>(
    value.map((item) => {
      return {
        id: generateUUID(),
        value: item,
      };
    })
  );

  const addItem = () => {
    setList((prev) => {
      return prev.concat({
        id: generateUUID(),
        value: schema.fieldSchema.config.defaultValue,
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
                  <CollapseCard title={`# ${i + 1}`}>
                    <FieldContainer
                      schema={schema.fieldSchema as SchemaField}
                      value={item.value}
                      onValueChange={(v) => onItemChange(v, i)}
                    />
                  </CollapseCard>
                  <IconButton component="span" onClick={() => moveUpItem(i)}>
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton component="span" onClick={() => moveDownItem(i)}>
                    <ArrowDownwardIcon />
                  </IconButton>
                  <IconButton component="span" onClick={() => deleteItem(i)}>
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
