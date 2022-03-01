import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const Confimration = ({
  close,
  onAction,
}: {
  close: () => void;
  onAction: (value: boolean) => void;
}) => {
  return (
    <Dialog open onClose={close} aria-labelledby="draggable-dialog-title">
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        File not save
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          File has been changed without save. Exit anyway?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => {
          onAction(false);
          close();
        }}>
          Cancel
        </Button>
        <Button onClick={() => {
          onAction(true);
          close();
        }} variant="contained" color="error">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confimration;
