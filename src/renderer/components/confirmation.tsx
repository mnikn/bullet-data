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
          background: '#464D54',
          paddingLeft: '60px',
          paddingRight: '60px',
          color: '#ffffff',
        },
      }}
    >
      <DialogTitle>File not save</DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            color: '#ffffff',
            fontWeight: 'bold',
          }}
        >
          File has been changed without save. Exit anyway?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <button
          className="flex-grow bg-slate-300 text-zinc-900 font-bold border-zinc-900 border-r-2 border-b-2 hover:bg-slate-200 transition-all p-2"
          onClick={() => {
            onAction(false);
            close();
          }}
        >
          Cancel
        </button>
        <button
          className="flex-grow bg-rose-600 text-zinc-50 font-bold border-zinc-900 border-r-2 border-b-2 mr-4 hover:bg-rose-500 transition-all p-2"
          onClick={() => {
            onAction(true);
            close();
          }}
        >
          Yes
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default Confimration;
