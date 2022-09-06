import {
  Box,
  Button,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { set } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import Context from 'renderer/context';
import { EVENT, eventBus } from './event';
import { PRIMARY_COLOR2_LIGHT1 } from './style';

function iterObject(
  val: any,
  filterFn: (data: any) => boolean,
  parentPath = ''
) {
  if (val instanceof Array) {
    let currentPath = '';
    val.find((item, i) => {
      let match = iterObject(
        item,
        filterFn,
        (parentPath ? parentPath + '.' : '') + `[${i}]`
      );
      if (match) {
        currentPath = match;
      }
      return match;
    });
    return currentPath;
  } else if (typeof val === 'object' && val) {
    let currentPath = null;
    Object.keys(val).find((item) => {
      let match = iterObject(
        val[item],
        filterFn,
        (parentPath ? parentPath + '.' : '') + item
      );
      if (match) {
        currentPath = match;
      }
    });
    return currentPath;
  } else {
    if (filterFn(val)) {
      return parentPath;
    }
    return null;
  }
}

const TranslationManageDialog = () => {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<any[]>([]);

  useEffect(() => {
    const show = () => {
      setVisible(true);
    };
    eventBus.on(EVENT.SHOW_TRANSLATION_MANAGER_DIALOG, show);
    return () => {
      eventBus.off(EVENT.SHOW_TRANSLATION_MANAGER_DIALOG, show);
    };
  }, []);
  const { actualValueList, projectTranslations, projectConfig } =
    useContext(Context);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const currentFileTranslations = Object.keys(projectTranslations)
      .map((key) => {
        const matchProp = iterObject(
          actualValueList.map((item) => item.data),
          (d) => {
            return key === d;
          }
        );
        if (matchProp) {
          return {
            prop: matchProp,
            oldI18nKey: key,
            i18nKey: key,
            content: {
              ...projectTranslations[key],
            },
          };
        }
        return null;
      })
      .filter((item) => !!item);
    setForm(currentFileTranslations);
  }, [projectTranslations, visible, actualValueList]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      open
      onClose={() => {
        setVisible(false);
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720,
          height: 620,
          bgcolor: PRIMARY_COLOR2_LIGHT1,
          borderRadius: '0px',
          clipPath:
            'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
          p: 4,
        }}
      >
        <Stack spacing={2} sx={{ height: '100%' }}>
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Index</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Prop</TableCell>
                  {projectConfig.i18n.map((lang: string) => {
                    return <TableCell key={lang}>{lang}</TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {form.map((val: any, i: number) => (
                  <TableRow
                    key={i}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={val.i18nKey}
                        onChange={(e) => {
                          setForm((prev) => {
                            return prev.map((item2, j) =>
                              j !== i
                                ? item2
                                : { ...item2, i18nKey: e.target.value }
                            );
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>{val.prop}</TableCell>

                    {projectConfig.i18n.map((lang: string) => {
                      return (
                        <TableCell key={lang}>{val.content[lang]}</TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} direction="row">
            <Button
              sx={{
                flexGrow: 1,
                clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
              }}
              variant="contained"
              onClick={async () => {
                const valueList = actualValueList.map((item) => item.data);
                form.forEach((item) => {
                  delete projectTranslations[item.oldI18nKey];
                  projectTranslations[item.i18nKey] = item.content;
                  set(valueList, item.prop, item.i18nKey);
                });
                eventBus.emit(EVENT.SET_TRANSLATION, projectTranslations);
                eventBus.emit(EVENT.DATA_LIST_SET, valueList);
                setVisible(false);
              }}
            >
              Confirm
            </Button>
            <Button
              sx={{
                flexGrow: 1,
                clipPath: 'polygon(0 0, 90% 0, 100% 100%, 10% 100%)',
              }}
              variant="contained"
              onClick={() => {
                setVisible(false);
              }}
              color="secondary"
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default TranslationManageDialog;
