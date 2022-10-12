import { Grid } from '@mui/material';
import {
  SchemaFieldBoolean,
  SchemaFieldNumber,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import CollapseCard from 'renderer/components/collapse_card';
import FieldBoolean from 'renderer/components/field/boolean_field';
import NumberField from 'renderer/components/field/number_field';
import SelectField from 'renderer/components/field/select_field';
import StringField from 'renderer/components/field/string_field';

const MinLenSchema = new SchemaFieldNumber();
const MaxLenSchema = new SchemaFieldNumber();
const ColSchema = new SchemaFieldNumber();
ColSchema.config.defaultValue = 3;
const NeedI18nSchema = new SchemaFieldBoolean();
const DefaultValueSchema = new SchemaFieldString();
const TypeSchema = new SchemaFieldSelect();
TypeSchema.config = { ...TypeSchema.config };
TypeSchema.config.options = [
  {
    label: 'singleline',
    value: 'singleline',
  },
  {
    label: 'multiline',
    value: 'multiline',
  },
  {
    label: 'code',
    value: 'code',
  },
];
const EnableWhenSchema = new SchemaFieldString();
EnableWhenSchema.config.colSpan = 12;

function ConfigStringField({
  schema,
  onValueChange,
}: {
  schema: SchemaFieldString;
  onValueChange: (schema: SchemaFieldString) => void;
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
      <Grid item xs={1}>
        <FieldBoolean
          label={'needI18n'}
          value={schema.config.needI18n}
          schema={NeedI18nSchema}
          onValueChange={(v) => {
            schema.config.needI18n = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <StringField
          label={'defaultValue'}
          value={schema.config.defaultValue}
          schema={DefaultValueSchema}
          onValueChange={(v) => {
            schema.config.defaultValue = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <NumberField
          label={'minLen'}
          value={schema.config.minLen}
          schema={MinLenSchema}
          onValueChange={(v) => {
            schema.config.minLen = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <NumberField
          label={'maxLen'}
          value={schema.config.maxLen}
          schema={MaxLenSchema}
          onValueChange={(v) => {
            schema.config.maxLen = v;
            onValueChange(schema);
          }}
        />
      </Grid>
    </Grid>
  );
}

export default ConfigStringField;
