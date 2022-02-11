import { Modal, Box, Stack, Button } from '@mui/material';
import { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

const SchemaConfig = ({
  initialValue,
  close,
  onSubmit,
}: {
  initialValue: any;
  close: () => void;
  onSubmit: (value: any) => void;
}) => {
  const [config, setConfig] = useState<string>(JSON.stringify(initialValue, null, 4));

  return (
    <Modal open onClose={close}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          bgcolor: 'background.paper',
          borderRadius: '12px',
          p: 4,
        }}
      >
        <Stack spacing={2} sx={{ height: '100%' }}>
          <div style={{ flexGrow: 1 }}>
            <MonacoEditor
              width="100%"
              height="100%"
              language="json"
              theme="vs-dark"
              value={config}
              onChange={(value) => {
                setConfig(value);
              }}
            />
          </div>
          <Stack spacing={2} direction="row">
            <Button
              sx={{ flexGrow: 1 }}
              variant="contained"
              onClick={() => {
                try {
                  onSubmit(JSON.parse(config));
                  close();
                } catch (err) {}
              }}
            >
              Confirm
            </Button>
            <Button
              sx={{ flexGrow: 1 }}
              variant="contained"
              onClick={() => {
                close();
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default SchemaConfig;
