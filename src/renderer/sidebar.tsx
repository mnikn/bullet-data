import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
  Menu,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { FILE_PATH, SIDEBAR_VISIBLE } from 'constatnts/storage_key';
import { useContext, useEffect, useState } from 'react';
import Context from 'renderer/context';
import { EVENT, eventBus } from './event';
import { FileTreeFile, FileTreeFolder } from './hooks/use_project';
import { PRIMARY_COLOR1, PRIMARY_COLOR2, PRIMARY_COLOR2_LIGHT1 } from './style';

function RenameDialog({
  close,
  submit,
  initialVal,
}: {
  initialVal: string;
  close: () => void;
  submit: (name: string) => void;
}) {
  const [name, setName] = useState<string>(initialVal);
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
          padding: '20px 60px',
        },
      }}
    >
      <DialogTitle>Rename file</DialogTitle>
      <DialogContent>
        <TextField
          sx={{}}
          inputProps={{
            sx: {
              padding: '20px',
              background: PRIMARY_COLOR2_LIGHT1,
              color: PRIMARY_COLOR1,
            },
          }}
          autoFocus
          placeholder="file name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button variant="contained" onClick={close} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            submit(name);
            close();
          }}
          variant="contained"
          color="primary"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FileTree({
  data,
  level,
  showMenu,
}: {
  data: any;
  level: number;
  showMenu: (event: any, data: FileTreeFile | FileTreeFolder) => void;
}) {
  const [expanded, setExpanded] = useState(data.expanded);
  if (data.type === 'file') {
    return (
      <Button
        onContextMenu={(e) => {
          showMenu(e, data);
        }}
        sx={{
          borderRadius: '0px',
          display: 'flow-root',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          direction: 'rtl',
          textAlign: 'left',
          marginLeft: `${level * 20}px`,
          backgroundColor:
            localStorage.getItem(FILE_PATH) === data.fullPath
              ? 'rgba(240, 233, 108, 0.20)'
              : undefined,
        }}
        onClick={() => {
          localStorage.setItem(FILE_PATH, data.fullPath);
          eventBus.emit(EVENT.SET_CURRENT_FILE, data);
          // window.location.reload();
        }}
      >
        {data.partName}
      </Button>
    );
  }
  return (
    <>
      <Stack
        direction="row"
        sx={{
          width: '100%',
          paddingLeft: `${level * 20}px`,
          alignItems: 'center',
        }}
        onClick={() => setExpanded((prev) => !prev)}
        onContextMenu={(e) => {
          showMenu(e, data);
        }}
      >
        <Box
          className="icon"
          sx={{
            width: 0,
            height: 0,
            border: expanded
              ? '8px solid transparent'
              : '6px solid transparent',
            marginTop: expanded ? '8px' : undefined,
            marginRight: expanded ? '6px' : '4px',
            borderTop: expanded ? `8px solid ${PRIMARY_COLOR1}` : undefined,
            borderLeft: expanded ? undefined : `10px solid ${PRIMARY_COLOR1}`,
            cursor: 'pointer',
            '&:hover': {
              filter: 'brightness(1.5)',
            },
          }}
        />
        {expanded ? (
          <FolderOpenIcon sx={{ color: PRIMARY_COLOR1 }} />
        ) : (
          <FolderIcon sx={{ color: PRIMARY_COLOR1 }} />
        )}

        <Button
          sx={{
            borderRadius: '0px',
            display: 'flow-root',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            direction: 'rtl',
            textAlign: 'left',
            flexGrow: 1,
          }}
        >
          {data.partName}
        </Button>
      </Stack>
      {expanded && (
        <>
          {data.children.map((d) => {
            return (
              <FileTree
                key={d.currentPath}
                data={d}
                level={level + 1}
                showMenu={showMenu}
              />
            );
          })}
        </>
      )}
    </>
  );
}

