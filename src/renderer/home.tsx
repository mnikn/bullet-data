import {
  CardContent,
  CircularProgress,
  Collapse,
  IconButton,
  Menu,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PROJECT_PATH } from 'constatnts/storage_key';
import get from 'lodash/get';
import {
  DEFAULT_CONFIG,
  SchemaField,
  SchemaFieldObject,
  validateValue,
} from 'models/schema';
import { useContext, useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiGridFill,
  RiMore2Fill,
} from 'react-icons/ri';
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
import Preview from './preview';
import ProjectSchemaConfig from './project_schema_config';
/* import FilterPanel from './filter_panel'; */
import SchemaConfig from './schema_config';
import Sidebar from './sidebar';
import TranslationManageDialog from './translation_manage_dialog';

const ACITON_ICON_CLASS =
  'cursor-pointer font-bold text-2xl text-zinc-900 hover:text-zinc-500 transition-all z-10';

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

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? '#71717a' : '#52525b',
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
  const handleSettingsClick = (event: React.MouseEvent<any>) => {
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
    <div className="flex flex-col bg-slate-300 w-full p-5 border-b-4 border-r-4 border-zinc-900">
      <div className="flex items-center">
        <div className="font-bold text-lg text-zinc-900">{summary}</div>
        <div className="flex items-center ml-auto">
          <RiMore2Fill
            className={`${ACITON_ICON_CLASS} mr-4`}
            onClick={handleSettingsClick}
          />
          {!expanded && (
            <RiArrowDownSLine
              className={ACITON_ICON_CLASS}
              onClick={handleExpandClick}
            />
          )}
          {expanded && (
            <RiArrowUpSLine
              className={ACITON_ICON_CLASS}
              onClick={handleExpandClick}
            />
          )}
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
            backgroundColor: '#cbd5e1',
            borderBottom: '4px solid #18181b',
            borderRight: '4px solid #18181b',
            borderRadius: 0,
            boxShadow: 0,
          },
        }}
      >
        <button
          className="outline-none py-2 px-4 text-md flex items-center font-bold justify-center hover:bg-slate-400 transition-all"
          onClick={() => {
            onDuplicate();
            handleSettingsClose();
          }}
        >
          Duplicate
        </button>
        <button
          className="outline-none py-2 px-4 text-md flex items-center font-bold justify-center hover:bg-slate-400 w-full transition-all"
          onClick={() => {
            onDelete();
            handleSettingsClose();
          }}
        >
          Delete
        </button>
      </Menu>
    </div>
  );
};

const Home = () => {
  const [confirmationVisible, setConfirmationVisbile] = useState(false);

  const {
    projectFileTree,
    projectConfig,
    projectTranslations,
    currentLang,
    projectFiles,
  } = useProject();
  const { currentFile } = useExplorer({
    projectFiles,
  });

  const { currentFileData, schemaConfig, schema, saving } = useFile({
    currentFile,
    projectConfig,
    projectTranslations,
  });
  const { actualValueList, displayValueList } = useDataList({
    currentFileData,
    schema,
    projectTranslations,
    currentLang,
    projectConfig,
  });
  const projectTransltionsRef = useRef<any>(projectTranslations);
  projectTransltionsRef.current = projectTranslations;

  useShortcut({ actualValueList, projectConfig });

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
        return validateValue(
          item,
          item,
          schema,
          schemaConfig,
          projectTransltionsRef.current
        );
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
        actualValueList,
      }}
    >
      <>
        {schemaConfig?.filters && schemaConfig?.filters.length > 0 && (
          <FilterPanel />
        )}
        <div
          className="bg-zinc-600"
          style={{
            //backgroundColor: '#464D54',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {saving && (
            <div
              className="absolute fixed p-10 bg-slate-700 font-bold text-slate-50 z-10"
              style={{
                left: '50%',
                top: '50px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="f-full w-full items-center flex items-center">
                <CircularProgress className="text-slate-300 mr-5" />
                <div style={{ fontSize: '18px', zIndex: 3 }}>
                  Saving...Please wait for a while
                </div>
              </div>
            </div>
          )}

          <ActionMenu />

          <div className="flex-grow flex">
            <Sidebar />
            {schema && (
              <div className="flex-grow flex flex-col">
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
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          ...getListStyle(snapshot.isDraggingOver),
                          ...{
                            width: '100%',
                            flexGrow: 1,
                            overflow: 'auto',
                            height: '400px',
                            // background: snapshot.isDraggingOver
                            //   ? PRIMARY_COLOR1_LIGHT1
                            //   : '#464D54',
                          },
                        }}
                        className="w-full flex-grow flex flex-col"
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
                                      ? '#ef4444'
                                      : '#52525b',
                                  }}
                                >
                                  <div className="flex items-center w-full">
                                    <span
                                      {...provided.dragHandleProps}
                                      className="mr-4"
                                    >
                                      <RiGridFill className="font-bold text-2xl text-slate-300" />
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
                                        eventBus.emit(
                                          EVENT.DATA_ITEM_DELETE,
                                          i
                                        );
                                      }}
                                    />
                                  </div>
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
                <button
                  className="w-4/6 p-4 mx-auto mb-4 bg-slate-300 border-b-4 border-r-4 border-t-2 border-l-2 border-zinc-900 text-zinc-900 font-bold text-md hover:bg-slate-200 transition-all"
                  onClick={() => {
                    eventBus.emit(EVENT.DATA_ITEM_ADD);
                  }}
                >
                  Add Item
                </button>
              </div>
            )}
          </div>

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
