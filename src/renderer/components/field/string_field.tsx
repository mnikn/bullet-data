import { TextField } from "@mui/material";
import { SchemaFieldString } from "models/schema";
import { useContext, useEffect, useRef, useState } from "react";
import Context from '../../context';

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

export default FieldString;
