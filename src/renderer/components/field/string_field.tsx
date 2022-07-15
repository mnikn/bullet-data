import { Stack, TextField } from '@mui/material';
import styled from 'styled-components';
import { SchemaFieldString } from 'models/schema';
import { useContext, useEffect, useRef, useState } from 'react';
import Context from '../../context';
import {
  PRIMARY_COLOR1,
  PRIMARY_COLOR2,
  PRIMARY_COLOR2_LIGHT1,
  PRIMARY_COLOR2_LIGHT2,
  SECOND_COLOR1,
} from '../../style';
import classNames from 'classnames';
import MonacoEditor from 'react-monaco-editor';
import { EVENT, eventBus } from 'renderer/event';
import { get, uniq } from 'lodash';

const StyledTextField = styled.div`
  @keyframes moveup {
    from {
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR2_LIGHT1};
    }
    to {
      top: -15px;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR1};
    }
  }

  @keyframes movedown {
    from {
      top: -25%;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR1};
    }
    to {
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      color: ${PRIMARY_COLOR2_LIGHT1};
    }
  }

  position: relative;
  input {
    background: ${PRIMARY_COLOR1};
    height: 50px;
    font-size: 16px;
    color: ${PRIMARY_COLOR2};
    width: 100%;
    border: none;
    border-radius: 32px;
    padding: 6px;
    padding-left: 12px;
    padding-right: 12px;
    outline: none;
    font-family: system-ui;
    font-weight: bold;
  }

  textarea {
    background: ${PRIMARY_COLOR1};
    height: 150px;
    font-size: 16px;
    color: ${PRIMARY_COLOR2};
    width: 100%;
    border: none;
    border-radius: 32px;
    padding: 20px;
    outline: none;
    resize: none;
    font-family: system-ui;
    font-weight: bold;
  }

  .label {
    position: absolute;
    overflow: hidden;
    top: 50%;
    left: 50%;
    width: 80%;
    text-align: center;
    user-select: none;
    pointer-events: none;
    transform: translateX(-50%) translateY(-50%);
    color: ${PRIMARY_COLOR2_LIGHT2};
    text-overflow: ellipsis;
  }

  .label.title {
    top: -15px;
    transform: translateX(-50%) translateY(-50%);
    color: ${PRIMARY_COLOR1};
    animation: 0.3s moveup;
    font-weight: bold;
  }

  .bottom {
    position: absolute;
    bottom: -50%;
    left: 50%;
    width: 80%;
    font-weight: bold;
    user-select: none;
    pointer-events: none;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .error {
    color: ${SECOND_COLOR1};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const CodeFieldSchema = new SchemaFieldString();

const Editor = ({
  schema,
  contentValue,
  onValueChange,
}: {
  schema: SchemaFieldString;
  contentValue: any;
  onValueChange?: (value: any) => void;
}) => {
  const fields = uniq(
    (schema.config.template || '')
      .match(/(\{{2}\w*\}{2})/g)
      ?.map((item) => item.substring(2, item.length - 2)) || []
  );

  let finalValue = !schema.config.template
    ? contentValue.value
    : schema.config.template || '';
  if (schema.config.template) {
    fields.forEach((f) => {
      finalValue = finalValue.replaceAll(`{{${f}}}`, contentValue.fields[f] || `{{${f}}}`);
    });
  }

  return (
    <Stack direction="row" spacing={1}>
      <MonacoEditor
        width="100%"
        height={schema.config.height}
        language={schema.config.codeLang}
        theme="vs-dark"
        value={finalValue}
        options={{
          readOnly: !!schema.config.template,
        }}
        onChange={(v) => {
          if (onValueChange) {
            onValueChange({
              fields: [],
              value: v,
            });
          }
        }}
      />
      {fields.length > 0 && (
        <Stack spacing={1}>
          {fields.map((f) => {
            return (
              <MyTextField
                label={f}
                schema={CodeFieldSchema}
                value={contentValue.fields[f] || ''}
                onValueChange={(v) => {
                  if (onValueChange) {
                    onValueChange({
                      fields: { ...contentValue.fields, [f]: v },
                      value: (schema.config.template || '').replaceAll(
                        `{{${f}}}`,
                        v
                      ),
                    });
                  }
                }}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

function MyTextField({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldString;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const [focus, setFocus] = useState(false);
  const { currentLang, schemaConfig, projectTranslations, projectConfig } =
    useContext(Context);

  const [contentValue, setContentValue] = useState(
    schema.config.needI18n
      ? projectTranslations[value]?.[currentLang] || ''
      : value
  );

  useEffect(() => {
    setContentValue(
      schema.config.needI18n
        ? projectTranslations[value]?.[currentLang] || ''
        : value
    );
  }, [currentLang, projectTranslations, value]);

  const [errorText, setErrorText] = useState<string | null>(null);
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    setContentValue(textValue);
    if (schema.config.required && !textValue) {
      setErrorText('Text cannot be empty');
      return;
    }
    if (textValue.length < schema.config.minLen) {
      setErrorText(`Text length must more than ${schema.config.minLen}`);
      return;
    }
    if (textValue.length > schema.config.maxLen) {
      setErrorText(`Text length must less than ${schema.config.maxLen}`);
      return;
    }
    if (schema.config.customValidate) {
      const fn = eval(schema.config.customValidate);
      if (fn) {
        const success = fn(textValue);
        if (!success) {
          setErrorText(
            schema.config.customValidateErrorText || 'Custom validate error'
          );
          return;
        }
      }
    }
    setErrorText(null);
    if (onValueChange) {
      if (!schema.config.needI18n) {
        onValueChange(textValue);
      }
    }

    const termKey = value;
    if (schema.config.needI18n) {
      const newTermContent =
        projectTranslations[termKey] ||
        projectConfig.i18n.reduce((r, k) => {
          r[k] = '';
          return r;
        }, {});
      newTermContent[currentLang] = textValue;
      eventBus.emit(EVENT.UPDATE_TRANSLATION, termKey, newTermContent);
    }
  };

  return (
    <StyledTextField>
      {schema.config.type === 'singleline' && (
        <input
          onFocus={() => {
            setFocus(true);
          }}
          onBlur={() => {
            setFocus(false);
          }}
          value={contentValue}
          onChange={onTextChange}
        />
      )}
      {schema.config.type === 'multiline' && (
        <textarea
          onFocus={() => {
            setFocus(true);
          }}
          onBlur={() => {
            setFocus(false);
          }}
          value={contentValue}
          onChange={onTextChange}
          style={{
            height: schema.config.height,
          }}
        />
      )}
      {schema.config.type === 'code' && (
        <Editor
          schema={schema}
          contentValue={contentValue}
          onValueChange={(v) => {
            setContentValue(v);
            if (onValueChange) {
              onValueChange(v);
            }
          }}
        />
      )}
      <div
        className={classNames('label', {
          title: focus || contentValue || schema.config.type === 'code',
        })}
      >
        {label}
      </div>

      <div className="bottom">
        {errorText && <div className="error">{errorText}</div>}
      </div>
    </StyledTextField>
  );
}

export default MyTextField;
