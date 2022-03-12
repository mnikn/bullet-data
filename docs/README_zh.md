# General Data Manager

[English](../README.md) | [中文](./README_zh.md)

General Data Manager 目的是让配置数据管理可视化，能够根据数据格式自定义定制对应的编辑面板，支持 json 数据的可视化，目前只支持 windows 平台，更多示例请看[这里](./example.md)。

![image-20220301155635709](../screenshots/example_weapon.png)
![image-20220301152952560](../screenshots/exmaple_item.png)
![image-20220301154140204](../screenshots/example_event.png)


## 功能点

- 可视化配置数据
- 动态修改结构方便，根据配置信息格式化数据
- 支持字段的自定义校验
- 支持字段的多级嵌套
- 支持数据的多语言化


## Config 文档

请看[这里](./API_zh.md)。

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
