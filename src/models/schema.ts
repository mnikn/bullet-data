import { uniq } from 'lodash';
import { generateUUID } from 'utils/uuid';

export function findChildSchema(
  schema: SchemaField | null,
  prop: string
): SchemaField | null {
  if (schema instanceof SchemaFieldObject) {
    const propArr = prop.split('.');

    const directChild = schema.fields.find((f) => {
      return f.id === propArr[0];
    });
    if (directChild) {
      return findChildSchema(directChild.data, prop);
    } else {
      return null;
    }
  } else if (schema instanceof SchemaFieldArray) {
    return schema.fieldSchema;
  } else {
    return schema;
  }
}

export function iterSchema(
  schema: SchemaField | null,
  fn: (item: SchemaField, path: string) => void,
  path = ''
) {
  if (!schema) {
    return;
  }
  fn(schema, path);
  if (schema instanceof SchemaFieldObject) {
    schema.fields.forEach((f) => {
      iterSchema(f.data, fn, f.name);
    });
  }
}

export function validateValue(
  totalObjValue: any,
  value: any,
  schema: SchemaField,
  schemaConfig: any,
  translations: any
): any {
  if (schema.config.enableWhen) {
    const fn = eval(schema.config.enableWhen);
    if (!fn(totalObjValue)) {
      return undefined;
      // return schema.config.defaultValue;
    }
  }
  if (schema.type === SchemaFieldType.Array) {
    if (Array.isArray(value)) {
      return value.map((item) => {
        return validateValue(
          item,
          item,
          (schema as SchemaFieldArray).fieldSchema,
          schemaConfig,
          translations
        );
      });
    } else {
      return schema.config.defaultValue;
    }
  }
  if (schema.type === SchemaFieldType.Object) {
    if (typeof value === 'object' && value !== null) {
      const objFields = (schema as SchemaFieldObject).fields.map((t) => t.id);
      const r1 = Object.keys(value).reduce((res2: any, key) => {
        if (objFields.includes(key)) {
          res2[key] = validateValue(
            value,
            value[key],
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data,
            schemaConfig,
            translations
          );
        }
        return res2;
      }, {});
      const r2 = objFields.reduce((res: any, key) => {
        if (!Object.keys(value).includes(key)) {
          res[key] = validateValue(
            value,
            null,
            (schema as SchemaFieldObject).fields.find((f) => f.id === key)
              ?.data,
            schemaConfig,
            translations
          );
        }
        return res;
      }, {});
      return { ...r1, ...r2 };
    } else {
      return (schema as SchemaFieldObject).configDefaultValue;
    }
  }

  if (schema.type === SchemaFieldType.String) {
    // if (schema.config.needI18n) {
    //   if (typeof value === 'object' && value !== null) {
    //     return value;
    //   } else {
    //     return schemaConfig.i18n.reduce((res, item) => {
    //       return { ...res, [item]: schema.config.defaultValue };
    //     }, '');
    //   }
    // }
    if (schema.config.needI18n) {
      if (!value || typeof value !== 'string') {
        return generateUUID();
      }
      if (!translations[value]) {
        return generateUUID();
      }
      return value;
    }

    if (schema.config.type === 'code') {
      if (!!schema.config.template && value && value === 'object') {
        value = { value: null, fields: {}, ...value };
        const fields =
          uniq(
            (schema.config.template || '')
              .match(/(\{{2}\w*\}{2})/g)
              ?.map((item2) => item2.substring(2, item2.length - 2)) || []
          ) || [];

        value.fields = fields.reduce((res: any, k) => {
          res[k] = value.fields[k] || null;
          return res;
        }, {});
        let finalValue = schema.config.template;
        fields.forEach((f) => {
          finalValue = finalValue.replaceAll(`{{${f}}}`, value.fields[f]);
        });
        return { value: finalValue, fields: value.fields };
      }
      if (typeof value !== 'object' || !value) {
        return { value: null, fields: {} };
      } else {
        return value;
      }
    }
    if (typeof value === 'string') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Number) {
    if (typeof value === 'number') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Boolean) {
    if (typeof value === 'boolean') {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.Select) {
    if (value !== null && value !== undefined) {
      return value;
    } else {
      return schema.config.defaultValue;
    }
  }

  if (schema.type === SchemaFieldType.File) {
    if (value !== null && value !== undefined) {
      return value;
    } else {
      return null;
    }
  }

  return value;
}

export enum SchemaFieldType {
  Array = 'array',
  Object = 'object',
  Number = 'number',
  String = 'string',
  Boolean = 'boolean',
  Select = 'select',
  File = 'file',
}

export const DEFAULT_CONFIG = {
  OBJECT: {
    colSpan: 12,
    enableWhen: null,
    initialExpand: true,
    summary: '{{___key}}',
  },
  OBJECT_CONFIG_DEFAULT: {
    colSpan: 12,
    initialExpand: true,
    summary: '{{___key}}',
  },
  ARRAY: {
    colSpan: 12,
    defaultValue: [],
    enableWhen: null,
    initialExpand: false,
    summary: '# {{___index}}',
  },
  ARRAY_CONFIG_DEFAULT: {
    colSpan: 12,
    initialExpand: false,
    summary: '# {{___index}}',
  },
  STRING: {
    colSpan: 3,
    defaultValue: '',
    enableWhen: null,
    required: false,
    customValidate: null,
    customValidateErrorText: '',
    helperText: '',
    type: 'singleline', // singleline | multiline | code
    template: null, // only type=code work
    minLen: 0,
    maxLen: Number.MAX_SAFE_INTEGER,
    height: '200px',
    needI18n: false,
    codeLang: '',
  },
  STRING_CONFIG_DEFAULT: {
    colSpan: 3,
    defaultValue: '',
    type: 'singleline',
  },
  NUMBER: {
    colSpan: 3,
    enableWhen: null,
    required: false,
    customValidate: null,
    customValidateErrorText: '',
    defaultValue: 0,
    helperText: '',
    suffix: '',
    prefix: '',
    format: null,
    min: -Number.MAX_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    type: 'float', // int | float | percent
  },
  NUMBER_CONFIG_DEFAULT: {
    colSpan: 3,
    defaultValue: 0,
    type: 'float',
  },
  BOOLEAN: {
    enableWhen: null,
    colSpan: 1,
    defaultValue: false,
  },
  BOOLEAN_CONFIG_DEFAULT: {
    colSpan: 1,
    defaultValue: false,
  },
  SELECT: {
    enableWhen: null,
    colSpan: 3,
    defaultValue: null,
    required: false,
    clearable: false,
    options: [],
  },
  SELECT_CONFIG_DEFAULT: {
    colSpan: 3,
    options: [
      {
        label: 'None',
        value: 'none',
      },
    ],
    defaultValue: '',
  },
  FILE: {
    colSpan: 3,
    defaultValue: '',
    enableWhen: null,
    required: false,
    customValidate: null,
    customValidateErrorText: '',
    type: 'img', // img
  },
};

export abstract class SchemaField {
  public config: {
    colSpan: number;
    enableWhen: string | null;
    defaultValue?: any;
    [key: string]: any;
  } = {
    colSpan: 3,
    enableWhen: null,
  };

  setup(config: any) {
    this.config = { ...this.config, ...config };
  }

  abstract get type(): SchemaFieldType;

  public toJson(): any {
    return {
      type: this.type,
      config: this.config,
    };
  }
}

export class SchemaFieldArray extends SchemaField {
  public config = DEFAULT_CONFIG.ARRAY;

  public fieldSchema: SchemaField;

  constructor(fieldSchema: SchemaField) {
    super();
    this.fieldSchema = fieldSchema;
    this.fieldSchema.config.colSpan = 12;
  }
  get type(): SchemaFieldType {
    return SchemaFieldType.Array;
  }

  public toJson(): any {
    return {
      type: this.type,
      config: this.config,
      fieldSchema: this.fieldSchema.toJson(),
    };
  }
}

export class SchemaFieldObject extends SchemaField {
  public config = DEFAULT_CONFIG.OBJECT;
  public fields: { name: string; id: string; data: SchemaField }[] = [];
  get type(): SchemaFieldType {
    return SchemaFieldType.Object;
  }

  get configDefaultValue() {
    return this._getConfigDefaultValue(this);
  }

  _getConfigDefaultValue(field: SchemaField) {
    switch (field.type) {
      case SchemaFieldType.Object: {
        const defaultVal: any = {};
        (field as SchemaFieldObject).fields.forEach((f) => {
          defaultVal[f.id] = this._getConfigDefaultValue(f.data);
        });
        return defaultVal;
      }
      case SchemaFieldType.Array: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.String: {
        return field.config.needI18n
          ? generateUUID()
          : field.config.defaultValue;
      }
      case SchemaFieldType.Number: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.Boolean: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.Select: {
        return field.config.defaultValue;
      }
    }
  }

  public toJson(): any {
    return {
      type: this.type,
      config: this.config,
      fields: this.fields.reduce((res: any, f) => {
        res[f.id] = {
          name: f.name,
          ...f.data.toJson(),
        };
        return res;
      }, {}),
    };
  }
}

export class SchemaFieldNumber extends SchemaField {
  public config = DEFAULT_CONFIG.NUMBER;
  get type(): SchemaFieldType {
    return SchemaFieldType.Number;
  }
}

export class SchemaFieldString extends SchemaField {
  public config = DEFAULT_CONFIG.STRING;

  get type(): SchemaFieldType {
    return SchemaFieldType.String;
  }
}

export class SchemaFieldBoolean extends SchemaField {
  public config = DEFAULT_CONFIG.BOOLEAN;

  get type(): SchemaFieldType {
    return SchemaFieldType.Boolean;
  }
}

export class SchemaFieldFile extends SchemaField {
  public config = DEFAULT_CONFIG.FILE;

  get type(): SchemaFieldType {
    return SchemaFieldType.File;
  }
}

export class SchemaFieldSelect extends SchemaField {
  public config = DEFAULT_CONFIG.SELECT;

  get type(): SchemaFieldType {
    return SchemaFieldType.Select;
  }
}
