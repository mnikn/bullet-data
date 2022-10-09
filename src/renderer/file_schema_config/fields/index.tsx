import classNames from 'classnames';
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
import {
  RiArrowDownFill,
  RiArrowUpFill,
  RiDeleteBin2Fill,
} from 'react-icons/ri';
import CollapseCard from 'renderer/components/collapse_card';
import SelectField from 'renderer/components/field/select_field';
import FieldBoolean from 'renderer/components/field/boolean_field';
import StringField from 'renderer/components/field/string_field';
import ConfigBooleanField from './boolean';
import ConfigNumberField from './number';
import ConfigStringField from './string';

const ACITON_ICON_CLASS =
  'cursor-pointer font-bold text-2xl text-zinc-900 hover:text-zinc-500 transition-all z-10';
const TypeSchema = new SchemaFieldSelect();
TypeSchema.config = { ...TypeSchema.config };
TypeSchema.config.options = [
  {
    label: 'string',
    value: SchemaFieldType.String,
  },
  {
    label: 'number',
    value: SchemaFieldType.Number,
  },
  {
    label: 'boolean',
    value: SchemaFieldType.Boolean,
  },
  {
    label: 'select',
    value: SchemaFieldType.Select,
  },
  {
    label: 'object',
    value: SchemaFieldType.Object,
  },
  {
    label: 'array',
    value: SchemaFieldType.Array,
  },
];

const InitialExpandSchema = new SchemaFieldBoolean();
const SummarySchema = new SchemaFieldString();

