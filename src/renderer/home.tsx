import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Base64 from 'js-base64';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  CssBaseline,
  Fab,
  GlobalStyles,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FILE_PATH } from 'constatnts/storage_key';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
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
  validateValue,
} from 'models/schema';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { generateUUID } from 'utils/uuid';
import { FieldContainer } from './components/field';
import Context from './context';
import Preview from './preview';
/* import FilterPanel from './filter_panel'; */
import SchemaConfig from './schema_config';
import useSave from './use_save';

const DEFAULT_SCHEMA_CONFIG = {
  i18n: [],
  schema: {
    type: 'object',
    fields: {},
    config: {
      ...DEFAULT_CONFIG.OBJECT,
      summary: '#{{___index}}',
    },
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

const Item = ({
  schema,
  value,
  index,
  onValueChange,
  onDuplicate,
  onDelete,
  schemaConfig,
  sx,
}: {
  schema: SchemaField;
  schemaConfig: any;
  value: any;
  onValueChange?: (v: any) => void;
  index: number;
  onDuplicate: () => void;
  onDelete: () => void;
  sx?: any;
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
      if (item === '___index') {
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
    <Card sx={sx}>
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
  const [valueList, setActualValueList] = useState<any[]>([]);
  const [displayValueList, setDisplayValueList] = useState<any[]>([]);
  const [schemaConfigOpen, setSchemaConfigOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [schemaConfig, setSchemaConfig] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState<string>('');
  const [schema, setSchema] = useState<SchemaField | null>(null);

  const { saving, save } = useSave({ valueList, schema, schemaConfig });

  const setValueListRef = useRef(
    throttle((newValue) => setActualValueList(newValue), 1000)
  );
  const setValueList = setValueListRef.current;

  useEffect(() => {
    setDisplayValueList(valueList);
  }, [valueList]);

  useEffect(() => {
    const valuePath = localStorage.getItem(FILE_PATH);
    document.querySelector('title').innerText = `General Data Manager ${
      valuePath ? '--- ' + valuePath : ''
    }`;
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

  const onSchemaConfigSubmit = async (v: any) => {
    setSchema(null);
    await save(v);
    window.location.reload();
  };

  const addItem = useCallback(() => {
    if (!schema) {
      return;
    }
    setValueList((prevArr) => {
      const v = cloneDeep(schema.config.defaultValue);
      v[HIDDEN_ID] = generateUUID();
      console.log(prevArr, v);
      return prevArr.concat(v);
    });
  }, [schema]);

  useEffect(() => {
    if (schemaConfig) {
      setSchema(buildSchema(schemaConfig.schema));
      if (schemaConfig.i18n.length > 0) {
        setCurrentLang(schemaConfig.i18n[0]);
      }
    }
  }, [schemaConfig]);

  useEffect(() => {
    const showPreview = () => {
      setPreviewVisible(true);
    };
    window.electron.ipcRenderer.on('addItem', addItem);
    window.electron.ipcRenderer.on('previewFile', showPreview);
    return () => {
      window.electron.ipcRenderer.removeListener('addItem', addItem);
      window.electron.ipcRenderer.removeListener('previewFile', showPreview);
    };
  }, [addItem]);

  /* useEffect(() => {
   *   const onunload = async (e) => {
   *     e.preventDefault();
   *     e.returnValue = '';
   *     const valuePath = localStorage.getItem(FILE_PATH);
   *     if (valuePath) {
   *       const currentFileValue = await window.electron.ipcRenderer.readJsonFile(
   *         {
   *           filePath: valuePath,
   *           action: 'save-value',
   *         }
   *       );

   *       const formatData = (JSON.parse(currentFileValue.data) || []).map(
   *         (item) => {
   *           return validateValue(item, item, schema, schemaConfig);
   *         }
   *       );
   *       if (Base64.encode(formatData) !== Base64.encode(valueList)) {
   *         alert('File has been changed without save. Exit anyway?');
   *       } else {
   *         window.electron.ipcRenderer.close();
   *       }
   *     } else {
   *       alert('You have not save file yet. Exit anyway?');
   *     }
   *   };
   *   window.addEventListener('beforeunload', onunload);
   *   return () => {
   *     window.removeEventListener('beforeunload', onunload);
   *   };
   * }, [save, schema, schemaConfig, valueList]); */

  /* const onFilterChange = (filterVal) => {
   *   setDisplayValueList(
   *     valueList.filter((item) => {
   *       const needFilter = Object.keys(filterVal).reduce((res, prop) => {
   *         if (!res) {
   *           return res;
   *         }
   *         if (!filterVal[prop].value) {
   *           return res;
   *         }

   *         if (filterVal[prop].type === 'string') {
   *           return get(item, prop).includes(filterVal[prop].value);
   *         }
   *         return get(item, prop) === filterVal[prop].value;
   *       }, true);
   *       return needFilter;
   *     })
   *   );
   * }; */

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
        {/* <FilterPanel onFilterChange={onFilterChange} /> */}
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
                const final = displayValueList.map((item, j) => {
                  if (j === e.source?.index) {
                    return displayValueList[e.destination?.index];
                  }
                  if (j === e.destination?.index) {
                    return displayValueList[e.source?.index];
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
                    {displayValueList.map((item, i) => {
                      const key = String(item[HIDDEN_ID]);
                      return (
                        <Draggable key={key} draggableId={key} index={i}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <Stack
                                spacing={1}
                                direction="row"
                                style={{
                                  width: '100%',
                                  alignItems: 'center',
                                }}
                              >
                                <span {...provided.dragHandleProps}>
                                  <DragIndicatorIcon />
                                </span>
                                <Item
                                  sx={{ flexGrow: 1 }}
                                  key={key}
                                  index={i + 1}
                                  schema={schema}
                                  schemaConfig={schemaConfig}
                                  value={displayValueList[i]}
                                  onValueChange={(v) => onItemChange(v, i)}
                                  onDuplicate={() => onItemDuplicate(i)}
                                  onDelete={() => onItemDelete(i)}
                                />
                              </Stack>
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
              bottom: 48,
              right: 48,
            }}
            color="primary"
            onClick={addItem}
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
          {previewVisible && (
            <Preview
              valueList={cloneDeep(valueList).map((item) => {
                item[HIDDEN_ID] = undefined;
                return item;
              })}
              close={() => {
                setPreviewVisible(false);
              }}
            />
          )}
        </div>
      </>
    </Context.Provider>
  );
};

export default Home;
