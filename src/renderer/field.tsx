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
import { useContext, useEffect, useRef, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CollapseCard from './components/collapse_card';
import Context from './context';

export const FieldContainer = ({
  schema,
  value,
  onValueChange,
}: {
  schema: SchemaField;
  value: any;
  onValueChange?: (value: any) => void;
}) => {
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
              <Grid item xs={item.data.config.colSpan} key={i}>
                <FieldNumber
                  key={i}
                  label={item.name}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.String) {
            return (
              <Grid item xs={item.data.config.colSpan} key={i}>
                <FieldString
                  key={i}
                  label={item.name}
                  schema={item.data as SchemaFieldString}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Boolean) {
            return (
              <Grid item xs={item.data.config.colSpan} key={i}>
                <FieldBoolean
                  key={i}
                  label={item.name}
                  schema={item.data as SchemaFieldBoolean}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Select) {
            return (
              <Grid item xs={item.data.config.colSpan} key={i}>
                <FieldSelect
                  key={i}
                  label={item.name}
                  schema={item.data as SchemaFieldSelect}
                  value={value[item.id]}
                  onValueChange={(v) => objectValueChange(v, item.id)}
                />
              </Grid>
            );
          } else if (item.data.type === SchemaFieldType.Object) {
            return (
              <Grid item xs={item.data.config.colSpan} key={i}>
                <CollapseCard
                  title={item.name}
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
                key={i}
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

export const FieldNumber = ({
  label,
  value,
  onValueChange,
}: {
  label?: string;
  value: number;
  onValueChange?: (value: any) => void;
}) => {
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          max: 100,
          min: 10,
        },
      }}
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
  const [list, setList] = useState<any[]>(value);

  const addItem = () => {
    setList((prev) => {
      return prev.concat(schema.fieldSchema.config.defaultValue);
    });
  };
  const deleteItem = (i: number) => {
    setList((prev) => {
      return prev.filter((_, j) => j !== i);
    });
  };

  useEffect(() => {
    if (onValueChange) {
      onValueChange(list);
    }
  }, [list]);

  const onItemChange = (v: any, i: number) => {
    setList((prev) => {
      return prev.map((item, j) => (j === i ? v : item));
    });
  };

  return (
    <Grid item xs={schema.config.colSpan}>
      <CollapseCard
        title={label || ''}
        initialExpand={schema.config.initialExpand}
      >
        <Stack spacing={2}>
          {list.map((item, i) => {
            return (
              <Stack spacing="2" direction="row" key={i}>
                <CollapseCard title={`# ${i + 1}`}>
                  <FieldContainer
                    schema={schema.fieldSchema as SchemaField}
                    value={item}
                    onValueChange={(v) => onItemChange(v, i)}
                  />
                </CollapseCard>
                <IconButton component="span" onClick={() => deleteItem(i)}>
                  <DeleteIcon />
                </IconButton>
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
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      onValueChange(
        schema.config.needI18n
          ? { ...value, [currentLang]: e.target.value }
          : e.target.value
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
          ? value ? value[currentLang] : ''
          : value;
    }
  }, [currentLang]);
  return (
    <>
      {schema.config.type === 'multiline' && (
        <TextField
          defaultValue={
            schemaConfig.i18n.length > 0 && schema.config.needI18n
              ? value ? value[currentLang] : ''
              : value
          }
          ref={textDomRef}
          style={{ width: '100%' }}
          label={label}
          size="small"
          rows="4"
          multiline
          onChange={onTextChange}
        />
      )}
      {schema.config.type === 'singleline' && (
        <TextField
          size="small"
          ref={textDomRef}
          defaultValue={
            schemaConfig.i18n.length > 0 && schema.config.needI18n
              ? value ? value[currentLang] : ''
              : value
          }
          style={{ width: '100%' }}
          label={label}
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
