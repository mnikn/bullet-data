import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Modal, Stack } from '@mui/material';
import { PROJECT_PATH } from 'constatnts/storage_key';
import { useContext, useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import Context from './context';
import { EVENT, eventBus } from './event';
import { PRIMARY_COLOR1, PRIMARY_COLOR2_LIGHT1 } from './style';
import { getProjectBaseUrl } from './utils/file';
import { registerDependencyProposals } from './utils/schema_config';
import { parse } from 'json2csv';
import { DEFAULT_PROJECT_CONFIG } from './constants';

function ProjectSchemaConfig() {
  const [visible, setVisible] = useState(false);
  const { projectConfig } = useContext(Context);
  const [config, setConfig] = useState<string>(
    JSON.stringify(projectConfig || DEFAULT_PROJECT_CONFIG, null, 2)
  );

  useEffect(() => {
    if (projectConfig) {
      setConfig(JSON.stringify(projectConfig, null, 2));
    }
  }, [projectConfig]);

  useEffect(() => {
    const show = () => {
      setVisible(true);
    };
    eventBus.on(EVENT.SHOW_PROJECT_CONFIG, show);
    return () => {
      eventBus.off(EVENT.SHOW_PROJECT_CONFIG, show);
    };
  }, []);

  const editorDidMount = (editorVal: any, monaco: any) => {
    registerDependencyProposals(monaco);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal open>
      <Box
        className="absolute bg-slate-400 p-4"
        sx={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720,
          height: 650,
          borderRadius: '0px',
        }}
      >
        <Stack className="items-center" spacing={1} sx={{ height: '100%' }}>
          <Stack className="items-center" spacing={2} sx={{ flexGrow: 1 }}>
            <div className="text-slate-900 font-bold text-2xl mb-2">
              New Project Schema Config
            </div>
            <MonacoEditor
              width="100%"
              height="88%"
              language="json"
              theme="vs-dark"
              value={config}
              onChange={(value) => {
                setConfig(value);
              }}
              editorDidMount={editorDidMount}
            />
          </Stack>
          <Stack className="h-12 w-4/6" spacing={2} direction="row">
            <button
              className="flex-grow bg-slate-300 text-zinc-900 font-bold border-zinc-900 border-r-2 border-b-2 hover:bg-slate-200 transition-all"
              onClick={async () => {
                try {
                  const v = JSON.parse(config);
                  if (localStorage.getItem(PROJECT_PATH)) {
                    await window.electron.ipcRenderer.call('saveFile', {
                      path: localStorage.getItem(PROJECT_PATH),
                      data: JSON.stringify(v, null, 2),
                    });
                    window.location.reload();
                  } else {
                    const val2 =
                      await window.electron.ipcRenderer.saveFileDialog({
                        action: 'save-value-file',
                        data: JSON.stringify(v, null, 2),
                        extensions: ['bp'],
                      });

                    if (val2?.res?.path) {
                      localStorage.setItem(PROJECT_PATH, val2.res.path);
                      const options = { fields: v.i18n };
                      const csv = parse([], options);
                      window.electron.ipcRenderer
                        .call('writeFile', {
                          filePath:
                            getProjectBaseUrl() + '\\' + 'translations.csv',
                          data: csv,
                        })
                        .then(() => {
                          window.location.reload();
                        });
                    }
                  }
                  setVisible(false);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Confirm
            </button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}

export default ProjectSchemaConfig;
