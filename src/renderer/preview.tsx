import { Box, Button, Modal, Stack } from '@mui/material';
import MonacoEditor from 'react-monaco-editor';
import { PRIMARY_COLOR2_LIGHT1 } from './style';

const Preview = ({
  valueList,
  close,
}: {
  valueList: any;
  close: () => void;
}) => {
  const content = JSON.stringify(valueList, null, 2);
  return (
    <Modal open onClose={close}>
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
                close();
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
