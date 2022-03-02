# General Data Manager

[English](../README.md) | [中文](./README_zh.md)

General Data Manager 目的是让配置数据管理可视化，能够根据数据格式自定义定制对应的编辑面板。支持 json 数据的可视化。

目前只支持 windows 平台。



## 示例

### 简易数据配置

配置项：

```json
{
  "i18n": [],
  "schema": {
    "type": "object",
    "fields": {
      "id": {
        "name": "id",
        "config": {
          "colSpan": 3,
          "defaultValue": "",
          "type": "singleline"
        },
        "type": "string"
      },
      "name": {
        "name": "name",
        "config": {
          "colSpan": 3,
          "defaultValue": "",
          "type": "singleline"
        },
        "type": "string"
      },
      "desc": {
        "name": "desc",
        "config": {
          "colSpan": 6,
          "defaultValue": "",
          "type": "multiline"
        },
        "type": "string"
      },
      "price": {
        "name": "price",
        "config": {
          "colSpan": 3,
          "defaultValue": 0,
          "type": "float"
        },
        "type": "number"
      },
      "type": {
        "name": "type",
        "config": {
          "colSpan": 3,
          "options": [
            {
              "name": "sword",
              "value": "sword"
            },
            {
              "name": "spear",
              "value": "spear"
            }
          ],
          "defaultValue": ""
        },
        "type": "select"
      },
      "tags": {
        "name": "tags",
        "config": {
          "colSpan": 6,
          "initialExpand": true
        },
        "type": "array",
        "fieldSchema": {
          "type": "string",
          "config": {
            "colSpan": 12,
            "defaultValue": "",
            "type": "singleline"
          }
        }
      }
    },
    "config": {
      "colSpan": 12,
      "enableWhen": null,
      "initialExpand": true,
      "summary": "#{{___index}}"
    }
  }
}
```



效果：

![image-20220301155635709](../screenshots/example_weapon.png)

输出数据示例：

```json
[
  {
    "id": "iron_sword",
    "name": "铁剑",
    "desc": "一把平平无奇怪的铁剑.",
    "type": "sword",
    "tags": [
      "金属",
      "锐利"
    ],
    "price": 1200
  }
]
```



### 物品列表配置

配置项：

```json
{
  "i18n": [
    "zh",
    "en"
  ],
  "schema": {
    "type": "object",
    "fields": {
      "id": {
        "name": "id",
        "config": {
          "colSpan": 3,
          "defaultValue": "",
          "type": "singleline",
          "needI18n": false
        },
        "type": "string"
      },
      "name": {
        "name": "name",
        "config": {
          "colSpan": 3,
          "defaultValue": "",
          "type": "singleline",
          "needI18n": true
        },
        "type": "string"
      },
      "desc": {
        "name": "desc",
        "config": {
          "colSpan": 6,
          "defaultValue": "",
          "type": "multiline",
          "needI18n": true
        },
        "type": "string"
      },
      "pic": {
        "name": "pic",
        "config": {
          "colSpan": 12,
          "defaultValue": "",
          "type": "singleline",
          "needI18n": false
        },
        "type": "string"
      },
      "extra_desc": {
        "name": "extra_desc",
        "config": {
          "colSpan": 12,
          "defaultValue": "",
          "type": "multiline",
          "needI18n": true
        },
        "type": "string"
      },
      "data": {
        "name": "data",
        "config": {
          "colSpan": 12,
          "initialExpand": true
        },
        "type": "object",
        "fields": {
          "food": {
            "name": "food",
            "config": {
              "colSpan": 3,
              "defaultValue": 0
            },
            "type": "number"
          }
        }
      }
    },
    "config": {
      "colSpan": 12,
      "initialExpand": true,
      "summary": "#{{___index}}--{{id}} {{name}}"
    }
  }
}
```



效果：

![image-20220301152952560](../screenshots/exmaple_item.png)

输出数据示例：

