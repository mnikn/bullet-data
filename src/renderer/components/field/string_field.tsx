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
  const fields =
    uniq(
      (schema.config.template || '')
        .match(/(\{{2}\w*\}{2})/g)
        ?.map((item) => item.substring(2, item.length - 2)) || []
    ) || [];

  let finalValue = !schema.config.template
    ? contentValue.value
    : schema.config.template || '';
  if (schema.config.template) {
    fields.forEach((f) => {
      finalValue = finalValue.replaceAll(
        `{{${f}}}`,
        contentValue?.fields[f] || `{{${f}}}`
      );
    });
  }

  return (
    <div className="flex flex-grow w-full">
      <MonacoEditor
        className="flex-grow mr-2"
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
              <StringField
                label={f}
                schema={CodeFieldSchema}
                value={contentValue?.fields[f] || ''}
                onValueChange={(v) => {
                  if (onValueChange) {
                    onValueChange({
                      fields: { ...contentValue?.fields, [f]: v },
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
    </div>
  );
};

function StringField({
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
    <div className="w-full flex flex-col items-center">
      {label && (
        <div className="text-md font-bold mb-2 text-zinc-900">{label}</div>
      )}
      {schema.config.type === 'singleline' && (
        <input
          className="text-md w-full outline-none p-2 focus:outline-2 focus:outline-zinc-900 transition-all text-zinc-900"
          value={contentValue}
          onChange={onTextChange}
          style={{
            outlineOffset: 0,
          }}
        />
      )}
      {schema.config.type === 'multiline' && (
        <textarea
          className="resize-none text-md font-normal w-full outline-none p-2 focus:outline-2 focus:outline-zinc-900 transition-all text-zinc-900"
          value={contentValue}
          onChange={onTextChange}
          style={{
            height: schema.config.height,
            outlineOffset: 0,
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
      <div className="absoulte bottom-0">
        {errorText && (
          <div className="error text-rose-500 text-sm">{errorText}</div>
        )}
      </div>
    </div>
  );
}

export default StringField;
