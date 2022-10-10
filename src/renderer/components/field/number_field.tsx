import { TextField } from '@mui/material';
import classNames from 'classnames';
import { SchemaFieldNumber } from 'models/schema';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  PRIMARY_COLOR1,
  PRIMARY_COLOR2,
  PRIMARY_COLOR2_LIGHT1,
  PRIMARY_COLOR2_LIGHT2,
  SECOND_COLOR1,
} from '../../style';

const StyledInput = styled.div`
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

function NumberField({
  className,
  label,
  schema,
  value,
  onValueChange,
}: {
  className?: string;
  label?: string;
  schema: SchemaFieldNumber;
  value: number;
  onValueChange?: (value: any) => void;
}) {
  const [valueText, setValueText] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    setValueText(
      schema.config.prefix +
        (typeof value !== 'undefined' ? String(value) : '') +
        schema.config.suffix
    );
  }, [value, schema]);

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let textValue = e.target.value
      .replace(schema.config.suffix, '')
      .replace(schema.config.prefix, '');

    if (textValue === '') {
      setValueText(
        schema.config.prefix + schema.config.defaultValue + schema.config.suffix
      );
    }

    if (!/^[+-]?\d*(\.\d*)?$/.test(textValue)) {
      return;
    }

    const realValue = Number(textValue);
    setValueText(schema.config.prefix + textValue + schema.config.suffix);

    if (schema.config.required && !realValue) {
      setErrorText('Number cannot be empty');
      return;
    }
    if (realValue < schema.config.min) {
      setErrorText(`Number must more than ${schema.config.min}`);
      return;
    }
    if (realValue > schema.config.max) {
      setErrorText(`Number must less than ${schema.config.max}`);
      return;
    }
    if (schema.config.type === 'int' && !Number.isInteger(realValue)) {
      setErrorText(`Number must be integer`);
      return;
    }
    if (schema.config.customValidate) {
      /* no-warn=eval */
      const fn = eval(schema.config.customValidate || '');
      if (fn) {
        const success = fn(realValue);
        if (!success) {
          setErrorText(
            schema.config.customValidateErrorText || 'Custom validate error'
          );
          return;
        }
      }
    }
    setErrorText(null);
    if (onValueChange && !Number.isNaN(realValue)) {
      onValueChange(Number(realValue));
    }
  };
  return (
    <div className={classNames('w-full flex flex-col items-center', className)}>
      {label && <div className="text-sm font-bold mb-3">{label}</div>}
      <input
        className="text-md w-full outline-none p-2 focus:outline-2 focus:outline-zinc-900 transition-all"
        value={valueText}
        onChange={onTextChange}
        style={{
          outlineOffset: 0,
        }}
      />
      <div className="absoulte bottom-0">
        {errorText && (
          <div className="error text-rose-500 text-sm">{errorText}</div>
        )}
      </div>
    </div>
  );
}

export default NumberField;
