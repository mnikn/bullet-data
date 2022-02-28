import { TextField } from '@mui/material';
import { SchemaFieldNumber } from 'models/schema';
import { useEffect, useState } from 'react';

const FieldNumber = ({
  label,
  value,
  schema,
  onValueChange,
}: {
  label?: string;
  value: number;
  schema: SchemaFieldNumber;
  onValueChange?: (value: any) => void;
}) => {
  const [errorText, setErrorText] = useState<string | null>(null);
  const [valueText, setValueText] = useState<string>('');

  useEffect(() => {
    setValueText(schema.config.prefix + String(value) + schema.config.suffix);
  }, [value]);

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let textValue = 
      e.target.value
        .replace(schema.config.suffix, '')
        .replace(schema.config.prefix, '');
    if (!textValue.match(/[0-9\.]?/)) {
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
      const fn = eval(schema.config.customValidate);
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
    <TextField
      style={{ width: '100%' }}
      size="small"
      InputProps={{
        inputProps: {
          max: schema.config.max,
          min: schema.config.min,
          schema: schema,
        },
      }}
      required={schema.config.required}
      error={!!errorText}
      helperText={errorText || schema.config.helperText}
      label={label}
      value={valueText}
      onChange={onTextChange}
    />
  );
};

export default FieldNumber;
