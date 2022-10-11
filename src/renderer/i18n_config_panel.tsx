import { Modal } from '@mui/material';
import { SchemaFieldObject } from 'models/schema';
import { useContext, useEffect, useState } from 'react';
import {
  RiArrowDownFill,
  RiArrowUpFill,
  RiDeleteBin2Fill,
} from 'react-icons/ri';
import classNames from 'classnames';
import Context from './context';
import { EVENT, eventBus } from './event';
import { PROJECT_PATH } from 'constatnts/storage_key';
import { parse } from 'json2csv';
import { getProjectBaseUrl } from './utils/file';

const ACITON_ICON_CLASS =
  'cursor-pointer font-bold text-2xl text-zinc-900 hover:text-zinc-500 transition-all z-10';

function I18nConfigPanel() {
  const [visible, setVisible] = useState(false);
  const { projectConfig } = useContext(Context);

  const [i18nList, seti18nList] = useState<any[]>(projectConfig?.i18n || []);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      seti18nList(projectConfig?.i18n || []);
    };
    eventBus.on(EVENT.SHOW_I18N_CONFIG, show);
    return () => {
      eventBus.off(EVENT.SHOW_I18N_CONFIG, show);
    };
  }, [projectConfig]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      open
      onClose={() => {
        // setVisible(false);
        return false;
      }}
    >
      <div
        className="absolute bg-slate-400 p-4 pb-5"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          height: '50%',
          borderRadius: '0px',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full items-center">
            <div className="text-slate-900 font-bold text-2xl mb-5">
              I18n Config
            </div>

            <div
              className="flex overflow-auto flex-grow"
              style={{
                flexWrap: 'wrap',
              }}
            >
              {i18nList.map((item, i) => {
                return (
                  <div className="flex items-center">
                    <input
                      className="text-md w-full outline-none p-2 transition-all mr-2"
                      value={item}
                      onChange={(e) => {
                        seti18nList((prev) => {
                          prev[i] = e.target.value;
                          return [...prev];
                        });
                      }}
                    />

                    <div className="ml-auto">
                      <RiDeleteBin2Fill
                        className={classNames(ACITON_ICON_CLASS, 'mr-2')}
                        onClick={() => {
                          seti18nList((prev) => {
                            return prev.filter((d) => d !== item);
                          });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="bg-slate-600 text-zinc-50 font-bold border-zinc-900 border-r-2 border-b-2 mr-4 hover:bg-slate-500 transition-all px-5 mb-2 mt-auto h-12"
              onClick={() => {
                seti18nList((prev) => {
                  return prev.concat('lang');
                });
              }}
            >
              Add i18n item
            </button>
          </div>
          <div className="flex h-12 flex-shrink-0">
            <button
              className="flex-grow bg-rose-600 text-zinc-50 font-bold border-zinc-900 border-r-2 border-b-2 mr-4 hover:bg-rose-500 transition-all"
              onClick={() => {
                setVisible(false);
              }}
            >
              Cancel
            </button>
            <button
              className="flex-grow bg-slate-300 text-zinc-900 font-bold border-zinc-900 border-r-2 border-b-2 hover:bg-slate-200 transition-all"
              onClick={async () => {
                try {
                  if (localStorage.getItem(PROJECT_PATH)) {
                    await window.electron.ipcRenderer.call('saveFile', {
                      path: localStorage.getItem(PROJECT_PATH),
                      data: JSON.stringify(
                        {
                          ...projectConfig,
                          i18n: i18nList,
                        },
                        null,
                        2
                      ),
                    });
                    window.location.reload();
                  } else {
                    const val2 =
                      await window.electron.ipcRenderer.saveFileDialog({
                        action: 'save-value-file',
                        data: JSON.stringify(
                          {
                            ...projectConfig,
                            i18n: i18nList,
                          },
                          null,
                          2
                        ),
                        extensions: ['bp'],
                      });

                    if (val2?.res?.path) {
                      localStorage.setItem(PROJECT_PATH, val2.res.path);
                      const options = { fields: i18nList };
                      const csv = parse([], options);
                      window.electron.ipcRenderer
                        .call('writeFile', {
                          filePath:
                            getProjectBaseUrl() + '\\' + 'translations.csv',
                          data: csv,
                        })
                        .then(() => {
                          window.location.reload();
                        });
                    }
                  }
                  setVisible(false);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default I18nConfigPanel;
