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

const ACITON_ICON_CLASS =
  'cursor-pointer font-bold text-2xl text-zinc-900 hover:text-zinc-500 transition-all z-10';

function FilterConfigPanel({ initialValue }: { initialValue: any }) {
  const [visible, setVisible] = useState(false);
  const { schema } = useContext(Context);

  const [filters, setFilters] = useState<any[]>([]);

  useEffect(() => {
    const show = () => {
      setVisible(true);
    };
    eventBus.on(EVENT.SHOW_FILE_FILTER_CONFIG, show);
    return () => {
      eventBus.off(EVENT.SHOW_FILE_FILTER_CONFIG, show);
    };
  }, []);

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
          width: 850,
          height: 780,
          borderRadius: '0px',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full items-center">
            <div className="text-slate-900 font-bold text-2xl mb-5">
              File Schema Config
            </div>

            <div className="flex flex-col overflow-auto flex-grow">
              {filters.map((item) => {
                return (
                  <div className="flex items-center">
                    <div className="text-md font-bold mr-2">Label:</div>
                    <input
                      className="text-md w-full outline-none p-2 transition-all mr-2"
                      value={item.label}
                      onChange={(e) => {
                        item.label = e.target.value;
                        setFilters((prev) => {
                          return [...prev];
                        });
                      }}
                    />

                    <div className="text-sm font-bold mr-2">Prop:</div>
                    <input
                      className="text-md w-full outline-none p-2 transition-all mr-2"
                      value={item.prop}
                      onChange={(e) => {
                        item.prop = e.target.value;
                        setFilters((prev) => {
                          return [...prev];
                        });
                      }}
                    />

                    <div className="ml-auto">
                      <RiDeleteBin2Fill
                        className={classNames(ACITON_ICON_CLASS, 'mr-2')}
                        onClick={() => {
                          setFilters((prev) => {
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
                setFilters((prev) => {
                  return prev.concat({
                    label: 'Filter prop name',
                    prop: '',
                  });
                });
              }}
            >
              Add fitler item
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
                  const configData = {
                    ...initialValue,
                    filters,
                  };
                  eventBus.emit(EVENT.FILE_SCHEMA_CHANGED, configData);
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

export default FilterConfigPanel;
