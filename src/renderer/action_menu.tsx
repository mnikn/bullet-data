import { Button, Menu, MenuItem, Stack } from '@mui/material';
import { FILE_PATH, PROJECT_PATH } from 'constatnts/storage_key';
import { SchemaFieldSelect } from 'models/schema';
import { useContext, useEffect, useState } from 'react';
import Context from './context';
import { EVENT, eventBus } from './event';
import FieldSelect from './components/field/select_field';
import { PRIMARY_COLOR1 } from './style';

const BUTTON_CLASS =
  'bg-yellow-300 mr-4 p-2 h-full font-bold text-md text-slate-800 border-slate-800 hover:bg-yellow-200 transition-all w-24 flex items-center justify-center text-zinc-900';

function ActionMenu() {
  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const headerMenuOpen = Boolean(headerAnchorEl);
  const handleHeaderMenuClose = () => {
    setHeaderAnchorEl(null);
  };
  const [headerMenuActions, setHeaderMenuActions] = useState<
    { fn: () => void; title: string; shortcut?: string }[]
  >([]);
  const [i18nSelectionSchema, setI18nSelectionSchema] =
    useState<SchemaFieldSelect | null>(null);

  const { projectConfig, currentLang } = useContext(Context);

  useEffect(() => {
    if (!projectConfig) {
      return;
    }

    const i18nSchema = new SchemaFieldSelect();
    i18nSchema.setup({
      options: projectConfig.i18n.map((k: any) => {
        return {
          label: k,
          value: k,
        };
      }),
    });
    setI18nSelectionSchema(i18nSchema);
  }, [projectConfig]);

  return (
    <div className="flex items-center p-4 bg-slate-800">
      <div className="flex items-center flex-grow pl-5">
        <button
          className={BUTTON_CLASS}
          onClick={(e) => {
            setHeaderAnchorEl(e.currentTarget);
            setHeaderMenuActions([
              {
                title: 'New project',
                fn: () => {
                  eventBus.emit(EVENT.SAVE_FILE);
                  localStorage.removeItem(FILE_PATH);
                  localStorage.removeItem(PROJECT_PATH);
                  window.location.reload();
                },
              },
              {
                title: 'Open project...',
                fn: () => {
                  window.electron.ipcRenderer
                    .call('openFile', { extensions: ['bp'] })
                    .then((res) => {
                      if (res?.res[0]?.path) {
                        localStorage.clear();
                        localStorage.setItem(PROJECT_PATH, res?.res[0]?.path);
                        window.location.reload();
                      }
                    });
                },
              },
              {
                title: 'Project settings',
                fn: () => {
                  eventBus.emit(EVENT.SHOW_PROJECT_CONFIG);
                },
              },
              {
                title: 'Translation manager',
                fn: () => {
                  eventBus.emit(EVENT.SHOW_TRANSLATION_MANAGER_DIALOG);
                },
              },
            ]);
          }}
        >
          Project
        </button>
        <button
          className={BUTTON_CLASS}
          onClick={(e) => {
            setHeaderAnchorEl(e.currentTarget);
            setHeaderMenuActions([
              {
                title: 'Save',
                shortcut: 'Ctrl+S',
                fn: () => {
                  eventBus.emit(EVENT.SAVE_FILE);
                },
              },
              {
                title: 'Schema config',
                fn: () => {
                  eventBus.emit(EVENT.SHOW_FILE_SCHEMA_CONFIG);
                },
              },
              {
                title: 'Preview',
                shortcut: 'Ctrl+L',
                fn: () => {
                  eventBus.emit(EVENT.SHOW_FILE_PREVIEW);
                },
              },
            ]);
          }}
        >
          File
        </button>
        <button
          className={BUTTON_CLASS}
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
        </button>

        <div className="flex items-center ml-auto">
          {projectConfig?.i18n?.length > 0 && i18nSelectionSchema && (
            <FieldSelect
              schema={i18nSelectionSchema}
              value={currentLang}
              onValueChange={(v) => {
                eventBus.emit(EVENT.SWITCH_LANG, v);
              }}
            />
          )}
        </div>
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
            backgroundColor: '#cbd5e1',
            width: '240px',
            marginTop: 2,
            borderRadius: 0,
            boxShadow: 0,
            borderBottom: '4px solid #18181b',
            borderRight: '4px solid #18181b',
          },
        }}
      >
        {headerMenuActions.map((m) => {
          return (
            <button
              key={m.title}
              className="outline-none py-2 px-4 text-md flex items-center font-bold justify-center hover:bg-slate-400 w-full transition-all"
              onClick={() => {
                setHeaderAnchorEl(null);
                m.fn();
              }}
            >
              {m.title}

              {m.shortcut && (
                <span style={{ color: '#80868C' }}>( {m.shortcut} )</span>
              )}
            </button>
          );
        })}
      </Menu>
    </div>
  );
}

export default ActionMenu;
