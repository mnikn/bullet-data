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
import { PROJECT_PATH } from 'constatnts/storage_key';
import { cloneDeep } from 'lodash';
import get from 'lodash/get';
import {
  DEFAULT_CONFIG,
  SchemaField,
  SchemaFieldObject,
  SchemaFieldSelect,
  validateValue,
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
import useShortcut from './hooks/use_shortcut';
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
import TranslationManageDialog from './translation_manage_dialog';

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

  const { currentLang, projectTranslations } = useContext(Context);
  const summary = schema.config.summary.replace(
    /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
    (all: any) => {
      const item = all.substring(2, all.length - 2);
      if (item === '___index') {
        return index;
      }
      const v = get(value, item, '');
      if (projectTranslations[v]) {
        return projectTranslations[v][currentLang] || '';
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
  /* const [currentLang, setCurrentLang] = useState<string>(''); */
  /* const [schema, setSchema] = useState<SchemaField | null>(null); */

  const { projectFileTree, projectConfig, projectTranslations, currentLang } =
    useProject();
  const { currentFile, recentOpenFiles } = useExplorer({ projectFileTree });
  const { currentFileData, schemaConfig, schema, saving } = useFile({
    currentFile,
    projectConfig,
  });
  const { actualValueList, displayValueList } = useDataList({
    currentFile,
    currentFileData,
    schema,
    projectTranslations,
    currentLang,
    projectConfig,
  });

  useShortcut({ actualValueList, projectConfig });

  /* const actualValueListRef = useLatest(actualValueList); */

  /* useEffect(() => {
   *   const onKeyDown = (e: any) => {
   *     if (e.code === 'KeyS' && e.ctrlKey) {
   *       eventBus.emit(
   *         EVENT.SAVE_FILE,
   *         actualValueListRef.current.map((item) => item.data)
   *       );
   *     }
   *     if (e.code === 'KeyL' && e.ctrlKey) {
   *       eventBus.emit(EVENT.SHOW_FILE_PREVIEW);
   *     }
   *     if (e.code === 'KeyO' && e.ctrlKey) {
   *       (window as any).electron.ipcRenderer.openFile();
   *     }
   *   };

   *   document.addEventListener('keydown', onKeyDown);
   *   return () => {
   *     document.removeEventListener('keydown', onKeyDown);
   *   };
   * }, [schemaConfig]);
   */
  useEffect(() => {
    const onClose = async () => {
      if (!schema || !currentFile) {
        return;
      }

      const fileData = await window.electron.ipcRenderer.readJsonFile({
        filePath: currentFile.fullPath,
        action: 'read-data',
      });
      if (!fileData?.data) {
        setConfirmationVisbile(true);
        return;
      }
      const formatData = (JSON.parse(fileData.data) || []).map((item: any) => {
        return validateValue(item, item, schema, schemaConfig);
      });

      if (
        JSON.stringify(formatData) !==
        JSON.stringify(actualValueList.map((item) => item.data))
      ) {
        setConfirmationVisbile(true);
      } else {
        window.electron.ipcRenderer.close();
      }
    };
    window.electron.ipcRenderer.on('close', onClose);
    return () => {
      window.electron.ipcRenderer.removeAllListeners('close');
    };
  }, [currentFile, schema, schemaConfig, actualValueList]);

  const onExitConfimration = (confirmation: boolean) => {
    if (confirmation) {
      window.electron.ipcRenderer.close();
    } else {
      setConfirmationVisbile(false);
    }
  };

  if (!projectFileTree && localStorage.getItem(PROJECT_PATH)) {
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
        setCurrentLang: () => {},
        schemaConfig,
        schema,
        projectConfig,
        projectFileTree,
        projectTranslations,
        currentFile,
        recentOpenFiles,
        actualValueList,
      }}
    >
      <>
        {schemaConfig?.filters && schemaConfig?.filters.length > 0 && (
          <FilterPanel />
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
                backgroundColor: '#464D54',
              }}
            >
              <Navbar />

              <DragDropContext
                onDragEnd={(result: any) => {
                  eventBus.emit(
                    EVENT.DATA_LIST_SET,
                    reorder(
                      actualValueList.map((item) => item.data),
                      result.source.index,
                      result.destination.index
                    )
                  );
                }}
              >
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <Stack
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        ...getListStyle(snapshot.isDraggingOver),
                        ...{
                          width: '100%',
                          flexGrow: 1,
                          overflow: 'auto',
                          height: '400px',
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
                    </Stack>
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
                  marginBottom: '20px!important',
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

          <SchemaConfig initialValue={schemaConfig || DEFAULT_SCHEMA_CONFIG} />
          <InitPanel />
          <Preview />
          <ProjectSchemaConfig />
          <TranslationManageDialog />
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
