# MapView：
一个基于DetailEdit和EditPanel组件，在地图背景上添加标记点并显示标记点详情的组件。具体外观请参考UI效果图。

![mapView.png](../UIDesign/components/mapView.png)

## 关于上图中的动态行为：
1. 点击地图上的任意标记点（小圆点），弹出DetailEdit组件的实例（查看模式），显示“单位详情”。
2. 点击“添加”按钮，如果有DetailEdit组件的实例应先隐藏，并改变鼠标图标，同时在EditPanel组件区域上提示用户“请在地图上单击添加位置标记”，当用户点击地图区域后，弹出DetailEdit组件的实例（编辑模式，需要将图标坐标作为隐藏参数），并且当用户点击DetailEdit组件的“保存”后，触发onAdd事件句柄函数。
3. 点击“编辑”按钮，弹出DetailEdit组件的实例（编辑模式），并且当用户点击DetailEdit组件的“保存”后，触发onMod事件句柄函数。
4. 点击“删除”按钮，提示用户“是否删除？”，如果用户选择“是”，则触发onDel事件句柄函数。

## 方法：
### 构造函数：function(deAppearances, epAppearances)
（若采用Vue实现，构造参数通过props传递）

* deAppearances - Object, DetailEdit组件外观，对象结构如下：

```javascript
{
    dvAppearances: [Object],    // DetailView组件外观，参数对象结构请参考DetailView组件构造函数。
    ebAppearances: [Object],    // EditBar组件外观，数组中的每个对象结构请参考DetailEdit组件构造函数。
    adapters: {                 // 编辑内容的适配参数。
        binders: [Object],          // 内部组件绑定参数，请参考DetailEdit::Attach方法的binders参数。
        modelName: String           // 需要被提交的数据原型名称，后台协议层模块使用。
    },
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
    }]
    styleOrClass: String        // 可选，区域整体样式。
}
```

### Attach: function(container, bgImg, addIcon)
将组件实例与容器对象绑定，无返回值（若采用Vue实现，则无需此方法）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象。
* bgImg - String，背景图片路径。
* addIcon - String，默认图标路径。

### Refresh: function(markers)
刷新标记点，无返回值。

* markers - [Object]，标记点数据，数组中每个对象结构如下：

```javascript
{
    name: String,   // 标记点名称。
    icon: String,   // 标记点图标路径。
    pos: [Number],  // 标记点位置，pos[0]代表横坐标，pos[1]代表纵坐标，单位Pixel。
}
```

## 属性/事件句柄：
### onAdd: function(modelName, dataObj)
添加数据时的回调函数，无返回值。

* modelName - String, 被添加数据对象的数据原型名称。
* dataObj - Object，被添加的数据对象。

### onDel: function(modelName, dataObj)
删除数据时的回调函数，无返回值。

* modelName - String, 被删除数据对象的数据原型名称。
* dataObj - Object/[Object]，被删除的数据对象。

### onMod: function(modelName, dataObj, curData)
修改数据时的回调函数，无返回值。

* modelName - String, 被修改数据对象的数据原型名称。
* dataObj - Object，被修改的数据对象。
* curData - Object，编辑前的原始数据。
