import { Box, Button, Modal, Stack } from '@mui/material';
import { DEFAULT_CONFIG } from 'models/schema';
import { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { EVENT, eventBus } from './event';
import { PRIMARY_COLOR2_LIGHT1 } from './style';

const OBJ_JSON = {
  type: 'object',
  fields: {},
  config: DEFAULT_CONFIG.OBJECT_CONFIG_DEFAULT,
};
const STR_JSON = {
  type: 'string',
  config: DEFAULT_CONFIG.STRING_CONFIG_DEFAULT,
};
const BOOLEAN_JSON = {
  type: 'boolean',
  config: DEFAULT_CONFIG.BOOLEAN_CONFIG_DEFAULT,
};
const NUM_JSON = {
  type: 'number',
  config: DEFAULT_CONFIG.NUMBER_CONFIG_DEFAULT,
};
const SELECT_JSON = {
  type: 'select',
  config: DEFAULT_CONFIG.SELECT_CONFIG_DEFAULT,
};
const ARR_JSON = {
  type: 'array',
  fieldSchema: null,
  config: DEFAULT_CONFIG.ARRAY_CONFIG_DEFAULT,
};

const SchemaConfig = ({ initialValue }: { initialValue: any }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<string>(
    JSON.stringify(initialValue, null, 2)
  );
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    if (initialValue) {
      setConfig(JSON.stringify(initialValue, null, 2));
    }
  }, [initialValue]);

  const editorDidMount = (editorVal: any, monaco: any) => {
    setEditor(editorVal);

    const createDependencyProposals = (range) => {
      const fieldObj = {
        your_field: {
          name: 'your_field',
          config: {},
        },
      };
      const formatInnerField = (obj: any) => {
        const objStr = JSON.stringify(obj, null, 2);
        return objStr.substring(1, objStr.length - 1);
      };
      let snippets = [
        {
          label: 'object',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(OBJ_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'array',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(ARR_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'string',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(STR_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'boolean',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(BOOLEAN_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'number',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(NUM_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'select',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(SELECT_JSON, null, 2),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'numberField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...NUM_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'stringField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...STR_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'booleanField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...BOOLEAN_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'selectField',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...SELECT_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'arrayField', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...ARR_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'objectField', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField({
            ...fieldObj,
            your_field: { ...fieldObj.your_field, ...OBJ_JSON },
          }),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'field', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: formatInnerField(fieldObj), // ${i:j}，其中i表示按tab切换的顺序编号，j表示默认串
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
      ];
      return snippets;
    };

    monaco.languages.registerCompletionItemProvider('json', {
      provideCompletionItems: (model, position) => {
        var word = model.getWordUntilPosition(position);
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          suggestions: createDependencyProposals(range),
        };
      },
    });
  };

  useEffect(() => {
    const show = () => {
      setVisible(true);
    };
    eventBus.on(EVENT.SHOW_FILE_SCHEMA_CONFIG, show);
    return () => {
      eventBus.off(EVENT.SHOW_FILE_SCHEMA_CONFIG, show);
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
        className="absolute bg-slate-400 p-4"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 750,
          height: 650,
          borderRadius: '0px',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full items-center">
            <div className="text-slate-900 font-bold text-2xl mb-5">
              File Schema Config
            </div>
            <MonacoEditor
              width="100%"
              height="88%"
              language="json"
              theme="vs-dark"
              value={config}
              onChange={(value) => {
                setConfig(value);
              }}
              editorDidMount={editorDidMount}
            />
          </div>
          <div className="flex h-12">
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
                  eventBus.emit(EVENT.FILE_SCHEMA_CHANGED, JSON.parse(config));
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
};

export default SchemaConfig;
