# TableEdit：
一个基于TableView、EditPanel、PageBar和DetailEdit组件的可编辑表格组件。该组件支持对表格中的内容进行编辑，具体外观请参考UI效果图。

![tableEdit-1.png](../UIDesign/components/2.tableEdit/tableEdit-1.png)

![tableEdit-2.png](../UIDesign/components/2.tableEdit/tableEdit-2.png)

## 关于上图中的动态行为：
1. 当用户点击“添加”/“编辑”按钮时，则应弹出DetailEdit组件的实例（并绑定相应的数据对象，绑定参数为构造参数的`deAppearances.adapters.binders`），添加/修改“表格信息”，当点击DetailEdit组件的“保存”时，应触发onAdd/onMod事件句柄函数，其中modelName参数为构造函数的参数`deAppearances.adapters.modelName`
2. 当用户点击“删除”按钮时，应提示用户“是否删除？”，如果用户选择“是”，则触发onDel事件句柄函数，其中modelName参数为构造函数的参数`deAppearances.adapters.modelName`
3. 当用户点击分页栏的任意按钮时，应触发onSearch事件句柄函数，其中modelName参数为构造函数的参数`deAppearances.adapters.modelName`

## 方法：
### 构造函数：function(tvAppearances, epAppearances, pbAppearances, deAppearances)
（若采用Vue实现，构造参数通过props传递）

* tvAppearances - Object，TableView组件外观，对象结构如下：

```javascript
{
    appearances: [Object],              // TableView组件外观，参数对象结构请参考TableView组件构造函数。
    styleOrClass: String,               // 可选，区域整体样式。
    tblStyleOrClass: String,            // 可选，表格整体样式。
    chkStyleOrClass: String,            // 可选，复选框样式。
    btnStyleOrClass: String/[String]    // 可选，操作按钮样式。
}
```

* epAppearances - Object，EditPanel组件外观，对象结构如下：

```javascript
{
    btnAppearances: [{          // 按钮外观。
        styleOrClass: String,       // 按钮样式。
        text: String                // 按钮文字。
    }],
    styleOrClass: String        // 可选，区域整体样式。
}
```

* pbAppearances - Object, PageBar组件外观，参数对象结构请参考PageBar组件构造函数。
* deAppearances - Object, DetailEdit组件外观，对象结构如下：

```javascript
{
    dvAppearances: [Object],    // DetailView组件外观，参数对象结构请参考DetailView组件构造函数。
    ebAppearances: [Object],    // EditBar组件外观，数组中的每个对象结构请参考DetailEdit组件构造函数。
    styleOrClass: String,       // 可选，区域整体样式。
    adapters: {                 // 编辑内容的适配参数。
        binders: [Object],          // 内部组件绑定参数，请参考DetailEdit::Attach方法的binders参数。
        modelName: String           // 需要被提交的数据原型名称，后台协议层模块使用。
    }
}
```

### Attach: function(container, headData, showPages, pageSize, searchData)
将组件实例与容器及数据对象绑定，并渲染表头，无返回值（若采用Vue实现，则无需此方法）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象。
* headData - Object/[Object]，表头数据，如果为数组则表示多行表头，对象结构请参考TableView::RenderHead方法。
* showPages - Number，最多显示的页面链接按钮数，请参考PageBar组件构造函数的showPages参数。
* pageSize - Number, 单页最大记录条数。
* searchData - Object，可选，搜索条件，对象property的名称是搜索条件的字段名称，property的值是搜索条件的字段值。

### Refresh: function(tvAppearanceIdx, data, totalPages)
刷新表格内容，无返回值。

* tvAppearanceIdx - Number，TableView组件预定义外观的索引。
* data - [Object]，需要被渲染的输入数据。
* totalPages - Number，页面总数。

## 属性/事件句柄：
### innerTableView: Object
内部TableView组件实例。

### onSearch: function(modelName, searchData, pageSize, pageIdx)
搜索/筛选时的回调函数，无返回值。

* modelName - String, 被刷新数据对象的数据原型名称。
* searchData - Object，搜索条件，对象property的名称是搜索条件的字段名称，property的值是搜索条件的字段值。
* pageSize - Number, 单页最大记录条数。
* pageIdx - Number，切换的目标页号。

### onAdd: function(modelName, dataObj)
添加数据时的回调函数，无返回值。

* modelName - String, 被添加数据对象的数据原型名称。
* dataObj - Object，被添加的数据对象。

### onDel: function(modelName, dataObj)
删除数据时的回调函数，无返回值。

* modelName - String, 被删除数据对象的数据原型名称。
* dataObj - Object/[Object]，被删除的数据对象。

### onMod: function(modelName, dataObj, curData, multiple)
修改数据时的回调函数，无返回值。

* modelName - String, 被修改数据对象的数据原型名称。
* dataObj - Object，被修改的数据对象。
* curData - Object，编辑前的原始数据。
* multiple - Number，可选，多选编辑时数据的个数，默认为null。
