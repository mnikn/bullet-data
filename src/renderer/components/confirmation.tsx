import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { PRIMARY_COLOR1, PRIMARY_COLOR2 } from 'renderer/style';

const Confimration = ({
  close,
  onAction,
}: {
  close: () => void;
  onAction: (value: boolean) => void;
}) => {
  return (
    <Dialog
      open
      onClose={close}
      aria-labelledby="draggable-dialog-title"
      PaperProps={{
        sx: {
          background: PRIMARY_COLOR2,
          color: '#fff',
          clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
          paddingLeft: '60px',
          paddingRight: '60px',
        },
      }}
    >
      <DialogTitle>
        File not save
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            color: '#fff',
          }}
        >
          File has been changed without save. Exit anyway?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            onAction(false);
            close();
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            onAction(true);
            close();
          }}
          variant="contained"
          color="error"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confimration;
