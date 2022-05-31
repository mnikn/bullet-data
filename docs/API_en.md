
## Config Documentation
  
The configuration items of the fields are configured in `fields`. The key value in `fields` is the key value of the field. The configuration items of the sub-items in the field are as follows:
  
| field  | feature                                                      | required |
  | ------ | ------------------------------------------------------------ | -------- |
  | type   | Defines the type of the field, `string`, `object`, `number`, `array`, `select` | yes      |
  | config | Segment configuration information for the corresponding type | no       |
  | name   | The name of the field displayed on the interface             | no       |
  

  
If the field type is `object`, the configuration item needs to add a new configuration item `fields` to describe which fields the corresponding `object` has, for example:
  
```json
  {
      "type": "object",
      "fields": {
          "id": {
              "type": "string",
              "config": {
                  "colSpan": 3,
                  "type": "singleline"
              }
          },
          "name": {
              "type": "string",
              "config": {
                  "colSpan": 3,
                  "type": "singleline"
              }
          },
          "desc": {
              "type": "string",
              "config": {
                  "colSpan": 6,
                  "type": "multiline"
              }
          }
      }
  }
  ```
  

  
If the field type is `array`, a configuration item `fieldSchema` needs to be added to describe the data structure of the corresponding `array` sub-item. Example:
  
```json
  {
      "type": "array",
      "fieldSchema": {
          "type": "string",
          "config": {
              "type": "multiline"
          }
      }
  }
  ```
  

  
The internationalization configuration needs to add the key of the corresponding language in the topmost i18n array. If the data is empty, the default is no internationalization. Example:
  
```text
  "i18n": ["zh","en"] // Indicates that the two languages zh and en are required
  ```
  

  
### Data Type Configuration
  
Common configuration for all types:
  
| field        | feature                                                      | default value                                                |
  | ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | colSpan      | The proportion of the width of the data in the card (total width 12) | Type is object, array is 12, string, number is 3             |
  | defaultValue | Default value of field                                       | Default value for the field type                             |
  | enableWhen   | The data determines whether it exists according to the conditions, js function | None, example: "enableWhen": "(obj) => obj.name === 'good'", where obj is the object where the current field is located |
  
object:
  
| field         | feature                                                      | default value                                                |
  | ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | summary       | The content of the card title, which supports data formatting, and refers to the property value through {{your_property}} | "{{___key}}", \_\_\_key is a special mark, indicating the current field name |
  | initialExpand | Whether to expand data by default                            | true                                                         |
  

  
array:
  
| field         | feature                                                      | default value                                                |
  | ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | summary       | The title content of the sub-item card, which can support data formatting, and refer to the property value through {{your_property}} | "{{___index}}", \_\_\_index is a special mark, indicating the serial number of the current child |
  | initialExpand | Whether to expand data by default                            | false                                                        |
  

  
string:
  
| field                   | feature                                                      | default value                                                |
  | ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | type                    | Text type, "singleline" for single-line editing, "multiline" for multi-line editing | "singleline"                                                 |
  | required                | Is it necessary                                              | true                                                         |
  | customValidate          | Custom validation function, js function                      | None, example: "enableWhen": "(v) => v.includes('test')", where v is the current input value |
  | customValidateErrorText | Custom error text when validation fails                      | ""                                                           |
  | helperText              | prompt text                                                  | ""                                                           |
  | minLen                  | Minimum length of text that can be entered                   | 1                                                            |
  | maxLen                  | Maximum length of text that can be entered                   | unlimited                                                    |
  | rows                    | The line height of the text box, only takes effect when type=multiline | 4                                                            |
  | needI18n                | Whether internationalization is required                     | false                                                        |
  

  
number:
  
| field                   | feature                                                      | default value                                                |
  | ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | type                    | Numeric type, "int" is an integer, "float" is a floating point number | "float"                                                      |
  | required                | Is it necessary                                              | true                                                         |
  | customValidate          | Custom validation function, js function                      | None, example: "enableWhen": "(v) => v > 1000", where v is the current input value |
  | customValidateErrorText | Custom error text when validation fails                      | ""                                                           |
  | helperText              | prompt text                                                  | ""                                                           |
  | min                     | The minimum value that can be entered                        | unlimited                                                    |
  | max                     | The maximum value that can be entered                        | unlimited                                                    |
  | prefix                  | Numerical prefix, only displayed on the interface, does not affect the actual data output | ""                                                           |
  | suffix                  | Numerical suffix, only displayed on the interface, does not affect the actual data output | ""                                                           |
  

  
select:
  
| field   | feature                                                      | default value |
  | ------- | ------------------------------------------------------------ | ------------- |
  | options | List of options, array format [{ "name": "Test", "value": "test"}] | []            |
  
