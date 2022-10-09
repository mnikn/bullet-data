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

const ColSchema = new SchemaFieldNumber();
const DefaultValueSchema = new SchemaFieldBoolean();

function ConfigBooleanField({
  schema,
  onValueChange,
}: {
  schema: SchemaFieldBoolean;
  onValueChange: (schema: SchemaFieldBoolean) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <NumberField
        label={'colSpan'}
        value={schema.config.colSpan}
        schema={ColSchema}
        onValueChange={(v) => {
          schema.config.colSpan = v;
          onValueChange(schema);
        }}
      />
      <FieldBoolean
        label={'defaultValue'}
        value={schema.config.defaultValue}
        schema={DefaultValueSchema}
        onValueChange={(v) => {
          schema.config.defaultValue = v;
          onValueChange(schema);
        }}
      />
    </div>
  );
}

export default ConfigBooleanField;