```json
[
  {
    "id": "normal_bag",
    "name": {
      "zh": "登山包",
      "en": "Bag"
    },
    "desc": {
      "zh": "标准的登山包,能够承载一定量的食物."
    },
    "extra_desc": {
      "zh": "初始食物[color={good_effect}]+2天[/color]"
    },
    "pic": "res://climb_mountain/assets/items/normal_bag.png",
    "data": {
      "food": 2
    }
  },
  {
    "id": "big_bag",
    "name": {
      "zh": "大登山包"
    },
    "desc": {
      "zh": "比标准大小大一圈的背包,能够承载大量的食物."
    },
    "extra_desc": {
      "zh": "初始食物[color={good_effect}]+4天[/color]"
    },
    "pic": "res://climb_mountain/assets/items/normal_bag.png",
    "data": {
      "food": 4
    }
  },
  {
    "id": "heavy_bag",
    "name": {
      "zh": "重型登山包"
    },
    "desc": {
      "zh": "超级大型的背包,能够承载巨量的食物,不过非常累赘"
    },
    "extra_desc": {
      "zh": "初始食物[color={good_effect}]+7天[/color]\\n最大精力[color={bad_effect}]-2[/color]"
    },
    "pic": "res://climb_mountain/assets/items/normal_bag.png",
    "data": {
      "food": 7
    }
  }
]
```



### 复杂的事件配置

配置项：

```json
{
  "i18n": [
    "zh",
    "en"
  ],
  "schema": {
    "type": "object",
    "fields": {
      "id": {
        "name": "id",
        "config": {
          "colSpan": 3,
          "defaultValue": "",
          "type": "singleline",
          "needI18n": false
        },
        "type": "string"
      },
      "name": {
        "name": "name",
        "config": {
          "colSpan": 3,
          "defaultValue": "",
          "type": "singleline",
          "needI18n": true
        },
        "type": "string"
      },
      "desc": {
        "name": "desc",
        "config": {
          "colSpan": 6,
          "defaultValue": "",
          "type": "multiline",
          "needI18n": true
        },
        "type": "string"
      },
      "pic": {
        "name": "pic",
        "config": {
          "colSpan": 12,
          "defaultValue": "",
          "type": "singleline",
          "needI18n": false
        },
        "type": "string"
      },
      "trigger_when": {
        "name": "trigger_when",
        "config": {
          "colSpan": 12,
          "defaultValue": "",
          "type": "multiline",
          "needI18n": false
        },
        "type": "string"
      },
      "options": {
        "name": "options",
        "config": {
          "colSpan": 12,
          "initialExpand": true
        },
        "type": "array",
        "fieldSchema": {
          "type": "object",
          "fields": {
            "id": {
              "name": "id",
              "config": {
                "colSpan": 3,
                "defaultValue": "",
                "type": "singleline",
                "needI18n": false
              },
              "type": "string"
            },
            "name": {
              "name": "name",
              "config": {
                "colSpan": 3,
                "defaultValue": "",
                "type": "singleline",
                "needI18n": true
              },
              "type": "string"
            },
            "type": {
              "name": "type",
              "config": {
                "colSpan": 3,
                "options": [
                  "plain",
                  "success_fail"
                ],
                "defaultValue": "plain"
              },
              "type": "select"
            },
            "success_rate": {
              "name": "success_rate",
              "config": {
                "colSpan": 3,
                "enableWhen": "(v) => v.type === 'success_fail'",
                "defaultValue": 0
              },
              "type": "number"
            },
            "success": {
              "name": "success",
              "config": {
                "colSpan": 12,
                "initialExpand": true,
                "enableWhen": "(v) => v.type === 'success_fail'"
              },
              "type": "object",
              "fields": {
                "desc": {
                  "name": "desc",
                  "config": {
                    "colSpan": 6,
                    "defaultValue": "",
                    "type": "multiline",
                    "needI18n": true
                  },
                  "type": "string"
                },
                "process": {
                  "name": "process",
                  "config": {
                    "colSpan": 6,
                    "defaultValue": "",
                    "type": "multiline",
                    "needI18n": false
                  },
                  "type": "string"
                }
              }
            },
            "fail": {
              "name": "fail",
              "config": {
                "colSpan": 12,
                "initialExpand": true,
                "enableWhen": "(v) => v.type === 'success_fail'"
              },
              "type": "object",
              "fields": {
                "desc": {
                  "name": "desc",
                  "config": {
                    "colSpan": 6,
                    "defaultValue": "",
                    "type": "multiline",
                    "needI18n": true
                  },
                  "type": "string"
                },
                "process": {
                  "name": "process",
                  "config": {
                    "colSpan": 6,
                    "defaultValue": "",
                    "type": "multiline",
                    "needI18n": false
                  },
                  "type": "string"
                }
              }
            },
            "plain": {
              "name": "plain",
              "config": {
                "colSpan": 12,
                "initialExpand": true,
                "enableWhen": "(v) => v.type === 'plain'"
              },
              "type": "object",
              "fields": {
                "desc": {
                  "name": "desc",
                  "config": {
                    "colSpan": 6,
                    "defaultValue": "",
                    "type": "multiline",
                    "needI18n": true
                  },
                  "type": "string"
                },
                "process": {
                  "name": "process",
                  "config": {
                    "colSpan": 6,
                    "defaultValue": "",
                    "type": "multiline",
                    "needI18n": false
                  },
                  "type": "string"
                }
              }
            }
          },
          "config": {
            "colSpan": 12,
            "initialExpand": false
          }
        }
      }
    },
    "config": {
      "colSpan": 12,
      "enableWhen": null,
      "initialExpand": false,
      "summary": "#{{_index}}--{{id}} {{name}}"
    }
  }
}
```



