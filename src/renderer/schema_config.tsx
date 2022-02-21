import { Modal, Box, Stack, Button } from '@mui/material';
import { DEFAULT_CONFIG } from 'models/schema';
import { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

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

const SchemaConfig = ({
  initialValue,
  close,
  onSubmit,
}: {
  initialValue: any;
  close: () => void;
  onSubmit: (value: any) => void;
}) => {
  const [config, setConfig] = useState<string>(
    JSON.stringify(initialValue, null, 2)
  );
  const [editor, setEditor] = useState<any>(null);

  const editorDidMount = (editorVal: any, monaco: any) => {
    setEditor(editorVal);

    const createDependencyProposals = (range) => {
      const fieldObj = {
        id: {
          name: 'id',
          config: {},
        },
      };
      const formatInnerField = (obj: any) => {
        const objStr = JSON.stringify(obj, null, 2);
        return objStr.substring(1, objStr.length - 1);
      };
      let snippets = [
        {
          label: 'object', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(OBJ_JSON, null, 2), // ${i:j}，其中i表示按tab切换的顺序编号，j表示默认串
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'array', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(ARR_JSON, null, 2), // ${i:j}，其中i表示按tab切换的顺序编号，j表示默认串
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'string', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(STR_JSON, null, 2), // ${i:j}，其中i表示按tab切换的顺序编号，j表示默认串
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        },
        {
          label: 'boolean', // 用户键入list2d_basic的任意前缀即可触发自动补全，选择该项即可触发添加代码片段
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'object field',
          insertText: JSON.stringify(BOOLEAN_JSON, null, 2), // ${i:j}，其中i表示按tab切换的顺序编号，j表示默认串
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
            id: { ...fieldObj.id, ...NUM_JSON },
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
            id: { ...fieldObj.id, ...STR_JSON },
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
            id: { ...fieldObj.id, ...BOOLEAN_JSON },
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
            id: { ...fieldObj.id, ...SELECT_JSON },
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
            id: { ...fieldObj.id, ...ARR_JSON },
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
            id: { ...fieldObj.id, ...OBJ_JSON },
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

  return (
    <Modal open onClose={close}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720,
          height: 620,
          bgcolor: 'background.paper',
          borderRadius: '12px',
          p: 4,
        }}
      >
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <MonacoEditor
              width="100%"
              height="100%"
              language="json"
              theme="vs-dark"
              value={config}
              onChange={(value) => {
                setConfig(value);
              }}
              editorDidMount={editorDidMount}
            />
          </Stack>
          <Stack spacing={2} direction="row">
            <Button
              sx={{ flexGrow: 1 }}
              variant="contained"
              onClick={() => {
                try {
                  onSubmit(JSON.parse(config));
                  close();
                } catch (err) {}
              }}
            >
              Confirm
            </Button>
            <Button
              sx={{ flexGrow: 1 }}
              variant="contained"
              onClick={() => {
                close();
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default SchemaConfig;
