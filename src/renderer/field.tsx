import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Stack,
  TextField,
} from '@mui/material';
import {
  SchemaField,
  SchemaFieldArray,
  SchemaFieldObject,
  SchemaFieldString,
  SchemaFieldType,
} from 'models/schema';
import { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

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
          } else if (item.data.type === SchemaFieldType.Object) {
            return (
              <Grid item xs={item.data.config.colSpan} key={i}>
                <Card>
                  <CardHeader subheader={item.name} />
                  <CardContent>
                    <FieldContainer
                      schema={item.data}
                      value={value[item.id]}
                      onValueChange={(v) => objectValueChange(v, item.id)}
                    />
                  </CardContent>
                </Card>
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
          onValueChange={onValueChange}
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
      onValueChange(e.target.value);
    }
  };
  return (
    <TextField
      style={{ width: '100%' }}
      type="number"
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
      switch (schema.fieldSchema?.type) {
        case SchemaFieldType.String:
          return prev.concat('');
        case SchemaFieldType.Array:
          return prev.concat([]);
        case SchemaFieldType.Number:
          return prev.concat(0);
        case SchemaFieldType.Object:
          return prev.concat({});
        case SchemaFieldType.Boolean:
          return prev.concat(false);
        case SchemaFieldType.File:
          return prev.concat('');
      }
      return prev;
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
      <Card>
        <CardHeader subheader={label} />
        <CardContent>
          <Stack spacing={2}>
            {list.map((item, i) => {
              return (
                <Stack spacing="2" direction="row" key={i}>
                  <FieldContainer
                    schema={schema.fieldSchema as SchemaField}
                    value={item}
                    onValueChange={(v) => onItemChange(v, i)}
                  />
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
        </CardContent>
      </Card>
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
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };
  return (
    <>
      {schema.config.type === 'multiline' && (
        <TextField
          defaultValue={value}
          style={{ width: '100%' }}
          label={label}
          rows="4"
          multiline
          onChange={onTextChange}
        />
      )}
      {schema.config.type === 'single-line' && (
        <TextField
          defaultValue={value}
          style={{ width: '100%' }}
          label={label}
          onChange={onTextChange}
        />
      )}
    </>
  );
};
