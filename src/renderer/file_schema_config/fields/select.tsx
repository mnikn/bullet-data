import {
  SchemaFieldArray,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'models/schema';
import { FieldArray } from 'renderer/components/field';
import NumberField from 'renderer/components/field/number_field';

const OptionsSchema = new SchemaFieldArray(new SchemaFieldObject());
(OptionsSchema.fieldSchema as SchemaFieldObject).fields.push({
  id: 'label',
  name: 'label',
  data: new SchemaFieldString(),
});
(OptionsSchema.fieldSchema as SchemaFieldObject).fields.push({
  id: 'value',
  name: 'value',
  data: new SchemaFieldString(),
});
OptionsSchema.fieldSchema.config.defaultValue = (
  OptionsSchema.fieldSchema as SchemaFieldObject
).configDefaultValue;
OptionsSchema.config.colSpan = 12;
const ColSchema = new SchemaFieldNumber();

function ConfigSelectField({
  schema,
  onValueChange,
}: {
  schema: SchemaFieldSelect;
  onValueChange: (schema: SchemaFieldSelect) => void;
}) {
  return (
    <div className="flex flex-col">
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
    </div>
  );
}

export default ConfigSelectField;