效果：

![image-20220301154140204](../screenshots/example_event.png)

输出数据示例：

```json
[
  {
    "id": "animal_attack",
    "name": {
      "zh": "动物袭击!",
      "en": ""
    },
    "options": [
      {
        "id": "attack",
        "type": "success_fail",
        "success_rate": 0.8,
        "success": {
          "desc": {
            "zh": "你举起火把挥赶狼,狼被火焰吓住了,瞬间就跑走了."
          },
          "process": ""
        },
        "fail": {
          "desc": {
            "zh": "你举起火把挥赶狼,但是狼没有被火焰吓住,它凶狠地扑向你的食物,你没能斗过它,它叼着你的食物跑掉了."
          },
          "process": "process_properties_change({\"property_change_food\": -2})"
        },
        "plain": {
          "desc": "",
          "process": ""
        },
        "name": {
          "zh": "攻击!",
          "en": ""
        }
      },
      {
        "id": "stay",
        "type": "success_fail",
        "success_rate": 0.5,
        "success": {
          "desc": {
            "zh": "你对着狼大吼,狼好像被你的声音吓到,瞬间就跑走了."
          },
          "process": ""
        },
        "fail": {
          "desc": {
            "zh": "你对着狼大吼,但是狼突然扑了过来,你没能斗过它,它叼着你的食物跑掉了."
          },
          "process": "process_properties_change({\"property_change_food\": -2})"
        },
        "plain": {
          "desc": "",
          "process": ""
        },
        "name": {
          "zh": "大吼!",
          "en": ""
        }
      },
      {
        "id": "flee",
        "type": "plain",
        "success_rate": 0,
        "success": {
          "desc": "",
          "process": ""
        },
        "fail": {
          "desc": "",
          "process": ""
        },
        "plain": {
          "desc": {
            "zh": "你拿起装备赶紧往山下方向逃跑,跑了一段时间后你甩开了狼."
          },
          "process": "process_properties_change({\"property_change_height\": -500 })"
        },
        "name": {
          "zh": "逃跑!",
          "en": ""
        }
      }
    ],
    "trigger_when": "state.current_food >= 2 and get_last_behaviour().id in [\"sleep\", \"rest\"]",
    "pic": "res://climb_mountain/event/assets/events/animal_attack.png",
    "desc": {
      "zh": "你发现一只狼出现在你的面前,它盯着你的食物,那样子让你不寒而栗.你要怎么办?",
      "en": ""
    }
  },
  {
    "id": "rain",
    "name": {
      "zh": "下雨",
      "en": ""
    },
    "options": [
      {
        "id": "ok",
        "name": {
          "zh": "知道了"
        },
        "type": "plain",
        "success_rate": 0,
        "success": {
          "desc": "",
          "process": ""
        },
        "fail": {
          "desc": "",
          "process": ""
        },
        "plain": {
          "desc": {
            "zh": ""
          },
          "process": "add_buffer(\"rain\", 5)"
        }
      }
    ],
    "trigger_when": "get_last_behaviour().id in [\"sleep\"]",
    "pic": "res://climb_mountain/event/assets/events/rain.png",
    "desc": {
      "zh": "你一觉醒来,发现天突然下起的雨,虽然能够冒雨前行,不过会对后续的行动造成影响.\n[color={property_hint}]接下来会出现[color={bad_effect}]下雨[/color]效果[/color]",
      "en": ""
    }
  },
  {
    "id": "wet",
    "name": {
      "zh": "潮湿"
    },
    "desc": {
      "zh": "在雨中前进,你感觉身上都湿透了.\n[color={property_hint}]获得[color={bad_effect}]潮湿[/color]效果[/color]"
    },
    "pic": "",
    "trigger_when": "state.buffers.has(\"rain\") and get_last_behaviour().type == \"route_walk\"",
    "options": [
      {
        "id": "ok",
        "name": {
          "zh": "好吧"
        },
        "type": "plain",
        "success_rate": 0,
        "success": {
          "desc": "",
          "process": ""
        },
        "fail": {
          "desc": "",
          "process": ""
        },
        "plain": {
          "desc": {
            "zh": "",
            "en": ""
          },
          "process": "remove_buffer(\"rain\");add_buffer(\"wet\", 5)"
        }
      }
    ]
  },
  {
    "id": "unhelath",
    "name": {
      "zh": "身体不适"
    },
    "desc": {
      "zh": "早上起来,你感觉身体状态不妙,估计是因为身上的潮湿,让你得了感冒.\n[color={property_hint}]接下来[color={plain}]前进[/color]消耗[color={plain}]精力[/color][color={bad_effect}]+100%[/color][/color]"
    },
    "pic": "",
    "trigger_when": "state.buffers.has(\"wet\") and get_last_behaviour().id == \"sleep\"",
    "options": [
      {
        "id": "ok",
        "name": {
          "zh": "该死!"
        },
        "type": "plain",
        "success_rate": 0,
        "success": {
          "desc": "",
          "process": ""
        },
        "fail": {
          "desc": "",
          "process": ""
        },
        "plain": {
          "desc": {
            "zh": "",
            "en": ""
          },
          "process": "remove_buffer(\"wet\");add_buffer(\"unhelath\", 1)"
        }
      }
    ]
  }
]
```



