import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Tab, Tabs } from '@mui/material';
import { useContext } from 'react';
import Context from 'renderer/context';
import { EVENT, eventBus } from './event';
import { PRIMARY_COLOR1 } from './style';

function Navbar() {
  const { currentFile, recentOpenFiles } = useContext(Context);

  return (
    <Tabs
      variant="scrollable"
      scrollButtons
      allowScrollButtonsMobile
      value={currentFile}
      onChange={(_, v) => {
        eventBus.emit(EVENT.SET_CURRENT_FILE, v);
      }}
      TabScrollButtonProps={{
        sx: {
          '& .MuiSvgIcon-root': {
            color: PRIMARY_COLOR1,
          },
        },
      }}
      sx={{
        backgroundColor: '#707C87',
      }}
    >
      {recentOpenFiles.map((t) => {
        return (
          <Tab
            key={t.currentPath}
            sx={{
              color: PRIMARY_COLOR1,
              fontWeight: 'bold',
            }}
            value={t}
            label={
              <>
                {t.partName}
                {recentOpenFiles.length > 1 && (
                  <IconButton
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-10px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      eventBus.emit(EVENT.CLOSE_FILE, t);
                    }}
                  >
                    <CloseIcon className="icon" />
                  </IconButton>
                )}
              </>
            }
          />
        );
      })}
    </Tabs>
  );
}

export default Navbar;
