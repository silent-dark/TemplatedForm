# DetailEdit：
一个基于DetailView和EditBar组件的可编辑详情组件，该组件可以在查看和编辑模式间自由切换，具体外观请参考UI效果图。

![nameCard.png](../UIDesign/components/2.detailEdit/nameCard.png)

请注意上图中右上角的“编辑”和“删除”图标，点击“编辑”后应进入编辑模式，点击“删除”后需要提示用户“是否删除？”，如果用户选择“是”，则应调用onDel事件句柄函数。

![detailEdit-1.png](../UIDesign/components/2.detailEdit/detailEdit-1.png)

请注意上图中右上角的“保存”和“取消”图标，点击“取消”后应返回查看模式，点击“保存”后应调用onSave事件句柄函数。

![detailEdit-2.png](../UIDesign/components/2.detailEdit/detailEdit-2.png)

## 方法：
### 构造函数：function(dvAppearances, ebAppearances)
（若采用Vue实现，构造参数通过props传递）

* dvAppearances - [Object]，DetailView组件外观，参数对象结构请参考DetailView组件构造函数。
* ebAppearances - [Object]，EditBar组件外观，数组中的每个对象结构如下：

```javascript
{
    styleOrClass: String,       // 整体样式，根据参数是否为style格式（包含':'或';'字符）自动判断是style还是class。
    title: String,              // 标题文本。
    highlight: String,          // 可选，高亮标记，可以是图标路径或区域样式，根据内容格式自动判断。
    btnStyleOrClasses: [String] // 按钮样式。
}
```

### Attach：function(container, binders, dataObj)
将组件实例与容器及数据对象绑定，但并不显示，无返回值（若采用Vue实现，则无需此方法）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象。
* binders - [Object]，内部组件绑定参数，binders[0]为编辑模式下的绑定参数，binders[1]为查看模式下的绑定参数，数组中的每个对象结构如下：

```javascript
{
    styleOrClass: String,   // 整体样式，根据参数是否为style格式（包含':'或';'字符）自动判断是style还是class。
    editBarIdx: Number,     // EditBar组件外观编号。
    dataFilters: [Object]   // 数据过滤器，参数对象结构请参考DetailView::Render函数的filters参数。
}
```
* dataObj - Object，需要被绑定的输入数据。

### Show：function(val, editMode)
显示/隐藏组件实例，无返回值。

* val - Boolean，控制显示/隐藏的值。
* editMode - Boolean，可选，控制是否显示编辑模式。

**注意** 调用本函数前必须至少调用过一次Attach函数。

## 属性/事件句柄：
### onSave：function(dataObj, curData) {...}
完成编辑的回调函数。返回值：

```javascript
{
    invalidDataProperty: String,    // 可选，无效的数据属性名称。
    alertText: String               // 可选，校验失败时的提示。
}
```

* dataObj - Object，编辑后需要保存的数据。
* curData - Object，可选，编辑前的原始数据。

### onDel：function(dataObj) {...}
执行删除操作的回调函数，无返回值。

* dataObj - Object，被删除的数据。
