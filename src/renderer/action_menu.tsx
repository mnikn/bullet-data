import { Button, Menu, MenuItem, Stack } from '@mui/material';
import { FILE_PATH, PROJECT_PATH } from 'constatnts/storage_key';
import { useState } from 'react';
import { EVENT, eventBus } from './event';
import { PRIMARY_COLOR1 } from './style';

/* <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto' }}>
 *   {schemaConfig.i18n.length > 0 && i18nSelectionSchema && (
 *     <FieldSelect
 *       schema={i18nSelectionSchema}
 *       value={currentLang}
 *       onValueChange={(v) => {
 *         setCurrentLang(v);
 *       }}
 *     />
 *   )}
 * </Stack> */

function ActionMenu() {
  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const headerMenuOpen = Boolean(headerAnchorEl);
  const handleHeaderMenuClose = () => {
    setHeaderAnchorEl(null);
  };
  const [headerMenuActions, setHeaderMenuActions] = useState<
    { fn: () => void; title: string; shortcut?: string }[]
  >([]);

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        // position: 'sticky',
        // top: 0,
        // zIndex: 2,
        // background: 'rgb(70, 77, 84)',
        padding: '5px',
        backgroundColor: '#707C87',
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{
          flexGrow: 1,
          paddingLeft: '10px',
        }}
      >
        <Button
          sx={{
            width: '120px',
            borderRadius: '0px',
            clipPath:
              'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%, 15% 50%)',
          }}
          variant="contained"
          onClick={(e) => {
            setHeaderAnchorEl(e.currentTarget);
            setHeaderMenuActions([
              {
                title: 'New project',
                fn: () => {
                  //save();
                  eventBus.emit(EVENT.SAVE_FILE);
                  localStorage.removeItem(FILE_PATH);
                  localStorage.removeItem(PROJECT_PATH);
                  window.location.reload();
                },
              },
              {
                title: 'Open project...',
                fn: () => {},
              },
              {
                title: 'Project settings',
                fn: () => {
                  eventBus.emit(EVENT.SHOW_PROJECT_CONFIG);
                },
              },
            ]);
          }}
        >
          Project
        </Button>
        <Button
          sx={{
            width: '120px',
            borderRadius: '0px',
            clipPath:
              'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%, 15% 50%)',
          }}
          variant="contained"
          onClick={(e) => {
            setHeaderAnchorEl(e.currentTarget);
            setHeaderMenuActions([
              {
                title: 'Save',
                shortcut: 'Ctrl+S',
                fn: () => {
                  eventBus.emit(EVENT.SAVE_FILE);
                },
              },
              {
                title: 'Schema config',
                fn: () => {
                  eventBus.emit(EVENT.SHOW_FILE_SCHEMA_CONFIG);
                },
              },
              {
                title: 'Preview',
                shortcut: 'Ctrl+L',
                fn: () => {
                  eventBus.emit(EVENT.SHOW_FILE_PREVIEW);
                },
              },
            ]);
          }}
        >
          File
        </Button>
        <Button
          sx={{
            width: '120px',
            borderRadius: '0px',
            clipPath:
              'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%, 15% 50%)',
          }}
          variant="contained"
          onClick={(e) => {
            setHeaderAnchorEl(e.currentTarget);
            setHeaderMenuActions([
              {
                title: 'Toogle sidebar',
                fn: () => {
                  eventBus.emit(EVENT.TOGGLE_SIDEBAR);
                },
              },
            ]);
          }}
        >
          View
        </Button>
      </Stack>
      <Menu
        id="header-menu"
        anchorEl={headerAnchorEl}
        open={headerMenuOpen}
        onClose={handleHeaderMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: PRIMARY_COLOR1,
            width: '200px',
            marginTop: 2,
            borderRadius: '32px',
          },
        }}
      >
        {headerMenuActions.map((m) => {
          return (
            <MenuItem
              key={m.title}
              sx={{ display: 'flex', justifyContent: 'center' }}
              onClick={() => {
                setHeaderAnchorEl(null);
                m.fn();
              }}
            >
              {m.title}

              {m.shortcut && (
                <span style={{ color: '#80868C' }}>( {m.shortcut} )</span>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Stack>
  );
}

export default ActionMenu;
