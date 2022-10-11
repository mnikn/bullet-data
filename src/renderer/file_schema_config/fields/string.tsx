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
    label: 'multilne',
    value: 'multilne',
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
        label={'enableWhen'}
        value={schema.config.enableWhen}
        schema={EnableWhenSchema}
        onValueChange={(v) => {
          schema.config.enableWhen = v;
          onValueChange(schema);
        }}
      />
      <FieldBoolean
        label={'needI18n'}
        value={schema.config.needI18n}
        schema={NeedI18nSchema}
        onValueChange={(v) => {
          schema.config.needI18n = v;
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
        label={'minLen'}
        value={schema.config.minLen}
        schema={MinLenSchema}
        onValueChange={(v) => {
          schema.config.minLen = v;
          onValueChange(schema);
        }}
      />
      <NumberField
        label={'maxLen'}
        value={schema.config.maxLen}
        schema={MaxLenSchema}
        onValueChange={(v) => {
          schema.config.maxLen = v;
          onValueChange(schema);
        }}
      />
    </div>
  );
}

export default ConfigStringField;
