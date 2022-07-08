import { Box, Button, Modal, Stack } from '@mui/material';
import { PROJECT_PATH } from 'constatnts/storage_key';
import { useContext, useEffect, useState } from 'react';
import Context from './context';
import ProjectSchemaConfig from './project_schema_config';
import { PRIMARY_COLOR2_LIGHT1 } from './style';

function InitPanel() {
  const [visible] = useState(!localStorage.getItem(PROJECT_PATH));
  const [projectSchemaConfigVisible, setProjectSchemaConfigVisible] =
    useState(false);

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
          width: 480,
          height: 240,
          bgcolor: PRIMARY_COLOR2_LIGHT1,
          borderRadius: '0px',
          clipPath:
            'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
          p: 4,
          outline: 'none',
        }}
      >
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Button
            sx={{
              flexGrow: 1,
              clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
            }}
            variant="contained"
            onClick={() => {
              setProjectSchemaConfigVisible(true);
            }}
          >
            New Project
          </Button>
          <Button
            sx={{
              flexGrow: 1,
              clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
            }}
            variant="contained"
            onClick={async () => {
              const res = await (window as any).electron.ipcRenderer.openFile([
                'bp',
              ]);

              if (res?.res[0]?.path) {
                localStorage.setItem(PROJECT_PATH, res?.res[0]?.path);
                window.location.reload();
              }
            }}
          >
            Open Project...
          </Button>
          {projectSchemaConfigVisible && (
            <ProjectSchemaConfig
              close={() => {
                setProjectSchemaConfigVisible(false);
              }}
            />
          )}
        </Stack>
      </Box>
    </Modal>
  );
}

export default InitPanel;