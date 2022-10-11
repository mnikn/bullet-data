import { Grid } from '@mui/material';
import {
  SchemaFieldBoolean,
  SchemaFieldNumber,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import FieldBoolean from 'renderer/components/field/boolean_field';
import NumberField from 'renderer/components/field/number_field';
import SelectField from 'renderer/components/field/select_field';
import StringField from 'renderer/components/field/string_field';

const MinLenSchema = new SchemaFieldNumber();
const MaxLenSchema = new SchemaFieldNumber();
const ColSchema = new SchemaFieldNumber();
ColSchema.config.defaultValue = 3;
const DefaultValueSchema = new SchemaFieldNumber();
DefaultValueSchema.config.defaultValue = 0;
const TypeSchema = new SchemaFieldSelect();
TypeSchema.config = { ...TypeSchema.config };
TypeSchema.config.options = [
  {
    label: 'int',
    value: 'int',
  },
  {
    label: 'float',
    value: 'float',
  },
];
const EnableWhenSchema = new SchemaFieldString();

function ConfigNumberField({
  schema,
  onValueChange,
}: {
  schema: SchemaFieldNumber;
  onValueChange: (schema: SchemaFieldNumber) => void;
}) {
  return (
    <Grid container spacing={{ xs: 2, md: 5 }}>
      <Grid item xs={4}>
        <SelectField
          label={'type'}
          value={schema.config.type}
          schema={TypeSchema}
          onValueChange={(v) => {
            schema.config.type = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <NumberField
          label={'colSpan'}
          value={schema.config.colSpan}
          schema={ColSchema}
          onValueChange={(v) => {
            schema.config.colSpan = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <NumberField
          label={'defaultValue'}
          value={schema.config.defaultValue}
          schema={DefaultValueSchema}
          onValueChange={(v) => {
            schema.config.defaultValue = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <NumberField
          label={'min'}
          value={schema.config.min}
          schema={MinLenSchema}
          onValueChange={(v) => {
            schema.config.min = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <NumberField
          label={'maxLen'}
          value={schema.config.max}
          schema={MaxLenSchema}
          onValueChange={(v) => {
            schema.config.max = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <StringField
          label={'enableWhen'}
          value={schema.config.enableWhen}
          schema={EnableWhenSchema}
          onValueChange={(v) => {
            schema.config.enableWhen = v;
            onValueChange(schema);
          }}
        />
      </Grid>
    </Grid>
  );
}

export default ConfigNumberField;
