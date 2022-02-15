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
    initialExpand: true,
  },
  ARRAY: {
    colSpan: 12,
    defaultValue: [],
    initialExpand: false,
  },
  STRING: {
    colSpan: 3,
    defaultValue: '',
    type: 'singleline', // singleline | multiline
    minLen: 1,
    maxLen: 10,
    rows: 4,
  },
  NUMBER: {
    colSpan: 3,
    defaultValue: 0,
    minLen: 1,
    maxLen: 10,
  },
  BOOLEAN: {
    colSpan: 1,
    defaultValue: false,
  },
  SELECT: {
    colSpan: 3,
    defaultValue: '',
    options: [],
  },
};

export abstract class SchemaField {
  public config: {
    colSpan: number;
    defaultValue?: any;
    [key: string]: any;
  } = {
    colSpan: 3,
  };

  setup(config: any) {
    this.config = { ...this.config, ...config };
  }

  abstract get type(): SchemaFieldType;
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
        return field.config.defaultValue;
      }
      case SchemaFieldType.Number: {
        return field.config.defaultValue;
      }
      case SchemaFieldType.Boolean: {
        return field.config.defaultValue;
      }
    }
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
