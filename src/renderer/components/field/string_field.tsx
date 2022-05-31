import { TextField } from '@mui/material';
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

  .error {
    position: absolute;
    overflow: hidden;
    bottom: -50%;
    left: 50%;
    width: 80%;
    font-weight: bold;
    text-align: center;
    user-select: none;
    pointer-events: none;
    transform: translateX(-50%);
    color: ${SECOND_COLOR1};
    text-overflow: ellipsis;
  }
`;

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
  const { currentLang, schemaConfig } = useContext(Context);
  const [contentValue, setContentValue] = useState(
    schemaConfig.i18n.length > 0 && schema.config.needI18n
      ? value
        ? value[currentLang]
        : ''
      : value || ''
  );

  useEffect(() => {
    setContentValue(
      schemaConfig.i18n.length > 0 && schema.config.needI18n
        ? value
          ? value[currentLang] || ''
          : ''
        : value || ''
    );
  }, [currentLang]);

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
      onValueChange(
        schema.config.needI18n
          ? { ...value, [currentLang]: textValue }
          : textValue
      );
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
        <MonacoEditor
          width="100%"
          height={schema.config.height}
          language={schema.config.codeLang}
          theme="vs-dark"
          value={contentValue}
          onChange={(v) => {
            setContentValue(v);
            if (onValueChange) {
              onValueChange(
                schema.config.needI18n ? { ...value, [currentLang]: v } : v
              );
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
      <div
        className="error"
        style={{ visibility: errorText ? 'visible' : 'hidden' }}
      >
        {errorText}
      </div>
    </StyledTextField>
  );
}

export default MyTextField;
