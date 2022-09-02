import { Box, Button, Modal, Stack } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import Context from 'renderer/context';
import { EVENT, eventBus } from './event';
import { PRIMARY_COLOR2_LIGHT1 } from './style';

const Preview = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = () => {
      setVisible(true);
    };
    eventBus.on(EVENT.SHOW_FILE_PREVIEW, show);
    return () => {
      eventBus.off(EVENT.SHOW_FILE_PREVIEW, show);
    };
  }, []);
  const { actualValueList } = useContext(Context);
  const content = JSON.stringify(
    actualValueList.map((item) => item.data),
    null,
    2
  );

  if (!visible) {
    return null;
  }
  return (
    <Modal
      open
      onClose={() => {
        setVisible(false);
      }}
    >
      <Box
        className="bg-slate-400 p-4"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720,
          height: 620,
          borderRadius: '0px',
        }}
      >
        <Stack
          className="w-full items-center"
          spacing={2}
          sx={{ height: '100%' }}
        >
          <div className="text-slate-900 font-bold text-2xl mb-2">Preview</div>
          <Stack className="w-full" spacing={2} sx={{ flexGrow: 1 }}>
            <MonacoEditor
              className="w-full h-full"
              language="json"
              theme="vs-dark"
              value={content}
              options={{
                readOnly: true,
              }}
            />
          </Stack>
          <Stack spacing={2} direction="row">
            <button
              className="flex-grow bg-rose-600 text-zinc-50 font-bold border-zinc-900 border-r-2 border-b-2 mr-4 hover:bg-rose-500 transition-all py-2 px-32"
              variant="contained"
              onClick={() => {
                setVisible(false);
              }}
              color="secondary"
            >
              Cancel
            </button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default Preview;
