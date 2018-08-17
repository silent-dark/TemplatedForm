# OrgTree：
一个基于DetailEdit组件的组织结构图组件。具体外观请参考UI效果图。

![orgTree.png](../UIDesign/components/orgTree.png)

## 关于上图中的动态行为：
1. 当用户点击名卡下方的“+”图标时，在该名卡下方应创建新的节点及名卡（编辑模式），当用户点击名卡中的“保存”后，触发onAdd事件句柄；
2. 当用户点击名卡右上角的“编辑”图标时，名卡切换为编辑模式，当用户点击名卡中的“保存”后，触发onMod事件句柄；
3. 当用户点击名卡右上角的“删除”图标时，触发onDel事件句柄；

## 方法：
### 构造函数：function(deAppearances)
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

### Attach: function(container)
将组件实例与容器对象绑定，无返回值（若采用Vue实现，则无需此方法）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象。

### Refresh: function(contacts)
刷新组织结构图，无返回值。

* contacts - [Object]，联系人数据，数组中每个对象结构如下：

```javascript
{
    leaderChain: String,    // 联系人在组织结构树中的位置，所有上级的id组成，由'/'分隔，没有上级使用"/"表示。
}
```

#### 核心处理过程：
1. 构造一个“吕”形容器对象（2个div元素）作为根容器，布局见下图：
![OrgTreeNode.png](../doc/OrgTreeNode.png)
2. 使用对应的联系人数据构造名片卡（DetailEdit）对象，放入“吕”形容器对象的上半部分，并居中显示；
3. 如果该名片卡不是根节点，则显示连接线；
4. （从联系人数据中）统计下级节点数量，构造同样多的“吕”形容器对象；
5. 将下级容器对象放入“吕”形容器的下半部分，并平铺显示；
6. 遍历所有下级“吕”形容器对象，递归执行2~6步，直到该联系人没有下级节点；

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
