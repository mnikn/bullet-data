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
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <MonacoEditor
              width="100%"
              height="100%"
              language="json"
              theme="vs-dark"
              value={content}
              options={{
                readOnly: true,
              }}
            />
          </Stack>
          <Stack spacing={2} direction="row">
            <Button
              sx={{
                flexGrow: 1,
                borderRadius: '0px',
                clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
                marginLeft: 'auto!important',
                marginRight: 'auto!important',
              }}
              variant="contained"
              color="secondary"
              onClick={() => {
                setVisible(false);
              }}
            >
              Close
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default Preview;
