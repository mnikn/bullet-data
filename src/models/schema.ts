export enum SchemaFieldType {
  Array = 'array',
  Object = 'object',
  Number = 'number',
  String = 'string',
  Boolean = 'boolean',
  File = 'file',
}

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
  public config: {
    colSpan: number;
    defaultValue: any[];
  } = {
    colSpan: 12,
    defaultValue: [],
  };

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
  public config: {
    colSpan: number;
    defaultValue: any;
  } = {
    colSpan: 12,
    defaultValue: {},
  };
  public fields: { name: string; id: string; data: SchemaField }[] = [];
  get type(): SchemaFieldType {
    return SchemaFieldType.Object;
  }
}

export class SchemaFieldNumber extends SchemaField {
  get type(): SchemaFieldType {
    return SchemaFieldType.Number;
  }
}

export class SchemaFieldString extends SchemaField {
  public config: {
    colSpan: number;
    defaultValue: string;
    type: 'multiline' | 'single-line';
    minLen: number;
    maxLen: number;
    rows: number;
  } = {
    colSpan: 3,
    defaultValue: '',
    type: 'single-line',
    minLen: 1,
    maxLen: 10,
    rows: 4,
  };

  get type(): SchemaFieldType {
    return SchemaFieldType.String;
  }
}

export class SchemaFieldBoolean extends SchemaField {
  get type(): SchemaFieldType {
    return SchemaFieldType.Boolean;
  }
}

export class SchemaFieldFile extends SchemaField {
  get type(): SchemaFieldType {
    return SchemaFieldType.File;
  }
}
