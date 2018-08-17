# DetailEditList：
一个基于DetailEdit、DetailView（实现按条件筛选）和PageBar组件的详情列表组件。

![searchView.png](../UIDesign/components/searchView.png)

**注意：因组件未设计UI原型，以上效果图使用的是SearchView组件的效果图。**

## 方法：
### 构造函数：function(deAppearances, condAppearances, pbAppearances)
（若采用Vue实现，构造参数通过props传递）

* deAppearances - Object, DetailEdit组件外观，对象结构如下：

```javascript
{
    dvAppearances: [Object],    // DetailView组件外观，参数对象结构请参考DetailView组件构造函数。
    ebAppearances: [Object],    // EditBar组件外观，数组中的每个对象结构请参考DetailEdit组件构造函数。
    adapters: [{                // 编辑内容的适配参数。
        styleOrClass: String,       // 可选，区域整体样式。
        binders: [Object],          // 内部组件绑定参数，请参考DetailEdit::Attach方法的binders参数。
        modelName: String           // 需要被提交的数据原型名称，后台协议层模块使用。
    }],
    styleOrClass: String        // 可选，区域整体样式。
}
```

* condAppearances - Object，可选，筛选条件区域的预定义外观，对象结构如下：

```javascript
{
    dvAppearances: [Object],    // DetailView组件外观，参数对象结构请参考DetailView组件构造函数。
    styleOrClass: String        // 可选，区域整体样式。
}
```

* pbAppearances - Object, PageBar组件外观，参数对象结构请参考PageBar组件构造函数。

### Attach: function(container, searchModel, showPages，pageSize, condOptions)
将组件实例与容器对象绑定，无返回值（若采用Vue实现，则无需此方法）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象。
* searchModel - 触发onSearch时需要被提交的数据原型名称，后台协议层模块使用。
* showPages - Number，可选，最多显示的页面链接按钮数，请参考PageBar组件构造函数的showPages参数。
* pageSize - Number, 可选，单页最大记录条数。
* condOptions - Object，可选，渲染筛选条件区域的选项。对象结构如下：

```javascript
{
    dvFilters: [Object],    // 数据过滤器，参数对象结构请参考DetailView::Render方法的filters参数。
    dvData: Object          // 需要被渲染到DetailView区域的数据。
}
```

### Refresh: function(listData, totalPages, condOptions)
刷新组件列表，无返回值。

* listData - [Object]，需要被渲染和编辑的输入数据。
* totalPages - Number，可选，页面总数。
* condOptions - Object，可选，渲染筛选条件区域的选项（参考Attach的condOptions参数）。

#### 核心处理过程：
1. 遍历输入数据（listData参数。）：

    ```
    for each (dataObj) in listData
    ```

2. 遍历构造函数的deAppearances.adapters参数：

    ```
        for each (adapter) in this.deAppearances.adapters
    ```

3. 遍历adapter.binders[0].dataFilters， 如果定义的propName在dataObj中不存在，则跳过第4步：

    ```
            for each (filter) in adapter.binders[0].dataFilters
                if (dataObj[filter.propName] == null) ignore step 4.
    ```

4. 使用匹配上的filter渲染dataObj：

    ```
            item = document.createElement("div")
            this.innerDetailEdit.attach(item, adapter.binders[0].dataFilters, dataObj)
    ```

## 属性/事件句柄：
### innerCondView: Object
筛选条件区域的DetailView组件实例。

### onSearch: function(modelName, searchData, pageSize, pageIdx)
搜索/筛选时的回调函数，无返回值。

* modelName - String, 被刷新数据对象的数据原型名称。
* searchData - Object，搜索条件，对象property的名称是搜索条件的字段名称，property的值是搜索条件的字段值（通过innerCondView.extract方法获取）。
* pageSize - Number, 单页最大记录条数。
* pageIdx - Number，切换的目标页号。

### onDel: function(modelName, dataObj)
删除数据时的回调函数，无返回值。

* modelName - String, 被删除数据对象的数据原型名称。
* dataObj - Object/[Object]，被删除的数据对象。

### onMod: function(modelName, dataObj, curData)
修改数据时的回调函数，无返回值。

* modelName - String, 被修改数据对象的数据原型名称。
* dataObj - Object，被修改的数据对象。
* curData - Object，编辑前的原始数据。
