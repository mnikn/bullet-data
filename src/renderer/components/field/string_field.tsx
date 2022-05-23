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
} from '../../style';
import classNames from 'classnames';

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
  value: string;
  onValueChange?: (value: any) => void;
}) {
  const [focus, setFocus] = useState(false);
  const [hasBlur, setHasBlur] = useState(false);
  const [contentValue, setContentValue] = useState(
    schema.config.needI18n ? '' : value
  );

  return (
    <StyledTextField>
      {schema.config.type === 'singleline' && (
        <input
          onFocus={() => {
            setFocus(true);
            setHasBlur(true);
          }}
          onBlur={() => {
            setFocus(false);
            setHasBlur(true);
          }}
          value={contentValue}
          onChange={(e) => {
            setContentValue(e.target.value);
            if (onValueChange) {
              onValueChange(e.target.value);
            }
          }}
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
          onChange={(e) => {
            setContentValue(e.target.value);
            if (onValueChange) {
              onValueChange(e.target.value);
            }
          }}
        />
      )}
      <div
        className={classNames('label', {
          title: focus || contentValue,
        })}
      >
        {label}
      </div>
    </StyledTextField>
  );
}

const FieldString = ({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldString;
  value: string;
  onValueChange?: (value: any) => void;
}) => {
  const textDomRef = useRef<any>(null);
  const { currentLang, schemaConfig } = useContext(Context);
  const [errorText, setErrorText] = useState<string | null>(null);
  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
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

  useEffect(() => {
    if (textDomRef.current) {
      let dom = textDomRef.current.querySelector('input');
      if (!dom) {
        dom = textDomRef.current.querySelector('textarea');
      }
      dom.value =
        schemaConfig.i18n.length > 0 && schema.config.needI18n
          ? value
            ? value[currentLang]
            : ''
          : value || '';
    }
  }, [currentLang]);
  return (
    <>
      {schema.config.type === 'multiline' && (
        <TextField
          defaultValue={
            schemaConfig.i18n.length > 0 && schema.config.needI18n
              ? value
                ? value[currentLang]
                : ''
              : value || ''
          }
          ref={textDomRef}
          style={{ width: '100%' }}
          label={label}
          size="small"
          rows={schema.config.rows}
          error={!!errorText}
          multiline
          required={schema.config.required}
          helperText={errorText}
          onChange={onTextChange}
        />
      )}
      {schema.config.type === 'singleline' && (
        <TextField
          size="small"
          ref={textDomRef}
          defaultValue={
            schemaConfig.i18n.length > 0 && schema.config.needI18n
              ? value
                ? value[currentLang]
                : ''
              : value || ''
          }
          style={{ width: '100%' }}
          label={label}
          required={schema.config.required}
          error={!!errorText}
          helperText={errorText || schema.config.helperText}
          onChange={onTextChange}
        />
      )}
    </>
  );
};

export default MyTextField;
