import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Modal, Stack } from '@mui/material';
import { PROJECT_PATH } from 'constatnts/storage_key';
import { useContext, useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import Context from './context';
import { EVENT, eventBus } from './event';
import { PRIMARY_COLOR1, PRIMARY_COLOR2_LIGHT1 } from './style';
import { registerDependencyProposals } from './utils/schema_config';

function ProjectSchemaConfig() {
  const [visible, setVisible] = useState(false);
  const { projectConfig } = useContext(Context);
  const [config, setConfig] = useState<string>(
    JSON.stringify(projectConfig, null, 2)
  );

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
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720,
          height: 620,
          bgcolor: PRIMARY_COLOR2_LIGHT1,
          borderRadius: '0px',
          clipPath:
            'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
          p: 4,
        }}
      >
        <IconButton
          color="primary"
          sx={{
            position: 'absolute',
            top: '8px',
            right: '16px',
          }}
          onClick={() => {
            setVisible(false);
          }}
        >
          <CloseIcon className="icon" />
        </IconButton>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <div
              style={{
                alignSelf: 'center',
                color: PRIMARY_COLOR1,
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              New Project Schema Config
            </div>
            <MonacoEditor
              width="100%"
              height="100%"
              language="json"
              theme="vs-dark"
              value={config}
              onChange={(value) => {
                setConfig(value);
              }}
              editorDidMount={editorDidMount}
            />
          </Stack>
          <Stack spacing={2} direction="row">
            <Button
              sx={{
                flexGrow: 1,
                clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
              }}
              variant="contained"
              onClick={async () => {
                try {
                  const v = JSON.parse(config);
                  const val2 = await window.electron.ipcRenderer.saveFileDialog(
                    {
                      action: 'save-value-file',
                      data: JSON.stringify(v, null, 2),
                      extensions: ['bp'],
                    }
                  );
                  if (val2?.res?.path) {
                    localStorage.setItem(PROJECT_PATH, val2.res.path);
                    window.location.reload();
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Confirm
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}

export default ProjectSchemaConfig;
