# AI技能——Agent Skill
## Skill的发展
2025年10月，`Anthropic`正式发布了Agent Skill
在12月，Anthropic发布了`Agent Skill的开放标准`
至此，Agent Skill成为了一个AI Agent领域的一个**正式的标准**（而不单单局限于Claude Code）

## Skill的定义
Agent Skill从本质上来讲，就是一本**关于AI Agent的说明书，使用指南**。可以供大模型随时翻阅查找。
比如你正在培训一个`智能客服的AI Agent`
那么你可以这样设计它的`Skill`

```javascript
在你回答用户问题的时候，请注意：
- 首先必须先站在用户的角度，安抚情绪
- 其次，认真分析问题给出若干种合适的解决方案
- 另外要注意，遇到不明确的问题不要随意给出承诺
```

比如你正在培训一个`智能会议总结的AI Agent`
那么你可以这样设计它的`Skill`

```javascript
在总结会议纪要的时候，请按照以下几个方面去整理思考：
- 参会人员、及其对应的职位
- 会议的主题、内容
- 会议的时间、地点
- 会议得到的结论
```

它不同于在对话中你对大模型提出的要求，也许在有限的上下文中无法做到一直记住。但是Skill会在每次对话中，自动提供给大模型去翻阅、查找并记住。

## Skill的表现
Skill在请求体中的表现本质是一个Function Calling
其中做了一些动态的拼接，将目前可用的Skill列表，动态的拼接成一个Function Calling的参数
然后传递给大模型
![Skill在请求体中的呈现](./images/skill/skill1.png)