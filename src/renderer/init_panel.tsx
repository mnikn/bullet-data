import { Box, Button, Modal, Stack } from '@mui/material';
import { PROJECT_PATH } from 'constatnts/storage_key';
import { parse } from 'json2csv';
import { useState } from 'react';
import { getProjectBaseUrl } from './utils/file';

function InitPanel() {
  const [visible] = useState(!localStorage.getItem(PROJECT_PATH));

  if (!visible) {
    return null;
  }

  return (
    <Modal open>
      <Box
        className="bg-slate-400"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 480,
          height: 240,
          borderRadius: '0px',
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
            onClick={async () => {
              const val2 = await window.electron.ipcRenderer.saveFileDialog({
                action: 'save-value-file',
                data: JSON.stringify({ i18n: ['en'] }, null, 2),
                extensions: ['bp'],
              });
              if (val2?.res?.path) {
                localStorage.setItem(PROJECT_PATH, val2.res.path);
                const options = { fields: ['keys', 'en'] };
                const csv = parse([], options);
                window.electron.ipcRenderer
                  .call('writeFile', {
                    filePath: getProjectBaseUrl() + '\\' + 'translations.csv',
                    data: csv,
                  })
                  .then(() => {
                    window.location.reload();
                  });
              }
              window.location.reload();
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
        </Stack>
      </Box>
    </Modal>
  );
}

export default InitPanel;
