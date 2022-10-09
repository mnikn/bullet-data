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
const DefaultValueSchema = new SchemaFieldString();
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

function ConfigNumberField({
  schema,
  onValueChange,
}: {
  schema: SchemaFieldNumber;
  onValueChange: (schema: SchemaFieldNumber) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <SelectField
        label={'type'}
        value={schema.config.type}
        schema={TypeSchema}
        onValueChange={(v) => {
          schema.config.type = v;
          onValueChange(schema);
        }}
      />
      <NumberField
        label={'colSpan'}
        value={schema.config.colSpan}
        schema={ColSchema}
        onValueChange={(v) => {
          schema.config.colSpan = v;
          onValueChange(schema);
        }}
      />
      <StringField
        label={'defaultValue'}
        value={schema.config.defaultValue}
        schema={DefaultValueSchema}
        onValueChange={(v) => {
          schema.config.defaultValue = v;
          onValueChange(schema);
        }}
      />
      <NumberField
        label={'min'}
        value={schema.config.min}
        schema={MinLenSchema}
        onValueChange={(v) => {
          schema.config.min = v;
          onValueChange(schema);
        }}
      />
      <NumberField
        label={'maxLen'}
        value={schema.config.max}
        schema={MaxLenSchema}
        onValueChange={(v) => {
          schema.config.max = v;
          onValueChange(schema);
        }}
      />
    </div>
  );
}

export default ConfigNumberField;
