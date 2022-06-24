import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Alert,
  Button,
  CardContent,
  CircularProgress,
  Collapse,
  CssBaseline,
  GlobalStyles,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FILE_PATH,
  PROJECT_PATH,
  RECENTE_FILE_PATHS,
  SIDEBAR_VISIBLE,
} from 'constatnts/storage_key';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import uniq from 'lodash/uniq';
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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Sidebar from './sidebar';
import style from 'styled-components';
import { generateUUID } from 'utils/uuid';
import Confimration from './components/confirmation';
import { FieldContainer } from './components/field';
import FieldSelect from './components/field/select_field';
import Context from './context';
import FilterPanel from './filter_panel';
import './home.scss';
import Preview from './preview';
/* import FilterPanel from './filter_panel'; */
import SchemaConfig from './schema_config';
import {
  PRIMARY_COLOR1,
  PRIMARY_COLOR1_LIGHT1,
  PRIMARY_COLOR2,
  SECOND_COLOR1,
} from './style';
import useSave from './use_save';
import { EVENT, eventBus } from './event';
import ProjectSchemaConfig from './project_schema_config';
import { DEFAULT_PROJECT_CONFIG } from './constants';

const StyledCard = style.div<{ expand: boolean }>`
  clip-path: polygon(0px 25px, 50px 0px, calc(60% - 25px) 0px, 60% 25px, 100% 25px, 100% calc(100% - 10px), calc(100% - 15px) calc(100% - 10px), calc(80% - 10px) calc(100% - 10px), calc(80% - 15px) 100%, 80px calc(100% - 0px), 65px calc(100% - 15px), 0% calc(100% - 15px));
  padding: 30px;
  min-width: 500px;
  background: ${PRIMARY_COLOR1}!important;
  position: relative;
  color: ${PRIMARY_COLOR1}!important;
  flex-grow: 1;

  .bg {
    position: absolute;
    background: ${PRIMARY_COLOR2};
    height: ${({ expand }) => (expand ? 'calc(100% - 40px)' : '70%')};
    width: calc(100% - 40px);
  clip-path: polygon(0px 25px, 50px 0px, calc(60% - 25px) 0px, 60% 25px, 100% 25px, 100% calc(100% - 10px), calc(100% - 15px) calc(100% - 10px), calc(80% - 10px) calc(100% - 10px), calc(80% - 15px) 100%, 80px calc(100% - 0px), 65px calc(100% - 15px), 0% calc(100% - 15px));
    z-index: -2;
  }

  .header {
    display: flex;
    flex-direction: row;
    color: ${PRIMARY_COLOR2};
    padding-top: 25px;
    padding-left: 20px;
    .btn-group {
      margin-left: auto;
    }
    .summary {
      z-index: 1;
      color: ${PRIMARY_COLOR1};
      font-size: 18px;
      font-weight: bold;
    }
  }

 .icon {
    color: ${PRIMARY_COLOR1};
  }
`;

const StyledAlert = style(Alert)`
  @keyframes showup {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(50%);
    }
  }
  position: fixed;
  width: 50%;
  transform: translateX(50%);
  z-index: 10;
  top: 50px;
  height: 100px;
  padding-left: 5%;
  background: ${SECOND_COLOR1};
  color: ${PRIMARY_COLOR1};
  border-radius: 0px;
  clip-path: polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 10% 50%, 0% 0%);
  animation: 0.3s cubic-bezier(.73,.2,0,.88) showup;
`;

const DEFAULT_SCHEMA_CONFIG = {
  i18n: [],
  filters: [],
  schema: {
    type: 'object',
    fields: {},
    config: {
      ...DEFAULT_CONFIG.OBJECT,
      initialExpand: false,
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

// a little function to help us with reordering the result
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : '#464D54',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : '#464D54',
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
    valuePath.substring(0, 3) + baseUrl + '\\' + `.${fileName}.config.bc`
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
}: {
  schema: SchemaField;
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
    (all: any) => {
      const item = all.substring(2, all.length - 2);
      if (item === '___index') {
        return index;
      }
      const v = get(value, item, '');
      if (typeof v === 'object') {
        return v[currentLang] || '';
      }
      return v;
    }
  );

  return (
    <StyledCard expand={expanded}>
      <div className="bg" />
      <div className="header">
        <div className="summary">{summary}</div>
        <div className="btn-group">
          <IconButton
            aria-label="settings"
            onClick={handleSettingsClick}
            color="primary"
          >
            <MoreVertIcon className="icon" />
          </IconButton>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            color="primary"
          >
            <ExpandMoreIcon className="icon" />
          </ExpandMore>
        </div>
      </div>
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
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: PRIMARY_COLOR1,
          },
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
    </StyledCard>
  );
};