## 功能点

- 可视化配置数据
- 动态修改结构方便，根据配置信息格式化数据
- 支持字段的自定义校验
- 支持字段的多级嵌套
- 支持数据的多语言化



## 配置项文档



字段的配置项在 `fields` 里面开始配置，`fields` 中的 key 值为字段的 key 值，field 中子项的配置项如下：

| 配置项 | 功能                                                         | 是否必填 |
| ------ | ------------------------------------------------------------ | -------- |
| type   | 定义字段的类型，`string`，`object`，`number`、`array`、`select` | 是       |
| config | 对应类型的细分配置信息                                       | 否       |
| name   | 字段在界面上展示的名字                                       | 否       |



如果类型为 `object`，配置项需要新加一个配置项 `fields`，用来描述对应 `object` 拥有哪些字段，示例：

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



如果类型为 `array`，配置项需要新加一个配置项 `fieldSchema`，用来描述对应 `array` 子项的数据结构，示例：

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



国际化的配置需要在最上层的 i18n 数组中添加对应语言的 key，数据为空默认是没有国际化。示例：

```text
"i18n": ["zh","en"] // 表示需要 zh、en 这两个语言
```



### 数据类型配置信息

所有类型的通用配置：

| 配置项       | 功能                                  | 默认值                                                       |
| ------------ | ------------------------------------- | ------------------------------------------------------------ |
| colSpan      | 该项数据在卡片中的宽度占比(总宽度 12) | 类型为 object、array 是 12，string、number 是 3              |
| defaultValue | 该项数据的默认值                      | 对应类型的默认值                                             |
| enableWhen   | 该项数据根据条件确定是否存在，js 函数 | 无，示例："enableWhen": "(obj) => obj.name === 'good'"，其中 obj 为当前字段所在的对象 |



