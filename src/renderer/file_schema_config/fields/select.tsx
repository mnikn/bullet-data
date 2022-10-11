import { Grid } from '@mui/material';
import {
  SchemaFieldArray,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import { FieldArray } from 'renderer/components/field';
import NumberField from 'renderer/components/field/number_field';
import StringField from 'renderer/components/field/string_field';

const OptionsSchema = new SchemaFieldArray(new SchemaFieldObject());
OptionsSchema.config.initialExpand = true;
(OptionsSchema.fieldSchema as SchemaFieldObject).fields.push({
  id: 'label',
  name: 'label',
  data: new SchemaFieldString(),
});
(
  OptionsSchema.fieldSchema as SchemaFieldObject
).fields[0].data.config.colSpan = 6;
(OptionsSchema.fieldSchema as SchemaFieldObject).fields.push({
  id: 'value',
  name: 'value',
  data: new SchemaFieldString(),
});
(
  OptionsSchema.fieldSchema as SchemaFieldObject
).fields[1].data.config.colSpan = 6;
OptionsSchema.fieldSchema.config.defaultValue = (
  OptionsSchema.fieldSchema as SchemaFieldObject
).configDefaultValue;
OptionsSchema.config.colSpan = 12;
const ColSchema = new SchemaFieldNumber();
const EnableWhenSchema = new SchemaFieldString();
EnableWhenSchema.config.colSpan = 12;
const DefaultValueSchema = new SchemaFieldString();

function ConfigSelectField({
  schema,
  onValueChange,
}: {
  schema: SchemaFieldSelect;
  onValueChange: (schema: SchemaFieldSelect) => void;
}) {
  return (
    <Grid container spacing={{ xs: 2, md: 5 }}>
      <Grid item xs={12}>
        <FieldArray
          className="flex-grow"
          label={'options'}
          value={schema.config.options}
          schema={OptionsSchema}
          onValueChange={(v) => {
            schema.config.options = v;
            onValueChange(schema);
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <NumberField
          className="mb-5"
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
      <Grid item xs={12}>
        <StringField
          label={'enableWhen'}
          className="mb-5"
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

export default ConfigSelectField;
