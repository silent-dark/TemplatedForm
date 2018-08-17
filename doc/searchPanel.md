# SearchPanel组件
一个基于EditPanel组件的搜索条组件（一个专门化的EditPanel组件）。具体外观请参考UI效果图。

![searchPanel.png](../UIDesign/components/1.panels/searchPanel.png)

## 方法：
### 构造函数：function(styleOrClasses, condAppearances)
* styleOrClasses - Object，输入框区域的样式属性，对象具体结构如下：

```javascript
{
    searchPropOrAttr: String,   // 搜索框区域（不含按钮）整体外改样式
    labelPropOrAttr: String,    // 搜索图标区域外观样式
    inputPropOrAttr: String,    // 输入框外观样式
    btnPropOrAttr: String       // 搜索按钮外观样式
}
```

* condAppearances - [Object]，可选，搜索条件区域的预定义外观，参见DetailView构造函数的appearances参数。

### Render：function(container, condFilters, condData)
数据渲染方法，无返回值。若重复调用此函数，则重新渲染整个区域（若采用Vue实现，参数可以通过props传递）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象（若采用Vue实现，则无此参数）。
* condFilters - [Object]，数据过滤器，参数对象结构请参考DetailView::Render方法的filters参数。
* condData - Object，需要被渲染到DetailView区域的数据。

### doSearch: function()
执行搜索（将触发onSearch事件）。

## 属性/事件句柄：
### innerEditPanel: Object
内部EditPanel组件实例。

### onSearch: function(searchCond)
执行搜索的回调函数，无返回值。

* searchCond - Object，搜索条件，对象property的名称是搜索条件的字段名称，property的值是搜索条件的字段值（通过innerEditPanel.extract方法获取）。
