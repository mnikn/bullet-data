import { Modal } from '@mui/material';
import { SchemaFieldObject } from 'models/schema';
import { useContext, useEffect, useState } from 'react';
import Context from '../context';
import { EVENT, eventBus } from '../event';
import ConfigField from './fields';

const FileSchemaConfig = ({ initialValue }: { initialValue: any }) => {
  const [visible, setVisible] = useState(false);
  const { schema } = useContext(Context);

  const [configSchema, setConfigSchema] = useState<SchemaFieldObject>(
    new SchemaFieldObject()
  );

  useEffect(() => {
    if (schema && visible) {
      const instance = new SchemaFieldObject();
      instance.fields = [...(schema as SchemaFieldObject).fields];
      instance.config = { ...(schema as SchemaFieldObject).config };
      setConfigSchema(instance);
    }
  }, [schema, visible]);

  useEffect(() => {
    const show = () => {
      setVisible(true);
    };
    eventBus.on(EVENT.SHOW_FILE_SCHEMA_CONFIG, show);
    return () => {
      eventBus.off(EVENT.SHOW_FILE_SCHEMA_CONFIG, show);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      open
      onClose={() => {
        // setVisible(false);
        return false;
      }}
    >
      <div
        className="absolute bg-slate-400 p-4 pb-5"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 850,
          height: 780,
          borderRadius: '0px',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full items-center">
            <div className="text-slate-900 font-bold text-2xl mb-5">
              File Schema Config
            </div>

            <ConfigField
              schema={configSchema}
              isRoot
              onValueChange={(v) => {
                const instance = new SchemaFieldObject();
                instance.fields = [...configSchema.fields];
                instance.config = {
                  ...configSchema.config,
                };
                setConfigSchema(instance);
              }}
              onDelete={(childSchema) => {
                const index = configSchema.fields.findIndex(
                  (d: any) => d.data === childSchema
                );
                configSchema.fields = configSchema.fields.filter(
                  (_, j) => index !== j
                );

                const instance = new SchemaFieldObject();
                instance.fields = [...configSchema.fields];
                instance.config = {
                  ...configSchema.config,
                };

                setConfigSchema(instance);
              }}
            />
          </div>
          <div className="flex h-12 flex-shrink-0">
            <button
              className="flex-grow bg-rose-600 text-zinc-50 font-bold border-zinc-900 border-r-2 border-b-2 mr-4 hover:bg-rose-500 transition-all"
              onClick={() => {
                setVisible(false);
              }}
            >
              Cancel
            </button>
            <button
              className="flex-grow bg-slate-300 text-zinc-900 font-bold border-zinc-900 border-r-2 border-b-2 hover:bg-slate-200 transition-all"
              onClick={async () => {
                try {
                  const configData = {
                    ...initialValue,
                    schema: configSchema.toJson(),
                  };
                  eventBus.emit(EVENT.FILE_SCHEMA_CHANGED, configData);
                  setVisible(false);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FileSchemaConfig;