function ConfigField({
  className,
  id,
  label,
  schema,
  isRoot = false,
  isObjectField = false,
  onDelete,
  onValueChange,
}: {
  className?: string;
  id?: string;
  label?: string;
  schema: SchemaField;
  isRoot?: boolean;
  isObjectField?: boolean;
  onDelete: (item: SchemaField) => void;
  onValueChange: (field: SchemaField, id?: string, label?: string) => void;
}) {
  const objectField =
    schema instanceof SchemaFieldObject ? (
      <div className="flex flex-col w-full items-center">
        <div className="font-bold text-xl mb-2">Config</div>

        <div className="mb-2 flex flex-col bg-slate-400 w-full p-5 border-r-4 border-b-4 border-t-2 border-l-2 border-zinc-900">
          <div className="grid grid-cols-4 gap-4">
            <FieldBoolean
              label={'initialExpand'}
              value={schema.config.initialExpand}
              schema={InitialExpandSchema}
              onValueChange={(v) => {
                schema.config.initialExpand = v;
                onValueChange(schema);
              }}
            />
            <StringField
              label={'summary'}
              value={schema.config.summary}
              schema={SummarySchema}
              onValueChange={(v) => {
                schema.config.summary = v;
                onValueChange(schema);
              }}
            />
          </div>
        </div>
        <div className="font-bold text-xl mb-2">Fields</div>
        <div
          className="flex flex-col w-full overflow-auto"
          style={{
            height: isRoot ? '400px' : '200px',
          }}
        >
          {(schema as SchemaFieldObject).fields.map((item) => {
            return (
              <ConfigField
                className="mb-5"
                id={item.id}
                label={item.name}
                schema={item.data}
                isObjectField
                onValueChange={(v, id, name) => {
                  item.data = v;
                  item.id = id || '';
                  item.name = name || '';
                  const instance = new SchemaFieldObject();
                  instance.fields = [...(schema as SchemaFieldObject).fields];
                  instance.config = {
                    ...(schema as SchemaFieldObject).config,
                  };
                  onValueChange(instance, id, label);
                }}
                onDelete={(childSchema) => {
                  const index = schema.fields.findIndex(
                    (d: any) => d.data === childSchema
                  );
                  schema.fields = schema.fields.filter((_, j) => index !== j);
                  onValueChange(schema, id, label);
                }}
              />
            );
          })}
        </div>
        <button
          className="flex-grow bg-slate-600 text-zinc-50 font-bold border-zinc-900 border-r-2 border-b-2 mr-4 hover:bg-slate-500 transition-all px-5 mb-2 mt-2 h-12"
          onClick={() => {
            const f = new SchemaFieldString();
            schema.fields.push({
              id: 'field_' + (schema.fields.length + 1),
              name: 'field_' + (schema.fields.length + 1),
              data: f,
            });
            onValueChange(schema, id, label);
          }}
        >
          Add schema field
        </button>
      </div>
    ) : null;

  if (isRoot) {
    return objectField;
  }
  return (
    <CollapseCard
      className={classNames('w-full', className)}
      title={
        <div className="flex items-center">
          {isObjectField && (
            <>
              <div className="mr-3">Id</div>
              <input
                className="p-1 mr-3 w-36"
                placeholder="id"
                defaultValue={id || ''}
                onChange={(e) => {
                  onValueChange(schema, e.target.value, label);
                }}
              />
              <div className="mr-3">Name</div>
              <input
                className="p-1 mr-3 w-36"
                placeholder="name"
                defaultValue={label || ''}
                onChange={(e) => {
                  onValueChange(schema, id, e.target.value);
                }}
              />
            </>
          )}
          <div className="mr-3">Type</div>
          <SelectField
            schema={TypeSchema}
            value={schema.type}
            onValueChange={(v) => {
              if (v === schema.type) {
                return;
              }
              let f: SchemaField = new SchemaFieldString();
              if (v === SchemaFieldType.String) {
                f = new SchemaFieldString();
              } else if (v === SchemaFieldType.Number) {
                f = new SchemaFieldNumber();
              } else if (v === SchemaFieldType.Boolean) {
                f = new SchemaFieldBoolean();
              } else if (v === SchemaFieldType.Select) {
                f = new SchemaFieldSelect();
              } else if (v === SchemaFieldType.Object) {
                f = new SchemaFieldObject();
              } else if (v === SchemaFieldType.Array) {
                f = new SchemaFieldArray(new SchemaFieldString());
              }
              onValueChange(f, id, label);
            }}
          />
        </div>
      }
      initialExpand={false}
      rightActions={
        <div className="flex">
          <RiArrowUpFill className={classNames(ACITON_ICON_CLASS, 'mr-2')} />
          <RiArrowDownFill className={classNames(ACITON_ICON_CLASS, 'mr-2')} />
          <RiDeleteBin2Fill
            className={classNames(ACITON_ICON_CLASS, 'mr-2')}
            onClick={() => {
              onDelete(schema);
            }}
          />
        </div>
      }
    >
      {schema instanceof SchemaFieldString && (
        <ConfigStringField schema={schema} onValueChange={onValueChange} />
      )}
      {schema instanceof SchemaFieldNumber && (
        <ConfigNumberField schema={schema} onValueChange={onValueChange} />
      )}
      {schema instanceof SchemaFieldBoolean && (
        <ConfigBooleanField schema={schema} onValueChange={onValueChange} />
      )}
      {schema instanceof SchemaFieldObject && objectField}
      {schema instanceof SchemaFieldArray && (
        <div className="flex flex-col w-full items-center">
          <div className="font-bold text-xl mb-2">Config</div>
          <div className="mb-2 flex flex-col bg-slate-400 w-full p-5 border-r-4 border-b-4 border-t-2 border-l-2 border-zinc-900">
            <div className="grid grid-cols-4 gap-4">
              <FieldBoolean
                label={'initialExpand'}
                value={schema.config.initialExpand}
                schema={InitialExpandSchema}
                onValueChange={(v) => {
                  schema.config.initialExpand = v;
                  onValueChange(schema);
                }}
              />
              <StringField
                label={'summary'}
                value={schema.config.summary}
                schema={SummarySchema}
                onValueChange={(v) => {
                  schema.config.summary = v;
                  onValueChange(schema);
                }}
              />
            </div>
          </div>

          <div className="font-bold text-xl mb-2">Child schema</div>
          <ConfigField
            schema={schema.fieldSchema}
            onValueChange={(v) => {
              schema.fieldSchema = v;
              onValueChange(schema);
            }}
            onDelete={onDelete}
          />
        </div>
      )}
    </CollapseCard>
  );
}

export default ConfigField;
