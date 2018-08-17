# EditPanel
一个基于DetailView的编辑栏组件。具体外观请参考UI效果图。

![editPanel.png](../UIDesign/components/1.panels/editPanel.png)

![editPanel.png](../UIDesign/components/1.panels/searchResult.png)

## 方法：
### 构造函数：function(dvAppearances, buttons)
（若采用Vue实现，构造参数通过props传递）

* dvAppearances - [Object]，可选，DetailView组件外观，参数对象结构请参考DetailView组件构造函数，如果该参数为空（undefined||null），说明该EditPanel内只有按钮。
* buttons - [Object]，按钮样式，数组中的每个对象结构如下：

```javascript
{
    text: String,           // 按钮文本。
    styleOrClass: String,   // 按钮样式。
    onclick: function(      // 点击事件响应函数。
        btnIdx                  // 按钮编号。
    ) {...}
}
```

### Render：function(container, dvFilters, dvData)
数据渲染方法，无返回值。若重复调用此函数，则重新渲染整个区域（若采用Vue实现，参数可以通过props传递）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象（若采用Vue实现，则无此参数）。
* dvFilters - [Object]，数据过滤器，参数对象结构请参考DetailView::Render方法的filters参数。
* dvData - Object, 需要被渲染到DetailView区域的数据。

## 属性/事件句柄：
### innerDetailView: Object
内部DetailView组件实例。
