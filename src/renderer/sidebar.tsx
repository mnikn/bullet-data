import { Button, IconButton, Stack, Tabs, Tab } from '@mui/material';
import {
  FILE_PATH,
  PROJECT_PATH,
  RECENTE_FILE_PATHS,
  SIDEBAR_VISIBLE,
} from 'constatnts/storage_key';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import uniq from 'lodash/uniq';
import { eventBus, EVENT } from './event';
import { PRIMARY_COLOR1 } from './style';
import { getBaseUrl } from './utils/file';

enum TAB {
  RECENT = 'recent',
  PROJECT = 'project',
}

function Sidebar() {
  const [sidebarVisible, setSidebarVisible] = useState(
    !!Number(localStorage.getItem(SIDEBAR_VISIBLE) || '1')
  );
  const [recentFiles, setRecentFiles] = useState<string[]>(
    JSON.parse(localStorage.getItem(RECENTE_FILE_PATHS) || '[]')
  );
  const [currentTab, setCurrentTab] = useState<TAB>(TAB.RECENT);

  useEffect(() => {
    let projectPath = localStorage.getItem(PROJECT_PATH);
    if (!projectPath) {
      return;
    }
    const baseUrl = getBaseUrl(projectPath);
    window.electron.ipcRenderer.readFolder(
      {
        filePath: baseUrl,
        action: 'read-project-config',
      },
      (val: any) => {
        if (val.data) {
          const allFiles = val.data.filter((item: string) =>
            item.includes('.json')
          );

          console.log(
            'fff: ',
            allFiles,
            allFiles[0].substr(baseUrl.length + 1)
          );
        }
      }
    );
  }, []);

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

  return (
    <Stack
      sx={{
        background: '#8593A1',
        width: '300px',
        flexShrink: '0',
        alignItems: 'center',
      }}
    >
      <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
        <Tab
          sx={{
            color: PRIMARY_COLOR1,
            fontWeight: 'bold',
          }}
          value={TAB.PROJECT}
          label={'Project'}
        />
        <Tab
          sx={{
            color: PRIMARY_COLOR1,
            fontWeight: 'bold',
          }}
          value={TAB.RECENT}
          label={'Recent Files'}
        />
      </Tabs>
      <Stack sx={{ width: '100%', felxGrow: 1 }}>
        {currentTab == TAB.RECENT &&
          recentFiles.map((f: string) => {
            return (
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px',
                }}
              >
                <Button
                  key={f}
                  sx={{
                    borderRadius: '0px',
                    display: 'flow-root',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    direction: 'rtl',
                    textAlign: 'left',
                  }}
                  onClick={() => {
                    localStorage.setItem(FILE_PATH, f);
                    window.location.reload();
                  }}
                >
                  {f}
                </Button>
                <IconButton color="primary">
                  <CloseIcon
                    className="icon"
                    onClick={() => {
                      const recents: any[] = uniq(
                        JSON.parse(
                          localStorage.getItem(RECENTE_FILE_PATHS) || '[]'
                        ).filter((c: any) => c !== f)
                      );
                      setRecentFiles(recents);
                      localStorage.setItem(
                        RECENTE_FILE_PATHS,
                        JSON.stringify(recents)
                      );
                    }}
                  />
                </IconButton>
              </Stack>
            );
          })}
      </Stack>
    </Stack>
  );
}

export default Sidebar;
