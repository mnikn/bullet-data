import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {
  Box,
  Button,
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
import classNames from 'classnames';
import { FILE_PATH, SIDEBAR_VISIBLE } from 'constatnts/storage_key';
import { useContext, useEffect, useState } from 'react';
import Context from 'renderer/context';
import { EVENT, eventBus } from './event';
import { FileTreeFile, FileTreeFolder } from './hooks/use_project';
import { PRIMARY_COLOR1, PRIMARY_COLOR2, PRIMARY_COLOR2_LIGHT1 } from './style';
import Dialog from './components/dialog';
import { findFolderInTree } from './utils/file';

function NameDialog() {
  const [name, setName] = useState<string>('');
  const [source, setSource] = useState<FileTreeFile | FileTreeFolder | null>(
    null
  );
  const [action, setAction] = useState<
    'create_file' | 'create_folder' | 'rename_file' | 'rename_folder'
  >('create_file');
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const show = ({
      source = null,
      action = 'create_file',
    }: {
      source: FileTreeFile | FileTreeFolder | null;
      action: 'create_file' | 'create_folder' | 'rename_file' | 'rename_folder';
    }) => {
      setSource(source);
      setAction(action);
      setName(
        action === 'rename_file' || action === 'rename_folder'
          ? source?.partName.replace('.json', '') || ''
          : ''
      );
      setVisible(true);
    };
    eventBus.on(EVENT.SHOW_NAME_DIALOG, show);
    return () => {
      eventBus.off(EVENT.SHOW_NAME_DIALOG, show);
    };
  }, []);

  if (!visible) {
    return null;
  }
  return (
    <Dialog open title={'Name'}>
      <div className="flex flex-col p-2 mb-5">
        <input
          className="text-md w-full outline-none p-2 focus:outline-2 focus:outline-zinc-900 transition-all text-zinc-900"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          style={{
            outlineOffset: 0,
          }}
        />
      </div>
      <div className="flex h-12 px-6">
        <button
          className="flex-grow bg-rose-600 text-zinc-50 font-bold border-zinc-900 border-r-2 border-b-2 mr-4 hover:bg-rose-500 transition-all"
          onClick={() => {
            setVisible(false);
          }}
        >
          Cancel
        </button>
        <button
          className="flex-grow bg-yellow-300 text-zinc-900 font-bold border-zinc-900 border-r-2 border-b-2 hover:bg-yellow-200 transition-all"
          onClick={() => {
            if (action === 'create_file') {
              /**
                const folderPath = source.currentPath.substring(
                  0,
                  source.currentPath.lastIndexOf('\\')
                );
                eventBus.emit(
                  EVENT.RENAME_FILE,
                  currentRename.currentPath,
                  (folderPath ? folderPath + '\\' : '') + s + '.json'
                );
               **/

              eventBus.emit(
                EVENT.NEW_FILE,
                (source?.currentPath ? source?.currentPath + '\\' : '') +
                  name +
                  '.json',
                name + '.json'
              );
            } else if (action === 'rename_file') {
              /**
                const folderPath = source.currentPath.substring(
                  0,
                  source.currentPath.lastIndexOf('\\')
                );
                eventBus.emit(
                  EVENT.RENAME_FILE,
                  currentRename.currentPath,
                  (folderPath ? folderPath + '\\' : '') + s + '.json'
                );
               **/
              const folderPath = source?.currentPath?.substring(
                0,
                source?.currentPath?.lastIndexOf('\\')
              );
              eventBus.emit(
                EVENT.RENAME_FILE,
                source?.currentPath,
                folderPath + `${name}.json`
              );
            } else if (action === 'create_folder') {
              eventBus.emit(
                EVENT.NEW_FOLDER,
                (source?.currentPath ? source?.currentPath + '\\' : '') + name
              );
            }
            setVisible(false);
          }}
        >
          Confirm
        </button>
      </div>
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
      <button
        onContextMenu={(e) => {
          showMenu(e, data);
        }}
        className={classNames(
          'p-2 pl-5 pr-5 text-md text-zinc-900 font-bold transition-all',
          {
            'bg-slate-300': localStorage.getItem(FILE_PATH) === data.fullPath,
          }
        )}
        style={{
          borderRadius: '0px',
          display: 'flow-root',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          direction: 'rtl',
          textAlign: 'left',
          marginLeft: `${level * 20}px`,
        }}
        onClick={() => {
          localStorage.setItem(FILE_PATH, data.fullPath);
          eventBus.emit(EVENT.SET_CURRENT_FILE, data);
          // window.location.reload();
        }}
      >
        {data.partName}
      </button>
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

  const newFile = (folder?: FileTreeFolder) => {
    eventBus.emit(EVENT.SHOW_NAME_DIALOG, {
      source: folder,
      action: 'create_file',
    });
  };

  const renameFile = (file: FileTreeFile) => {
    eventBus.emit(EVENT.SHOW_NAME_DIALOG, {
      source: file,
      action: 'rename_file',
    });
  };

  /* const renameFolder = (folder?: FileTreeFolder) => {
   *   eventBus.emit(EVENT.SHOW_NAME_DIALOG, {
   *     source: folder,
   *     action: 'rename_folder',
   *   });
   * }; */

  const deleteFile = (path: string) => {
    eventBus.emit(EVENT.DELETE_FILE, path);
  };

  /* const newFolder = (folder?: FileTreeFolder) => {
   *   eventBus.emit(EVENT.SHOW_NAME_DIALOG, {
   *     source: folder,
   *     action: 'create_folder',
   *   });
   * }; */

  return (
    <div
      className="flex flex-col items-center p-2 bg-slate-500 flex-shrink-0"
      style={{
        width: '300px',
      }}
    >
      <div className="text-slate-50 font-bold text-lg mt-2">Folders</div>
      <Stack
        sx={{ width: '100%', flexGrow: 1, padding: '5px' }}
        onContextMenu={(e) => {
          setMenuAnchorEl(e.currentTarget);
          setMenuPos({ x: e.pageX, y: e.pageY });
          setMenuActions([
            {
              title: 'New file',
              fn: newFile,
            },
            /**
            {
              title: 'New folder',
              fn: newFolder,
            },
            **/
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
                setMenuPos({ x: e.pageX, y: e.pageY });
                e.stopPropagation();
                setMenuAnchorEl(e.currentTarget);
                if (d.type === 'file') {
                  setMenuActions([
                    {
                      title: 'Rename...',
                      fn: () => {
                        renameFile(d);
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
                        newFile(d);
                      },
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
            backgroundColor: '#cbd5e1',
            width: '200px',
            borderRadius: 0,
            boxShadow: 0,
            borderBottom: '4px solid #18181b',
            borderRight: '4px solid #18181b',
          },
        }}
      >
        {menuActions.map((m) => {
          return (
            <button
              key={m.title}
              className="outline-none py-2 px-4 text-md flex items-center font-bold justify-center hover:bg-slate-400 w-full transition-all"
              onClick={() => {
                setMenuAnchorEl(null);
                m.fn();
              }}
            >
              {m.title}
            </button>
          );
        })}
      </Menu>
      <NameDialog />
    </div>
  );
}

export default Sidebar;
