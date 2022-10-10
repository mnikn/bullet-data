import {
  SchemaFieldFile,
  SchemaFieldNumber,
  SchemaFieldSelect
} from 'models/schema';
import NumberField from 'renderer/components/field/number_field';
import SelectField from 'renderer/components/field/select_field';

const ColSchema = new SchemaFieldNumber();
const TypeSchema = new SchemaFieldSelect();
TypeSchema.config = { ...TypeSchema.config };
TypeSchema.config.options = [
  {
    label: 'img',
    value: 'img',
  },
];

function ConfigFileField({
  schema,
  onValueChange,
}: {
  schema: SchemaFieldFile;
  onValueChange: (schema: SchemaFieldFile) => void;
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
    </div>
  );
}

export default ConfigFileField;