object:

| 配置项        | 功能                                                         | 默认值                                                 |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| summary       | 卡片标题内容，可支持数据格式化，通过 {{your_property}} 来引用属性值 | "{{___key}}"，\_\_\_key 为特殊标记，表示当前的字段名称 |
| initialExpand | 是否默认展开数据                                             | true                                                   |



array:

| 配置项        | 功能                                                         | 默认值                                                       |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| summary       | 子项卡片标题内容，可支持数据格式化，通过 {{your_property}} 来引用属性值 | "{{___index}}"，\_\_\_index 为特殊标记，表示当前子项的序列号 |
| initialExpand | 是否默认展开数据                                             | false                                                        |



string:

| 配置项                  | 功能                                                     | 默认值                                                       |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| type                    | 文本类型,"singleline" 为单行编辑，"multiline" 为多行编辑 | "singleline"                                                 |
| required                | 是否必须                                                 | true                                                         |
| customValidate          | 自定义的校验函数，js 函数                                | 无，示例："enableWhen": "(v) => v.includes('test')"，其中 v 为当前的输入值 |
| customValidateErrorText | 自定义校验失败时的错误提示文本                           | ""                                                           |
| helperText              | 提示文本                                                 | ""                                                           |
| minLen                  | 可输入文本最小长度                                       | 1                                                            |
| maxLen                  | 可输入文本最大长度                                       | 无限                                                         |
| rows                    | 文本框的行高，type=multiline 时才生效                    | 4                                                            |
| needI18n                | 是否需要国际化                                           | false                                                        |



number:

| 配置项                  | 功能                                           | 默认值                                                       |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| type                    | 数值类型,"int" 为整数，"float" 为浮点数        | "float"                                                      |
| required                | 是否必须                                       | true                                                         |
| customValidate          | 自定义的校验函数，js 函数                      | 无，示例："enableWhen": "(v) => v > 1000"，其中 v 为当前的输入值 |
| customValidateErrorText | 自定义校验失败时的错误提示文本                 | ""                                                           |
| helperText              | 提示文本                                       | ""                                                           |
| min                     | 可输入的最小值                                 | 无限                                                         |
| max                     | 可输入的最小值                                 | 无限                                                         |
| prefix                  | 数值前缀，只会显示在界面上，不影响实际数据输出 | ""                                                           |
| suffix                  | 数值后缀，只会显示在界面上，不影响实际数据输出 | ""                                                           |



select:

| 配置项  | 功能                                                      | 默认值 |
| ------- | --------------------------------------------------------- | ------ |
| options | 选项列表，数组格式为 [{ "name": "Test", "value": "test"}] | []     |



## 如何编译运行

```shell
npm install
npm run start
```



## 后续开发计划

- [ ] 支持图片的展示
- [ ] 支持自定义过滤条件
- [ ] 支持数据分组
- [ ] 支持数据类型的继承和引用
- [ ] 基于项目级别的数据管理
