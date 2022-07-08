import { DEFAULT_CONFIG } from "models/schema";

export const DEFAULT_PROJECT_CONFIG = {
  i18n: ['en', 'zh'],
  schemas: [
    {
      your_base_schema: {
        type: 'string',
        config: DEFAULT_CONFIG.STRING_CONFIG_DEFAULT,
      },
    },
  ],
  translation_file_path: './translations.csv',
};

export const DEFAULT_SCHEMA_CONFIG = {
  i18n: [],
  filters: [],
  schema: {
    type: 'object',
    fields: {},
    config: {
      ...DEFAULT_CONFIG.OBJECT,
      initialExpand: false,
      summary: '#{{___index}}',
    },
  },
};
