import { useCallback, useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
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
import useDebounce from 'utils/use_debounce';

const DEFAULT_SCHEMA_CONFIG = {
  summary: '#{{_index}}',
  schema: {
    type: 'object',
    fields: {},
    config: DEFAULT_CONFIG.OBJECT,
  },
};

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

const grid = 6;

const HIDDEN_ID = '$$__index';

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : '#e7ebf0',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : '#e7ebf0',
  padding: grid,
  width: 250,
});

function getConfigPath(valuePath: string) {
  if (!valuePath) {
    return '';
  }
  const p1 = valuePath.split('.json')[0];
  const fileName = p1.split('\\')[p1.split('\\').length - 1];
  const baseUrl = p1.split(fileName)[0];
  return baseUrl + `.${fileName}.config.json`;
}

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

const Home = () => {
  const [list, setList] = useState<SchemaField[]>([]);
  const [valueList, setActualValueList] = useState<any[]>([]);
  const [schemaConfigOpen, setSchemaConfigOpen] = useState(false);
  const [schemaConfig, setSchemaConfig] = useState<any>(null);

  const [schema, setSchema] = useState<SchemaField | null>(null);

  const setValueListRef = useRef(
    throttle((newValue) => setActualValueList(newValue), 1000)
  );
  const setValueList = setValueListRef.current;

  useEffect(() => {
    /* const configPath = baseUrl + fileName + '.config.json'; */

    const valuePath = localStorage.getItem(VALUE_PATH);
    if (valuePath) {
      const configUrl = getConfigPath(valuePath);
      if (configUrl) {
        /* window.electron.ipcRenderer.once('readFile', (val) => {
         *   console.log(val);
         *   if (val.filePath === configUrl && val.data) {
         *     setSchemaConfig(JSON.parse(val.data));
         *   } else {
         *     setSchemaConfig(DEFAULT_SCHEMA_CONFIG);
         *   }
         * }); */
        window.electron.ipcRenderer.readJsonFile(
          {
            filePath: configUrl,
            action: 'read-config',
          },
          (val) => {
            setSchemaConfig(JSON.parse(val.data));
          }
        );
      } else {
        setSchemaConfig(DEFAULT_SCHEMA_CONFIG);
      }
    } else {
      setSchemaConfig(DEFAULT_SCHEMA_CONFIG);
    }
  }, []);

  const save = useCallback(() => {
    const valuePath = localStorage.getItem(VALUE_PATH);
    const data = valueList.map((item) => {
      delete item[HIDDEN_ID];
      return item;
    }, []);
    if (valuePath) {
      const configPath = getConfigPath(valuePath);
      window.electron.ipcRenderer.writeJsonFile({
        action: 'save-value-file',
        filePath: valuePath,
        data: JSON.stringify(data, null, 2),
      });
      window.electron.ipcRenderer.writeJsonFile({
        action: 'save-config-file',
        filePath: configPath,
        data: JSON.stringify(schemaConfig, null, 2),
      });
    } else {
      window.electron.ipcRenderer.saveFileDialog(
        {
          action: 'save-value-file',
          data: JSON.stringify(data, null, 2),
        },
        () => {
          localStorage.setItem(VALUE_PATH, val2.res.path);
          window.electron.ipcRenderer.writeJsonFile({
            action: 'save-config-file',
            filePath: configPath,
            data: JSON.stringify(schemaConfig, null, 2),
          });
        }
      );
    }
  }, [valueList, schemaConfig]);

  useEffect(() => {
    if (!schema) {
      return;
    }
    const valuePath = localStorage.getItem(VALUE_PATH);
    if (!valuePath) {
      return;
    }

    window.electron.ipcRenderer.readJsonFile(
      {
        filePath: valuePath,
        action: 'save-value',
      },
      (val) => {
        const data = JSON.parse(val.data);
        const formatData = data.map((item) => {
          return validateValue(item, schema);
        });
        console.log(formatData);
        const finalData = formatData.map((item, i) => {
          item[HIDDEN_ID] = i;
          return item;
        }, []);
        setValueList(finalData);
      }
    );
  }, [schema]);

  /* useEffect(() => {
   *   const storeData = () => {
   *     save();
   *     return;
   *   };

   *   window.addEventListener('beforeunload', save);

   *   const timer = setInterval(storeData, 1 * 60 * 1000);
   *   return () => {
   *     clearInterval(timer);
   *     window.removeEventListener('beforeunload', save);
   *   };
   * }, [save]);
   */
  useEffect(() => {
    setList((prev) => {
      if (prev.length !== valueList.length) {
        return valueList.map(() => schema);
      }
      return prev;
    });
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
    if (!localStorage.getItem(VALUE_PATH)) {
      window.electron.ipcRenderer.saveFileDialog(
        {
          action: 'save-schema-config-changed',
          data: JSON.stringify(valueList, null, 2),
        },
        (res) => {
          localStorage.setItem(VALUE_PATH, res.res.path);
          window.electron.ipcRenderer.writeJsonFile(
            {
              action: 'save-config-file-on-schema-submit',
              filePath: getConfigPath(res.res.path),
              data: JSON.stringify(v, null, 2),
            },
            () => {
              window.location.reload();
            }
          );
        }
      );
    } else {
      const configPath = getConfigPath(localStorage.getItem(VALUE_PATH));
      window.electron.ipcRenderer.writeJsonFile(
        {
          action: 'save-config-file',
          filePath: configPath,
          data: JSON.stringify(v, null, 2),
        },
        () => {
          window.location.reload();
        }
      );
    }
  };

  useEffect(() => {
    if (schemaConfig) {
      setSchema(buildSchema(schemaConfig.schema));
    }
  }, [schemaConfig]);

  useEffect(() => {
    window.electron.ipcRenderer.on('saveFile', save);

    return () => {
      window.electron.ipcRenderer.removeAllListeners('saveFile');
    };
  }, [save]);

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
      <Stack spacing={1}>
        <Button
          style={{ width: '240px', marginLeft: 'auto' }}
          variant="contained"
          onClick={() => {
            setSchemaConfigOpen(true);
          }}
        >
          Config
        </Button>

        <DragDropContext
          onDragEnd={(e) => {
            const final = valueList.map((item, j) => {
              if (j === e.source?.index) {
                return valueList[e.destination?.index];
              }
              if (j === e.destination?.index) {
                return valueList[e.source?.index];
              }
              return item;
            }, []);
            setValueList(final);
          }}
        >
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  ...getListStyle(snapshot.isDraggingOver),
                  ...{ width: '100%' },
                }}
              >
                {list.map((item, i) => {
                  const key = String(valueList[i][HIDDEN_ID]);
                  return (
                    <Draggable key={key} draggableId={key} index={i}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <Item
                            key={key}
                            index={i + 1}
                            schema={item}
                            schemaConfig={schemaConfig}
                            value={valueList[i]}
                            onValueChange={(v) => onItemChange(v, i)}
                            onDelete={() => onItemDelete(i)}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
            const v = schema.config.defaultValue;
            v[HIDDEN_ID] = prevArr.length;
            return prevArr.concat(v);
          });
        }}
      >
        <AddIcon />
      </Fab>

      {schemaConfigOpen && (
        <SchemaConfig
          initialValue={schemaConfig || DEFAULT_SCHEMA_CONFIG}
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