function Sidebar() {
  const [sidebarVisible, setSidebarVisible] = useState(
    !!Number(localStorage.getItem(SIDEBAR_VISIBLE) || '1')
  );
  const { projectFileTree } = useContext(Context);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPos, setMenuPos] = useState<any>({ x: 0, y: 0 });
  const menuOpen = Boolean(menuAnchorEl);
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const [menuActions, setMenuActions] = useState<
    { fn: () => void; title: string }[]
  >([]);

  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [currentRename, setCurrentRename] = useState<
    FileTreeFile | FileTreeFolder | null
  >(null);

  useEffect(() => {
    eventBus.on(EVENT.TOGGLE_SIDEBAR, () => {
      setSidebarVisible((prev) => {
        const newVisible = !prev;
        localStorage.setItem(SIDEBAR_VISIBLE, newVisible ? '1' : '0');
        return newVisible;
      });
    });
  }, []);

  if (!sidebarVisible) {
    return null;
  }

  const newFile = (path?: string) => {
    eventBus.emit(EVENT.NEW_FILE, path);
  };

  const deleteFile = (path: string) => {
    eventBus.emit(EVENT.DELETE_FILE, path);
  };

  return (
    <Stack
      sx={{
        background: '#8593A1',
        width: '300px',
        flexShrink: '0',
        alignItems: 'center',
        padding: '10px',
      }}
    >
      <div style={{ color: PRIMARY_COLOR1, fontWeight: 'bold' }}>FOLDERS</div>
      <Stack
        sx={{ width: '100%', flexGrow: 1, padding: '5px' }}
        onContextMenu={(e) => {
          setMenuAnchorEl(e.currentTarget);
          setMenuPos({ x: e.screenX, y: e.screenY });
          setMenuActions([
            {
              title: 'New file',
              fn: newFile,
            },
            {
              title: 'New folder',
              fn: () => {},
            },
          ]);
        }}
      >
        {(projectFileTree || []).map((f: any) => {
          return (
            <FileTree
              key={f.currentPath}
              data={f}
              level={0}
              showMenu={(e, d) => {
                setMenuPos({ x: e.screenX, y: e.screenY });
                e.stopPropagation();
                setMenuAnchorEl(e.currentTarget);
                if (d.type === 'file') {
                  setMenuActions([
                    {
                      title: 'Rename...',
                      fn: () => {
                        setCurrentRename(d);
                        setRenameDialogVisible(true);
                      },
                    },
                    {
                      title: 'Delete file',
                      fn: () => {
                        deleteFile(d.currentPath || '');
                      },
                    },
                  ]);
                } else if (d.type === 'folder') {
                  setMenuActions([
                    {
                      title: 'New file',
                      fn: () => {
                        newFile(d.currentPath);
                      },
                    },
                    {
                      title: 'New folder',
                      fn: () => {},
                    },
                    {
                      title: 'Rename...',
                      fn: () => {
                        setCurrentRename(d);
                        setRenameDialogVisible(true);
                      },
                    },
                    {
                      title: 'Delete folder',
                      fn: () => {},
                    },
                  ]);
                }
              }}
            />
          );
        })}
      </Stack>
      <Menu
        id="sidebar-menu"
        open={menuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorReference="anchorPosition"
        anchorPosition={{
          left: menuPos.x,
          top: menuPos.y,
        }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: PRIMARY_COLOR1,
            width: '200px',
            borderRadius: '32px',
          },
        }}
      >
        {menuActions.map((m) => {
          return (
            <MenuItem
              key={m.title}
              sx={{ display: 'flex', justifyContent: 'center' }}
              onClick={() => {
                setMenuAnchorEl(null);
                m.fn();
              }}
            >
              {m.title}
            </MenuItem>
          );
        })}
      </Menu>
      {renameDialogVisible && (
        <RenameDialog
          initialVal={currentRename?.partName?.replace('.json', '') || ''}
          close={() => {
            setRenameDialogVisible(false);
          }}
          submit={(s) => {
            if (!currentRename || !currentRename.currentPath) {
              return;
            }

            if (currentRename?.type == 'file') {
              const folderPath = currentRename.currentPath.substring(
                0,
                currentRename.currentPath.lastIndexOf('\\')
              );
              eventBus.emit(
                EVENT.RENAME_FILE,
                currentRename.currentPath,
                (folderPath ? folderPath + '\\' : '') + s + '.json'
              );
            }
          }}
        />
      )}
    </Stack>
  );
}

export default Sidebar;
