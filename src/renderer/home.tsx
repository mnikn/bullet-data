import { useEffect, useState } from 'react';
import get from 'lodash/get';
import {
  Card,
  CardContent,
  CardHeader,
  Menu,
  MenuItem,
  Collapse,
  Fab,
  IconButton,
  Stack,
  Button,
  CircularProgress,
  CssBaseline,
  GlobalStyles,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { FieldContainer } from './field';
import {
  DEFAULT_CONFIG,
  SchemaField,
  SchemaFieldArray,
  SchemaFieldBoolean,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldSelect,
  SchemaFieldString,
  SchemaFieldType,
} from 'models/schema';
import SchemaConfig from './schema_config';
import { VALUE_PATH } from 'constatnts/storage_key';

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  marginRight: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function buildSchema(json: any): SchemaField {
  switch (json.type) {
    case SchemaFieldType.Object: {
      const instance = new SchemaFieldObject();
      instance.setup(json.config);
      instance.fields = Object.keys(json.fields).map((key: string) => {
        const data: any = {
          type: json.fields[key].type,
          config: json.fields[key].config,
        };
        if (json.fields[key].type === SchemaFieldType.Array) {
          data.fieldSchema = json.fields[key].fieldSchema;
        } else if (json.fields[key].type === SchemaFieldType.Object) {
          data.fields = json.fields[key].fields;
        }
        const subfield = buildSchema(data);
        return {
          id: key,
          name: json.fields[key].name,
          data: subfield,
        };
      });
      instance.config.defaultValue = instance.configDefaultValue;
      return instance;
    }
    case SchemaFieldType.Array: {
      const data: any = {
        type: json.fieldSchema.type,
        config: json.fieldSchema.config,
      };

      if (json.fieldSchema.type === SchemaFieldType.Array) {
        data.fieldSchema = json.fieldSchema.fieldSchema;
      } else if (json.fieldSchema.type === SchemaFieldType.Object) {
        data.fields = json.fieldSchema.fields;
      }
      const instance = new SchemaFieldArray(buildSchema(data));
      instance.setup(json.config);
      console.log(instance);
      return instance;
    }
    case SchemaFieldType.String: {
      const instance = new SchemaFieldString();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Number: {
      const instance = new SchemaFieldNumber();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Boolean: {
      const instance = new SchemaFieldBoolean();
      instance.setup(json.config);
      return instance;
    }
    case SchemaFieldType.Select: {
      const instance = new SchemaFieldSelect();
      instance.setup(json.config);
      return instance;
    }
  }
  return new SchemaFieldObject();
}

function validateValue(value: any, schema: SchemaField): any {
  if (schema.type === SchemaFieldType.Array) {
    if (Array.isArray(value)) {
      return value.map((item) => {
        return validateValue(item, (schema as SchemaFieldArray).fieldSchema);
      });
    } else {
      return schema.config.defaultValue;
    }
  }
  if (schema.type === SchemaFieldType.Object) {
    if (typeof value === 'object' && value !== null) {
      const objFields = (schema as SchemaFieldObject).fields.map((t) => t.id);
      const r1 = Object.keys(value).reduce((res2: any, key) => {
        if (objFields.includes(key)) {
          res2[key] = validateValue(
            value[key],
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)?.data
          );
        }
        return res2;
      }, {});
      const r2 = objFields.reduce((res: any, key) => {
        if (!Object.keys(value).includes(key)) {
          res[key] = validateValue(
            null,
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)?.data
          );
        }
        return res;
      }, {});
      return { ...r1, ...r2 };
    } else {
      return (schema as SchemaFieldObject).configDefaultValue;
    }
  }

  if (schema.type === SchemaFieldType.String) {
    if (typeof value === 'string') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Number) {
    if (typeof value === 'number') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Boolean) {
    if (typeof value === 'boolean') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Select) {
    if (typeof value === 'string') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  return value;
}

const Item = ({
  schema,
  value,
  index,
  onValueChange,
  onDelete,
  schemaConfig,
}: {
  schema: SchemaField;
  schemaConfig: any;
  value: any;
  onValueChange?: (v: any) => void;
  index: number;
  onDelete: () => void;
}) => {
  const [expanded, setExpanded] = useState<boolean>(
    (schema as SchemaFieldObject).config.initialExpand
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const settingsMenuOpen = Boolean(anchorEl);
  const handleExpandClick = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };
  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const summary = schemaConfig.summary.replace(
    /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
    (all) => {
      const item = all.substring(2, all.length - 2);
      if (item === '_index') {
        return index;
      }
      return get(value, item, '');
    }
  );

  return (
    <Card>
      <CardHeader
        subheader={summary}
        action={
          <>
            <IconButton aria-label="settings" onClick={handleSettingsClick}>
              <MoreVertIcon />
            </IconButton>
            <ExpandMore expand={expanded} onClick={handleExpandClick}>
              <ExpandMoreIcon />
            </ExpandMore>
          </>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <FieldContainer
            schema={schema}
            value={value}
            onValueChange={onValueChange}
          />
        </CardContent>
      </Collapse>
      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={settingsMenuOpen}
        onClose={handleSettingsClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            onDelete();
            handleSettingsClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

const fileName = 'test';
const baseUrl = 'D:\\test_data\\';
const Home = () => {
  const [list, setList] = useState<SchemaField[]>([]);
  const [valueList, setValueList] = useState<any[]>([]);
  const [schemaConfigOpen, setSchemaConfigOpen] = useState(false);
  const [schemaConfig, setSchemaConfig] = useState<any>(null);

  const [schema, setSchema] = useState<SchemaField | null>(null);

  useEffect(() => {
    const configPath = baseUrl + fileName + '.config.json';
    window.electron.ipcRenderer.on('readFile', (val) => {
      if (val.filePath === configPath && val.data) {
        setSchemaConfig(JSON.parse(val.data));
      }
    });
    window.electron.ipcRenderer.readFile(configPath);
  }, []);

  useEffect(() => {
    if (!schema) {
      return;
    }
    const valuePath = localStorage.getItem(VALUE_PATH);
    if (!valuePath) {
      return;
    }

    const readFile = (val) => {
      if (val.filePath === valuePath) {
        const data = JSON.parse(val.data);
        const formatData = data.map((item) => {
          return validateValue(item, schema);
        });
        console.log(formatData);
        setValueList(formatData);
      }
    };
    window.electron.ipcRenderer.on('readFile', readFile);
    window.electron.ipcRenderer.readFile(valuePath);

    return () => {
      window.electron.ipcRenderer.removeListener('readFile', readFile);
    };
  }, [schema]);

  useEffect(() => {
    const storeData = () => {
      /* window.electron.ipcRenderer.emit('saveFile'); */
      return;
    };

    window.addEventListener('beforeunload', storeData);

    setList((prev) => {
      if (prev.length !== valueList.length) {
        return valueList.map(() => schema);
      }
      return prev;
    });

    const timer = setInterval(storeData, 1 * 60 * 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', storeData);
    };
  }, [valueList]);

  const onItemChange = (v: any, i: number) => {
    setValueList((prev) => {
      return prev.map((item, j) => (j === i ? v : item));
    });
  };
  const onItemDelete = (i: number) => {
    setValueList((prev) => {
      return prev.filter((_, j) => j !== i);
    });
  };

  const onSchemaConfigSubmit = (v: any) => {
    setSchema(null);
    const configPath = baseUrl + fileName + '.config.json';
    window.electron.ipcRenderer.once('writeFile', (val) => {
      window.location.reload();
    });
    window.electron.ipcRenderer.writeFile(
      configPath,
      JSON.stringify(v, null, 2)
    );
  };

  useEffect(() => {
    if (schemaConfig) {
      setSchema(buildSchema(schemaConfig.schema));
    }
  }, [schemaConfig]);

  useEffect(() => {
    window.electron.ipcRenderer.on('openFileDialog', (val) => {
      console.log(val);
    });
  }, []);

  useEffect(() => {
    const saveFile = (val) => {
      const valuePath = localStorage.getItem(VALUE_PATH);
      if (valuePath) {
        window.electron.ipcRenderer.writeFile(
          valuePath,
          JSON.stringify(valueList, null, 2)
        );
      } else {
        window.electron.ipcRenderer.once('saveFileDialog', (val2) => {
          localStorage.setItem(VALUE_PATH, val2.res.path);
        });
        window.electron.ipcRenderer.saveFileDialog({
          action: 'save-file',
          data: JSON.stringify(valueList, null, 2),
        });
      }
    };
    window.electron.ipcRenderer.on('saveFile', saveFile);

    return () => {
      window.electron.ipcRenderer.removeAllListeners('saveFile');
    };
  }, [valueList]);

  if (!schema) {
    return (
      <CircularProgress
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
        }}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#e7ebf0',
        padding: '20px',
      }}
    >
      <CssBaseline enableColorScheme />
      <GlobalStyles
        styles={{
          scrollBaseColor: 'rgba(0, 0, 0, 0)',

          /* webkit */
          '*::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '*::-webkit-scrollbar-corner': {
            backgroundColor: 'transparent',
          },

          /* firefox */
          scrollbarWidth: 'thin',
          scrollbarFaceColor: '#cccccc',
          scrollbarShadowColor: '#cccccc',
          scrollbarArrowColor: '#cccccc',
          scrollbarHighlightColor: '#cccccc',
          scrollbarDarkshadowColor: '#cccccc',
          scrollbarTrackColor: 'rgb(245, 245, 245)',
          /* firefox */
          scrollbarColor: '#e8e8e8 rgba(0, 0, 0, 0)',
          /* webkit */
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#5c5c5c',
            borderRadius: '3px',
          },
        }}
      />
      <Stack spacing={2}>
        <Button
          style={{ width: '240px', marginLeft: 'auto' }}
          variant="contained"
          onClick={() => {
            setSchemaConfigOpen(true);
          }}
        >
          Config
        </Button>
        {list.map((item, i) => {
          return (
            <Item
              key={i}
              index={i + 1}
              schema={item}
              schemaConfig={schemaConfig}
              value={valueList[i]}
              onValueChange={(v) => onItemChange(v, i)}
              onDelete={() => onItemDelete(i)}
            />
          );
        })}
      </Stack>

      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
        color="primary"
        onClick={() => {
          if (!schema) {
            return;
          }
          setValueList((prevArr) => {
            return prevArr.concat(schema.config.defaultValue);
          });
        }}
      >
        <AddIcon />
      </Fab>

      {schemaConfigOpen && (
        <SchemaConfig
          initialValue={
            schemaConfig || {
              summary: '#{{_index}} {{name}}',
              schema: {
                type: 'object',
                fields: {},
                config: DEFAULT_CONFIG.OBJECT,
              },
            }
          }
          onSubmit={onSchemaConfigSubmit}
          close={() => {
            setSchemaConfigOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
