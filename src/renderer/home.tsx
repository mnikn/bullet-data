import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import uniq from 'lodash/uniq';
import cloneDeep from 'lodash/cloneDeep';
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
  Select,
  Alert,
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
import { FILE_PATH, RECENTE_FILE_PATHS } from 'constatnts/storage_key';
import Context from './context';
import { generateUUID } from 'utils/uuid';
import FilterPanel from './filter_panel';

const DEFAULT_SCHEMA_CONFIG = {
  summary: '#{{_index}}',
  i18n: [],
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
  const p = valuePath.replace(/\\/g, '/').slice(3);
  const p1 = p.split('.json')[0];
  const fileName = p1.split('/')[p1.split('/').length - 1];
  const baseUrl = p1
    .split('/')
    .filter((item) => item !== fileName)
    .join('\\');
  return (
    valuePath.substring(0, 3) + baseUrl + '\\' + `.${fileName}.config.json`
  );
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

function validateValue(
  totalObjValue: any,
  value: any,
  schema: SchemaField,
  schemaConfig: any
): any {
  if (schema.config.enableWhen) {
    const fn = eval(schema.config.enableWhen);
    if (!fn(totalObjValue)) {
      return undefined;
    }
  }
  if (schema.type === SchemaFieldType.Array) {
    if (Array.isArray(value)) {
      return value.map((item) => {
        return validateValue(
          totalObjValue,
          item,
          (schema as SchemaFieldArray).fieldSchema,
          schemaConfig
        );
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
            totalObjValue,
            value[key],
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data,
            schemaConfig
          );
        }
        return res2;
      }, {});
      const r2 = objFields.reduce((res: any, key) => {
        if (!Object.keys(value).includes(key)) {
          res[key] = validateValue(
            totalObjValue,
            null,
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data,
            schemaConfig
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
    if (schema.config.needI18n) {
      if (typeof value === 'object' && value !== null) {
        return value;
      } else {
        return schemaConfig.i18n.reduce((res, item) => {
          return { ...res, [item]: schema.config.defaultValue };
        }, '');
      }
    }
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
  onDuplicate,
  onDelete,
  schemaConfig,
}: {
  schema: SchemaField;
  schemaConfig: any;
  value: any;
  onValueChange?: (v: any) => void;
  index: number;
  onDuplicate: () => void;
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

  const { currentLang } = useContext(Context);
  const summary = schema.config.summary.replace(
    /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
    (all) => {
      const item = all.substring(2, all.length - 2);
      if (item === '_index') {
        return index;
      }
      const v = get(value, item, '');
      if (typeof v === 'object') {
        return v[currentLang];
      }
      return v;
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
            onDuplicate();
            handleSettingsClose();
          }}
        >
          Duplicate
        </MenuItem>
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
  const [currentLang, setCurrentLang] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const [schema, setSchema] = useState<SchemaField | null>(null);

  const setValueListRef = useRef(
    throttle((newValue) => setActualValueList(newValue), 1000)
  );
  const setValueList = setValueListRef.current;

  useEffect(() => {
    const valuePath = localStorage.getItem(FILE_PATH);
    if (valuePath) {
      const configUrl = getConfigPath(valuePath);
      if (configUrl) {
        window.electron.ipcRenderer.readJsonFile(
          {
            filePath: configUrl,
            action: 'read-config',
          },
          (val) => {
            if (val.data) {
              setSchemaConfig(JSON.parse(val.data));
            } else {
              setSchemaConfigOpen(true);
            }
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
    setSaving(true);
    const valuePath = localStorage.getItem(FILE_PATH);
    const data = cloneDeep(valueList).map((item) => {
      item[HIDDEN_ID] = undefined;
      return validateValue(item, item, schema, schemaConfig);
    }, []);
    if (valuePath) {
      const configPath = getConfigPath(valuePath);
      window.electron.ipcRenderer.writeJsonFile(
        {
          action: 'save-value-file',
          filePath: valuePath,
          data: JSON.stringify(data, null, 2),
        },
        () => {
          window.electron.ipcRenderer.writeJsonFile(
            {
              action: 'save-config-file',
              filePath: configPath,
              data: JSON.stringify(schemaConfig, null, 2),
            },
            () => {
              setTimeout(() => {
                setSaving(false);
              }, 300);
            }
          );
        }
      );
    } else {
      window.electron.ipcRenderer.saveFileDialog(
        {
          action: 'save-value-file',
          data: JSON.stringify(data, null, 2),
        },
        () => {
          localStorage.setItem(FILE_PATH, val2.res.path);
          window.electron.ipcRenderer.writeJsonFile(
            {
              action: 'save-config-file',
              filePath: configPath,
              data: JSON.stringify(schemaConfig, null, 2),
            },
            () => {
              setTimeout(() => {
                setSaving(false);
              }, 300);
            }
          );
        }
      );
    }
  }, [valueList, schema, schemaConfig]);

  useEffect(() => {
    if (!schema) {
      return;
    }
    const valuePath = localStorage.getItem(FILE_PATH);
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
          return validateValue(item, item, schema, schemaConfig);
        });
        console.log(formatData);
        const finalData = formatData.map((item) => {
          item[HIDDEN_ID] = generateUUID();
          return item;
        }, []);
        setValueList(finalData);
      }
    );
  }, [schema, schemaConfig]);

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
  const onItemDuplicate = (i: number) => {
    setValueList((prev) => {
      const v = cloneDeep(prev[i]);
      v[HIDDEN_ID] = generateUUID();
      prev.splice(i, 0, v);
      return [...prev];
    });
  };

  const onSchemaConfigSubmit = (v: any) => {
    setSchema(null);
    if (!localStorage.getItem(FILE_PATH)) {
      window.electron.ipcRenderer.saveFileDialog(
        {
          action: 'save-schema-config-changed',
          data: JSON.stringify(valueList, null, 2),
        },
        (res) => {
          localStorage.setItem(FILE_PATH, res.res.path.replace);
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
      const configPath = getConfigPath(localStorage.getItem(FILE_PATH));
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
      if (schemaConfig.i18n.length > 0) {
        setCurrentLang(schemaConfig.i18n[0]);
      }
    }
  }, [schemaConfig]);

  useEffect(() => {
    const onOpenFile = (res) => {
      const path = res.res[0].path;
      localStorage.setItem(FILE_PATH, path);
      const recents = JSON.parse(
        localStorage.getItem(RECENTE_FILE_PATHS) || '[]'
      ).concat(path);
      localStorage.setItem(RECENTE_FILE_PATHS, JSON.stringify(uniq(recents)));
      window.electron.ipcRenderer.addRecentFile({
        newFilePath: path,
        all: recents,
      });
      window.location.reload();
    };
    const onNewFile = () => {
      save();
      localStorage.clear();
      window.location.reload();
    };
    window.electron.ipcRenderer.on('saveFile', save);
    window.electron.ipcRenderer.on('openFile', onOpenFile);
    window.electron.ipcRenderer.on('newFile', onNewFile);

    return () => {
      window.electron.ipcRenderer.removeAllListeners('saveFile');
      window.electron.ipcRenderer.removeAllListeners('openFile');
      window.electron.ipcRenderer.removeAllListeners('newFile');
    };
  }, [save]);

  if (!schema && !schemaConfigOpen) {
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
    <Context.Provider
      value={{
        currentLang,
        setCurrentLang,
        schemaConfig,
      }}
    >
      <>
        <FilterPanel />
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
          {saving && (
            <Alert
              sx={{
                position: 'fixed',
                width: '50%',
                transform: 'translateX(50%)',
                zIndex: 10,
                top: '50px',
                height: '100px',
              }}
              icon={<></>}
              variant="standard"
              color="info"
            >
              <Stack
                spacing={2}
                direction="row"
                sx={{ alignItems: 'center', height: '100%', width: '100%' }}
              >
                <CircularProgress />
                <div style={{ fontSize: '18px' }}>
                  Saving...Please wait for a while
                </div>
              </Stack>
            </Alert>
          )}
          <Stack>
            <Stack spacing={2} direction="row-reverse">
              <Button
                style={{ width: '240px' }}
                variant="contained"
                onClick={() => {
                  setSchemaConfigOpen(true);
                }}
              >
                Config
              </Button>
              {schemaConfig.i18n.length > 0 && (
                <Select
                  labelId="i18n-select-label"
                  id="i18n-select"
                  value={currentLang}
                  label="I18n"
                  onChange={(e) => setCurrentLang(e.target.value)}
                  size="small"
                  sx={{ backgroundColor: '#fff' }}
                >
                  {schemaConfig.i18n.map((item2, j) => {
                    return (
                      <MenuItem key={j} value={item2}>
                        {item2}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            </Stack>

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
                      const key = String(valueList[i]?.[HIDDEN_ID]);
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
                                onDuplicate={() => onItemDuplicate(i)}
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
                v[HIDDEN_ID] = generateUUID();
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
      </>
    </Context.Provider>
  );
};

export default Home;
