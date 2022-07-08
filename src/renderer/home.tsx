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
import get from 'lodash/get';
import {
  DEFAULT_CONFIG,
  SchemaField,
  SchemaFieldObject,
  SchemaFieldSelect,
} from 'models/schema';
import { useContext, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useLatest } from 'react-use';
import style from 'styled-components';
import ActionMenu from './action_menu';
import Confimration from './components/confirmation';
import { FieldContainer } from './components/field';
import Context from './context';
import { EVENT, eventBus } from './event';
import FilterPanel from './filter_panel';
import './home.scss';
import useDataList from './hooks/use_data_list';
import useExplorer from './hooks/use_explorer';
import useFile from './hooks/use_file';
import useProject from './hooks/use_project';
import InitPanel from './init_panel';
import Navbar from './navbar';
import Preview from './preview';
import ProjectSchemaConfig from './project_schema_config';
/* import FilterPanel from './filter_panel'; */
import SchemaConfig from './schema_config';
import Sidebar from './sidebar';
import {
  PRIMARY_COLOR1,
  PRIMARY_COLOR1_LIGHT1,
  PRIMARY_COLOR2,
  SECOND_COLOR1,
} from './style';

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
  /* const [valueList, setActualValueList] = useState<any[]>([]);
   * const [displayValueList, setDisplayValueList] = useState<any[]>([]); */
  const [confirmationVisible, setConfirmationVisbile] = useState(false);
  /* const [schemaConfig, setSchemaConfig] = useState<any>(null); */
  const [currentLang, setCurrentLang] = useState<string>('');
  /* const [schema, setSchema] = useState<SchemaField | null>(null); */
  const [filters, setFilters] = useState<any>({});
  const [i18nSelectionSchema, setI18nSelectionSchema] =
    useState<SchemaFieldSelect | null>(null);

  const { projectFileTree, projectConfig } = useProject();
  const { currentFile, recentOpenFiles } = useExplorer({ projectFileTree });
  const { currentFileData, schemaConfig, schema, saving } = useFile({
    currentFile,
  });
  const { actualValueList, displayValueList } = useDataList({
    currentFile,
    currentFileData,
    schema,
  });

  const actualValueListRef = useLatest(actualValueList);

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

  const onSchemaConfigSubmit = async (v: any) => {
    /* setSchema(null); */
    // await save(v);
    window.location.reload();
  };

  useEffect(() => {
    const onKeyDown = (e: any) => {
      if (e.code === 'KeyS' && e.ctrlKey) {
        eventBus.emit(
          EVENT.SAVE_FILE,
          actualValueListRef.current.map((item) => item.data)
        );
      }
      if (e.code === 'KeyL' && e.ctrlKey) {
        eventBus.emit(EVENT.SHOW_FILE_PREVIEW);
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
  }, [schemaConfig]);

  /* useEffect(() => {
   *   const onClose = async () => {
   *     const valuePath = localStorage.getItem(FILE_PATH);
   *     if (valuePath && schema) {
   *       const currentFileValue = await window.electron.ipcRenderer.readJsonFile(
   *         {
   *           filePath: valuePath,
   *           action: 'save-value',
   *         }
   *       );

   *       const formatData = (JSON.parse(currentFileValue.data) || []).map(
   *         (item: any) => {
   *           return validateValue(item, item, schema, schemaConfig);
   *         }
   *       );

   *       if (
   *         JSON.stringify(formatData) !==
   *         JSON.stringify(
   *           cloneDeep(valueList).map((item) => {
   *             item[HIDDEN_ID] = undefined;
   *             return item;
   *           })
   *         )
   *       ) {
   *         setConfirmationVisbile(true);
   *       } else {
   *         window.electron.ipcRenderer.close();
   *       }
   *     } else {
   *       setConfirmationVisbile(true);
   *     }
   *   };
   *   window.electron.ipcRenderer.on('close', onClose);
   *   return () => {
   *     window.electron.ipcRenderer.removeAllListeners('close');
   *   };
   * }, [save, schema, schemaConfig, valueList]);
   */

  const onExitConfimration = (confirmation: boolean) => {
    if (confirmation) {
      window.electron.ipcRenderer.close();
    } else {
      setConfirmationVisbile(false);
    }
  };

  /* const onFilterChange = (filterVal: any) => {
   *   setFilters(filterVal);
   *   setDisplayValueList(
   *     valueList.filter((item) => {
   *       const needFilter = Object.keys(filterVal).reduce((res, prop) => {
   *         if (!res) {
   *           return res;
   *         }
   *         if (!filterVal[prop].value) {
   *           return res;
   *         }

   *         if (filterVal[prop].schema instanceof SchemaFieldString) {
   *           if (filterVal[prop].filterType === 'include') {
   *             return get(item, prop).includes(filterVal[prop].value);
   *           } else if (filterVal[prop].filterType === 'exclude') {
   *             return !get(item, prop).includes(filterVal[prop].value);
   *           } else if (filterVal[prop].filterType === 'equal') {
   *             return get(item, prop) === filterVal[prop].value;
   *           }
   *         } else if (filterVal[prop].schema instanceof SchemaFieldNumber) {
   *           if (filterVal[prop].filterType === 'less') {
   *             return get(item, prop) > filterVal[prop].value;
   *           } else if (filterVal[prop].filterType === 'less_equal') {
   *             return get(item, prop) >= filterVal[prop].value;
   *           } else if (filterVal[prop].filterType === 'bigger') {
   *             return get(item, prop) < filterVal[prop].value;
   *           } else if (filterVal[prop].filterType === 'bigger_equal') {
   *             return get(item, prop) <= filterVal[prop].value;
   *           } else if (filterVal[prop].filterType === 'equal') {
   *             return get(item, prop) === filterVal[prop].value;
   *           }
   *         } else if (filterVal[prop].schema instanceof SchemaFieldSelect) {
   *           if (filterVal[prop].filterType === 'exists') {
   *             return get(item, prop) === filterVal[prop].value;
   *           } else if (filterVal[prop].filterType === 'not_exists') {
   *             return get(item, prop) !== filterVal[prop].value;
   *           }
   *         }
   *         return res;
   *       }, true);
   *       return needFilter;
   *     })
   *   );
   * }; */

  if (!projectFileTree) {
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
        projectFileTree,
        currentFile,
        recentOpenFiles,
        actualValueList,
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
            display: 'flex',
            flexDirection: 'column',
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

          <ActionMenu />

          <Stack
            direction="row"
            sx={{
              flexGrow: 1,
            }}
          >
            <Sidebar />
            <Stack
              spacing={2}
              sx={{
                flexGrow: 1,
              }}
            >
              <Navbar />

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
                        return (
                          <Draggable
                            key={item.key}
                            draggableId={item.key}
                            index={i}
                          >
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
                                    key={item.key}
                                    index={i + 1}
                                    schema={schema}
                                    schemaConfig={schemaConfig}
                                    value={displayValueList[i].data}
                                    onValueChange={(v) => {
                                      eventBus.emit(
                                        EVENT.DATA_ITEM_CHANGED,
                                        v,
                                        i
                                      );
                                    }}
                                    onDuplicate={() => {
                                      eventBus.emit(
                                        EVENT.DATA_ITEM_DUPLICATED,
                                        i
                                      );
                                    }}
                                    onDelete={() => {
                                      eventBus.emit(EVENT.DATA_ITEM_DELETE, i);
                                    }}
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
                onClick={() => {
                  eventBus.emit(EVENT.DATA_ITEM_ADD);
                }}
              >
                Add Item
              </Button>
            </Stack>
          </Stack>

          <SchemaConfig
            initialValue={schemaConfig || DEFAULT_SCHEMA_CONFIG}
            onSubmit={onSchemaConfigSubmit}
          />
          <InitPanel />
          <Preview />
          <ProjectSchemaConfig />
          {confirmationVisible && (
            <Confimration
              close={() => {
                setConfirmationVisbile(false);
              }}
              onAction={onExitConfimration}
            />
          )}
        </div>
      </>
    </Context.Provider>
  );
};

export default Home;