const Home = () => {
  const [valueList, setActualValueList] = useState<any[]>([]);
  const [displayValueList, setDisplayValueList] = useState<any[]>([]);
  const [schemaConfigOpen, setSchemaConfigOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisbile] = useState(false);
  const [schemaConfig, setSchemaConfig] = useState<any>(null);
  const [projectConfig, setProjectConfig] = useState<any>(
    DEFAULT_PROJECT_CONFIG
  );
  const [currentLang, setCurrentLang] = useState<string>('');
  const [schema, setSchema] = useState<SchemaField | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [i18nSelectionSchema, setI18nSelectionSchema] =
    useState<SchemaFieldSelect | null>(null);


  useEffect(() => {
    const projectPath = localStorage.getItem(PROJECT_PATH);
    if (projectPath) {
      window.electron.ipcRenderer.readJsonFile(
        {
          filePath: projectPath,
          action: 'read-project-config',
        },
        (val: any) => {
          if (val.data) {
            setProjectConfig(JSON.parse(val.data));
          }
        }
      );
    }
  }, []);

  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(
    null
  );

  useEffect(() => {
    if (!schemaConfig) {
      return;
    }

    const i18nSchema = new SchemaFieldSelect();
    i18nSchema.setup({
      options: schemaConfig.i18n.map((k: any) => {
        return {
          label: k,
          value: k,
        };
      }),
    });
    setI18nSelectionSchema(i18nSchema);
  }, [schemaConfig]);

  const headerMenuOpen = Boolean(headerAnchorEl);
  const handleHeaderMenuClose = () => {
    setHeaderAnchorEl(null);
  };
  const [headerMenuActions, setHeaderMenuActions] = useState<
    { fn: () => void; title: string; shortcut?: string }[]
  >([]);

  const { saving, save, newFile } = useSave({
    valueList,
    schema,
    schemaConfig,
  });

  const setValueListRef = useRef(
    throttle((newValue) => setActualValueList(newValue), 1000)
  );
  const setValueList = setValueListRef.current;

  useEffect(() => {
    const valuePath = localStorage.getItem(FILE_PATH);
    document.querySelector('title').innerText = `Bullet Data ${
      valuePath ? '--- ' + valuePath : ''
    }`;
    if (valuePath) {
      const configUrl = getConfigPath(valuePath);
      if (configUrl) {
        window.electron.ipcRenderer.readJsonFile(
          {
            filePath: configUrl,
            action: 'read-file-config',
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
        action: 'read-data',
      },
      (val: any) => {
        const data = JSON.parse(val.data);
        const formatData = data.map((item: any) => {
          return validateValue(item, item, schema, schemaConfig);
        });
        const finalData = formatData.map((item: any) => {
          item[HIDDEN_ID] = generateUUID();
          return item;
        }, []);
        setValueList(finalData);
        setDisplayValueList(finalData);
      }
    );
  }, [schema, schemaConfig]);

  const onItemChange = (v: any, i: number) => {
    const ditem = displayValueList.find((_, j) => j === i);
    setValueList((prev: any) => {
      return prev.map((item: any) =>
        item[HIDDEN_ID] === ditem[HIDDEN_ID] ? v : item
      );
    });
    setDisplayValueList((prev: any) => {
      return prev.map((item: any) =>
        item[HIDDEN_ID] === ditem[HIDDEN_ID] ? v : item
      );
    });
  };
  const onItemDelete = (i: number) => {
    const ditem = displayValueList.find((_, j) => j === i);
    setValueList((prev: any) => {
      return prev.filter((item: any) => item[HIDDEN_ID] !== ditem[HIDDEN_ID]);
    });
    setDisplayValueList((prev: any) => {
      return prev.filter((item: any) => item[HIDDEN_ID] !== ditem[HIDDEN_ID]);
    });
  };
  const onItemDuplicate = (i: number) => {
    setValueList((prev: any) => {
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

    const newItem = cloneDeep(schema.config.defaultValue);
    newItem[HIDDEN_ID] = generateUUID();
    setValueList((prevArr: any) => {
      return prevArr.concat(newItem);
    });
    setDisplayValueList((prevArr: any) => {
      return prevArr.concat(newItem);
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

  useEffect(() => {
    const onKeyDown = (e: any) => {
      if (e.code === 'KeyS' && e.ctrlKey) {
        save();
      }
      if (e.code === 'KeyL' && e.ctrlKey) {
        setPreviewVisible(true);
      }
      if (e.code === 'KeyO' && e.ctrlKey) {
        (window as any).electron.ipcRenderer.openFile();
      }

      // switch lang shortcut
      if (e.code.includes('Digit') && e.ctrlKey) {
        const index = Number(e.code.split('Digit')[1]) - 1;
        if (index >= 0 && schemaConfig.i18n.length > index) {
          setCurrentLang(schemaConfig.i18n[index]);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [save, schemaConfig]);

  useEffect(() => {
    const onClose = async () => {
      const valuePath = localStorage.getItem(FILE_PATH);
      if (valuePath && schema) {
        const currentFileValue = await window.electron.ipcRenderer.readJsonFile(
          {
            filePath: valuePath,
            action: 'save-value',
          }
        );

        const formatData = (JSON.parse(currentFileValue.data) || []).map(
          (item: any) => {
            return validateValue(item, item, schema, schemaConfig);
          }
        );

        if (
          JSON.stringify(formatData) !==
          JSON.stringify(
            cloneDeep(valueList).map((item) => {
              item[HIDDEN_ID] = undefined;
              return item;
            })
          )
        ) {
          setConfirmationVisbile(true);
        } else {
          window.electron.ipcRenderer.close();
        }
      } else {
        setConfirmationVisbile(true);
      }
    };
    window.electron.ipcRenderer.on('close', onClose);
    return () => {
      window.electron.ipcRenderer.removeAllListeners('close');
    };
  }, [save, schema, schemaConfig, valueList]);

  const onExitConfimration = (confirmation: boolean) => {
    if (confirmation) {
      window.electron.ipcRenderer.close();
    } else {
      setConfirmationVisbile(false);
    }
  };

  const onFilterChange = (filterVal: any) => {
    setFilters(filterVal);
    setDisplayValueList(
      valueList.filter((item) => {
        const needFilter = Object.keys(filterVal).reduce((res, prop) => {
          if (!res) {
            return res;
          }
          if (!filterVal[prop].value) {
            return res;
          }

          if (filterVal[prop].schema instanceof SchemaFieldString) {
            if (filterVal[prop].filterType === 'include') {
              return get(item, prop).includes(filterVal[prop].value);
            } else if (filterVal[prop].filterType === 'exclude') {
              return !get(item, prop).includes(filterVal[prop].value);
            } else if (filterVal[prop].filterType === 'equal') {
              return get(item, prop) === filterVal[prop].value;
            }
          } else if (filterVal[prop].schema instanceof SchemaFieldNumber) {
            if (filterVal[prop].filterType === 'less') {
              return get(item, prop) > filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'less_equal') {
              return get(item, prop) >= filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'bigger') {
              return get(item, prop) < filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'bigger_equal') {
              return get(item, prop) <= filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'equal') {
              return get(item, prop) === filterVal[prop].value;
            }
          } else if (filterVal[prop].schema instanceof SchemaFieldSelect) {
            if (filterVal[prop].filterType === 'exists') {
              return get(item, prop) === filterVal[prop].value;
            } else if (filterVal[prop].filterType === 'not_exists') {
              return get(item, prop) !== filterVal[prop].value;
            }
          }
          return res;
        }, true);
        return needFilter;
      })
    );
  };

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
        schema,
        projectConfig,
      }}
    >
      <>
        {schemaConfig?.filters && schemaConfig?.filters.length > 0 && (
          <FilterPanel onFilterChange={onFilterChange} />
        )}
        <div
          style={{
            backgroundColor: '#464D54',
            height: '100%',
            paddingBottom: '20px',
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
            <StyledAlert icon={<></>} variant="standard" color="info">
              <Stack
                spacing={2}
                direction="row"
                sx={{ alignItems: 'center', height: '100%', width: '100%' }}
              >
                <CircularProgress />
                <div style={{ fontSize: '18px', zIndex: 3 }}>
                  Saving...Please wait for a while
                </div>
              </Stack>
            </StyledAlert>
          )}
          <Stack
            spacing={2}
            direction="row"
            sx={{
              height: '100%',
            }}
          >
            <Sidebar />
            <Stack
              spacing={2}
              sx={{
                flexGrow: 1,
              }}
            >
              <Stack
                spacing={2}
                direction="row"
                sx={{
                  // position: 'sticky',
                  // top: 0,
                  // zIndex: 2,
                  // background: 'rgb(70, 77, 84)',
                  padding: '20px',
                }}
              >
                <Stack
                  spacing={4}
                  direction="row"
                  sx={{ flexGrow: 1, paddingLeft: '40px' }}
                >
                  <Button
                    sx={{
                      width: '120px',
                      borderRadius: '0px',
                      clipPath:
                        'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%, 15% 50%)',
                    }}
                    variant="contained"
                    onClick={(e) => {
                      setHeaderAnchorEl(e.currentTarget);
                      setHeaderMenuActions([
                        {
                          title: 'New Project',
                          fn: () => {
                            save();
                            localStorage.removeItem(FILE_PATH);
                            localStorage.removeItem(PROJECT_PATH);
                            window.location.reload();
                          },
                        },
                        {
                          title: 'New File',
                          fn: () => {
                            newFile();
                          },
                        },
                        {
                          title: 'Open...',
                          shortcut: 'Ctrl+O',
                          fn: () => {
                            (window as any).electron.ipcrenderer.openfile();
                          },
                        },
                        {
                          title: 'Save',
                          shortcut: 'Ctrl+S',
                          fn: () => {
                            save();
                          },
                        },
                        {
                          title: 'Preview',
                          shortcut: 'Ctrl+L',
                          fn: () => {
                            setPreviewVisible(true);
                          },
                        },
                      ]);
                    }}
                  >
                    File
                  </Button>
                  <Button
                    sx={{
                      width: '120px',
                      borderRadius: '0px',
                      clipPath:
                        'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%, 15% 50%)',
                    }}
                    variant="contained"
                    onClick={(e) => {
                      setHeaderAnchorEl(e.currentTarget);
                      setHeaderMenuActions([
                        {
                          title: 'Toogle sidebar',
                          fn: () => {
                            eventBus.emit(EVENT.TOGGLE_SIDEBAR);
                          },
                        },
                      ]);
                    }}
                  >
                    View
                  </Button>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto' }}>
                  {schemaConfig.i18n.length > 0 && i18nSelectionSchema && (
                    <FieldSelect
                      schema={i18nSelectionSchema}
                      value={currentLang}
                      onValueChange={(v) => {
                        setCurrentLang(v);
                      }}
                    />
                  )}
                  <Button
                    sx={{
                      width: '240px',
                      borderRadius: '0px',
                      clipPath:
                        'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%, 15% 50%)',
                    }}
                    variant="contained"
                    onClick={() => {
                      setSchemaConfigOpen(true);
                    }}
                  >
                    Schema Config
                  </Button>
                </Stack>
              </Stack>

              <DragDropContext
                onDragEnd={(result: any) => {
                  setValueList(
                    reorder(
                      valueList,
                      result.source.index,
                      result.destination.index
                    )
                  );
                }}
              >
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        ...getListStyle(snapshot.isDraggingOver),
                        ...{
                          width: '100%',
                          overflow: 'auto',
                          background: snapshot.isDraggingOver
                            ? PRIMARY_COLOR1_LIGHT1
                            : '#464D54',
                        },
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
                                style={{
                                  ...getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  ),
                                  background: snapshot.isDragging
                                    ? SECOND_COLOR1
                                    : '#464D54',
                                }}
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
                                    <DragIndicatorIcon
                                      sx={{ color: PRIMARY_COLOR1 }}
                                    />
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
              <Button
                sx={{
                  width: '90%',
                  padding: '10px',
                  borderRadius: '0px',
                  clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
                  marginLeft: 'auto!important',
                  marginRight: 'auto!important',
                }}
                variant="contained"
                onClick={addItem}
              >
                Add Item
              </Button>
            </Stack>
          </Stack>

          {schemaConfigOpen && (
            <SchemaConfig
              initialValue={schemaConfig || DEFAULT_SCHEMA_CONFIG}
              onSubmit={onSchemaConfigSubmit}
              close={() => {
                setSchemaConfigOpen(false);
              }}
            />
          )}
          <ProjectSchemaConfig />
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
          {confirmationVisible && (
            <Confimration
              close={() => {
                setConfirmationVisbile(false);
              }}
              onAction={onExitConfimration}
            />
          )}
        </div>
        <Menu
          id="header-menu"
          anchorEl={headerAnchorEl}
          open={headerMenuOpen}
          onClose={handleHeaderMenuClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: PRIMARY_COLOR1,
              width: '150px',
              marginTop: 2,
              borderRadius: '32px',
            },
          }}
        >
          {headerMenuActions.map((m) => {
            return (
              <MenuItem
                sx={{ display: 'flex', justifyContent: 'center' }}
                onClick={() => {
                  setHeaderAnchorEl(null);
                  m.fn();
                }}
              >
                {m.title}

                {m.shortcut && (
                  <span style={{ color: '#80868C' }}>( {m.shortcut} )</span>
                )}
              </MenuItem>
            );
          })}
        </Menu>
      </>
    </Context.Provider>
  );
};

export default Home;
