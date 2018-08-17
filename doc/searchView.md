# SearchView：
一个基于SearchPanel、EditPanel（用于实现搜索结果的列表）、PageBar组件的带有条件搜索、数据列表和翻页的组件。具体外观请参考UI效果图。

![searchView.png](../UIDesign/components/searchView.png)

## 方法：
### 构造函数：function(spAppearances, epAppearances, pbAppearances)
（若采用Vue实现，构造参数通过props传递）

* spAppearances - Object，SearchPanel组件外观，对象结构如下：

```javascript
{
    inputPropOrAttr: Object,    // 输入框的DOM-property或DOM-attribute（加前缀'@'），参见DetailView构造函数的
                                //      appearances.valueAppearance.propOrAttr参数。
    btnPropOrAttr: Object,      // “搜索”按钮的DOM-property或DOM-attribute（加前缀'@'）。
    condAppearances: Object,    // 搜索条件区域的预定义外观，参见DetailView构造函数的appearances参数。
    styleOrClass: String        // 可选，区域整体样式。
}
```

* epAppearances - Object，EditPanel组件外观，对象结构如下：

```javascript
{
    dvAppearances: [Object],    // DetailView组件外观，参数对象结构请参考DetailView组件构造函数。
    btnAppearances: [{          // 按钮外观。
        styleOrClass: String,       // 按钮样式。
        text: String                // 按钮文字。
    }],
    adapters: [{                // 搜索结果的适配参数。
        styleOrClass: String,       // 可选，区域整体样式。
        dvFilters: [Object],        // 数据过滤器，参数对象结构请参考DetailView::Render方法的filters参数。注：dvFilters描述了输入数据对象的结构，
                                    // 如果描述的PropNames在输入数据中都存在，则说明匹配成功（即可使用该filters参数进行渲染）。
        onShowDetails: function(    // 当用户点击“详情”按钮时触发的回调函数。
            dataObj
        ) {...}
    }],
    styleOrClass: String        // 可选，区域整体样式。
}
```

* pbAppearances - Object, PageBar组件外观，参数对象结构请参考PageBar组件构造函数。

### Attach: function(container, showPages，pageSize, spOptions)
将组件实例与容器绑定，并渲染SearchPanel组件，无返回值（若采用Vue实现，则无需此方法）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象。
* showPages - Number，最多显示的页面链接按钮数，请参考PageBar组件构造函数的showPages参数。
* pageSize - Number, 单页最大记录条数。
* spOptions - Object，可选，如果为空（undefined||null），表示SearchPanel组件区域只有搜索框。对象结构如下：

```javascript
{
    dvFilters: [Object],    // SearchPanel组件内部DetailView组件的数据过滤器，参数对象结构请参考DetailView::Render方法的filters参数。
    dvData: Object,         // SearchPanel组件内部需要被渲染到DetailView区域的数据。
}
```

### Refresh :function(data, totalPages)
显示搜索内容，无返回值。

* data - [Object]，需要被渲染的输入数据。
* totalPages - Number，页面总数。

#### 核心处理过程：
1. 遍历输入数据（data参数。）：

    ```
    for each (dataObj) in data
    ```

2. 遍历构造函数的epAppearances.adapters参数：

    ```
        for each (adapter) in this.epAppearances.adapters
    ```

3. 遍历adapter.dvFilters， 如果定义的propName在dataObj中不存在，则跳过第4步：

    ```
            for each (filter) in adapter.dvFilters
                if (dataObj[filter.propName] == null) ignore step 4.
    ```

4. 使用匹配上的filter渲染dataObj，并处理adapter.onShowDetails：

    ```
            item = document.createElement("div")
            this.innerEditPanel.render(item, adapter.dvFilters, dataObj)
            item.btnDetails.onclick = function() {
                adapter.onShowDetails(dataObj)
            }
    ```

## 属性/事件句柄：
### innerSearchPanel: Object
内部SearchPanel组件实例。

### onSearch: function(searchExp, searchCond, pageSize, pageIdx)
执行搜索的回调函数，无返回值。

* searchExp - String, 搜索框输入的搜索表达式。
* searchCond - Object，搜索条件，对象property的名称是搜索条件的字段名称，property的值是搜索条件的字段值。
* pageSize - Number, 单页最大记录条数。
* pageIdx - Number，切换的目标页号。
