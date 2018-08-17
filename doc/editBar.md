# EditBar：
一个可配置的编辑栏组件。具体外观请参考UI效果图。

![editBar-1.png](../UIDesign/components/1.bars/editBar-1.png)

![editBar-2.png](../UIDesign/components/1.bars/editBar-2.png)

## 方法：
### 构造函数：function(container, title, highlight, buttons)
（若采用Vue实现，构造参数通过props传递）

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象（若采用Vue实现，则无此参数）。
* title - String，可选，标题文本。
* highlight - String, 可选，高亮标记，可以是图标路径或区域样式，根据内容格式自动判断。
* buttons - [Object]，按钮样式，数组中的每个对象结构如下：

```javascript
{
    styleOrClass: String,   // 按钮样式。
    onclick: function(      // 点击事件响应函数。
        btnIdx                  // 按钮编号。
    ) {...}
}
```
