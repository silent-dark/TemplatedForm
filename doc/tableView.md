# TableView：
一个可配置的表格显示组件。该组件接收一个数据对象数组，例如：
```javascript
[{
    name: "aaa",
    admin: "bbb",
    location: "ccc",
    address: "ddd"
}, {
    name: "aaaa",
    admin: "bbbb",
    location: "cccc",
    address: "dddd"
}]
```
并显示输入数据中的部分属性（例如，只显示'name'和'address'）。具体外观请参考UI效果图。

![tableView-1.png](../UIDesign/components/2.tableView/tableView-1.png)

![tableView-2.png](../UIDesign/components/2.tableView/tableView-2.png)

## 方法：
### 构造函数：function(appearances, tblStyleOrClass)
（若采用Vue实现，构造参数通过props传递）

* appearances - [Object]，预定义外观，数组中的每个对象结构如下：

```javascript
{
    headAppearance: Boolean,            // 可选，是否为表头外观，默认为false。
    rowStyleOrClass: String/[String],   // 可选，行样式，根据参数是否为style格式（包含':'或';'字符）自动判断是style还是class，如果该参数为数组，
                                        //      则根据公式(row % length)匹配行样式。
    columns: [{                         // 列外观定义。
        propName: String,                   // 需要关联的输入数据property名称，可以是某个下级子对象的property名称（即"xxx.yyy"）。
        styleOrClass: String,               // 可选，列样式。
        hidable: Boolean,                   // 可选，该列是否可隐藏，默认为false。
        useHTML: Boolean,                   // 可选，关联的输入数据是否作为HTML文本处理，默认为false。
        format: String/function(            // 可选，对输入数据进行格式化的回调函数，如果为String类型，则依赖于实现提供的内置格式化函数。
            rowData,                            // 需要被格式化的数据。
            propName,                           // 需要被格式化的数据property名称。
            rowIdx                              // 需要被格式化的数据行号。
        ) {...},
        deformat: function(                 // 可选，从单元格中提取内容的函数，缺省时，取domCell.textContent。
            domCell                             // 单元格的DOM-Element。
        ),
        colSpan: Number                     // 可选，跨越的列数，仅headAppearance为true时有效，默认为1。
    }]
}
```

* tblStyleOrClass - String, 可选，表格整体样式。

### RenderHead：function(container, headData)
表头渲染方法，无返回值。若重复调用此函数，则重新渲染整个表格（若采用Vue实现，参数可以通过props传递）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象（若采用Vue实现，则无此参数）。
* headData - Object/[Object]，表头数据，如果为数组则表示多行表头，对象结构如下：

```javascript
{
    titles: Object,         // 表头内容。
    appearanceIdx: Number   // 预定义外观的索引。
}
```

#### 核心处理过程：
1. 遍历headData，并获取构造函数定义的appearance属性，并向container中添加行标签：

    ```
    for each (rowData,i) in headData
        appArgs = this.appearances[rowData.appearanceIdx]
        domRow = container.insert(<tr style/class="{{appArgs.rowStyleOrClass}}" />)
    ```

2. 遍历列外观定义，并添加表头内容：

    ```
        for each col in appArgs.columns
            domRow.insert(<th style/class="{{col.styleOrClass}}" colspan="{{col.colSpan}}">{{
                col.format(rowData, col.propName, i)
            }}</th>)
    ```

3. 在以上过程中同步处理col.hidable，col.useHTML的语义

### Append：function(container, appearanceIdx, data)
表格内容追加方法，无返回值。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象（若采用Vue实现，则无此参数）。
* appearanceIdx - Number，预定义外观的索引。
* data - [Object]，需要被渲染的输入数据。

#### 核心处理过程：
1. 获取构造函数定义的appearance属性，遍历data并向container中添加行标签：

    ```
    appArgs = this.appearances[appearanceIdx]
    for each (rowData,i) in data
        domRow = container.insert(<tr style/class="{{appArgs.rowStyleOrClass[i % appArgs.rowStyleOrClass.length]}}" />)
    ```

2. 遍历列外观定义，并添加表格内容：

    ```
        for each col in appArgs.columns
            domRow.insert(<td style/class="{{col.styleOrClass}}">{{
                col.format(rowData, col.propName, i)
            }}</td>)
    ```

3. 在以上过程中同步处理col.hidable，col.useHTML的语义

### Extract：function(container, appearanceIdx, rowFilter, propNames)
提取表格中的数据，并以[Object]类型返回。

* container - String/DOM-Element，提取的目标容器，可以是id或DOM-Element对象。
* appearanceIdx - Number，预定义外观的索引。
* rowFilter - Number/[Number]/function(rowData,rowIdx) {...}，可选，被提取数据的行号或过滤函数。
* propNames - [String]，可选，关联的输入数据property名称。

#### 核心处理过程：
1. 获取构造函数定义的appearance属性，并按行遍历表格：

    ```
    appArgs = this.appearances[appearanceIdx]
    for each (domRow,i) in container
    ```

2. 提取行数据：

    ```
        for each (domCell,j) in domRow
            col = appArgs.columns[j];
            rowData.setProperty( col.propName, col.deformat(domCell) );
    ```

3. 根据rowFilter和propNames参数返回行数据：

    ```
        if (rowFilter==null || rowFilter(rowData,i))
            if (propNames)
                rowData.keepProperties(propNames); // 丢弃不在propNames中的属性
            outData.push(rowData);
    ```

### Remove：function(container, appearanceIdx, rowFilter)
删除表格中的数据，无返回值。

* container - String/DOM-Element，删除的目标容器，可以是id或DOM-Element对象。
* appearanceIdx - Number，预定义外观的索引。
* rowFilter - Number/[Number]/function(rowData,rowIdx) {...}，可选，被删除的行号或过滤函数。

#### 核心处理过程：（参考Extract方法）

### Update：function(container, appearanceIdx, rowFilter, dataObj)
更新表格中的数据，无返回值。

* container - String/DOM-Element，更新的目标容器，可以是id或DOM-Element对象。
* appearanceIdx - Number，预定义外观的索引。
* rowFilter - Number/[Number]/function(rowData,rowIdx) {...}，可选，被更新的行号或过滤函数。
* dataObj - Object，需要更新的数据。

#### 核心处理过程：（参考Extract方法）

### Clear：function(container)
清空表格中的所有数据，无返回值。

* container - String/DOM-Element，删除的目标容器，可以是id或DOM-Element对象。
