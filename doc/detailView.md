# DetailView：
一个可配置的详情显示组件。该组件接收一个数据对象，例如：
```javascript
{
    name: "aaaa",
    admin: "bbbb",
    location: "cccc",
    address: "dddd"
}
```
并显示输入数据中的部分属性（例如，只显示'name'和'address'）。具体外观请参考UI效果图。

![detailView-1.png](../UIDesign/components/2.detailView/detailView-1.png)

![detailView-2.png](../UIDesign/components/2.detailView/detailView-2.png)

![detailView-3.png](../UIDesign/components/2.detailView/detailView-3.png)

## 方法：
### 构造函数：function(appearances)
（若采用Vue实现，构造参数通过props传递）

* appearances - [Object]，预定义外观，数组中的每个对象结构如下：

```javascript
{
    name: String,               // 外观名称，用于获取该外观。
    styleOrClass: String,       // 整体样式，根据参数是否为style格式（包含':'或';'字符）自动判断是style还是class。
    labelStyleOrClass: String,  // 可选，标签区域样式，如果不包含标签区域，可以为空（undefined||null||""）。
    valueAppearance: {          // 内容区域外观。
        styleOrClass: String,       // 内容区域样式。
        bind: String,               // 可选，输入数据绑定的DOM-property或DOM-attribute（加前缀'@'），默认为"textContent"。
        tagName: String,            // 可选，内容区域的标签，默认为"span"。
        propOrAttr: Object,         // 可选，如果指定了tagName参数，则可以通过该参数设置标签属性，例如：
                                    // {
                                    //      'id': "xxxx",                   // 设置DOM-property
                                    //      '@id': "xxxx",                  // 设置DOM-attribute
                                    //      'onclick': function () {...},   // 通过DOM-property设置事件回调
                                    // }
        format: String/function(    // 可选，对输入数据进行格式化的回调函数，如果为String类型，则依赖于实现提供的内置格式化函数。
            dataObj,                    // 需要被格式化的数据。
            propName                    // 需要被格式化的数据property名称。
        ) {...},
        deformat: function(         // 可选，从内容区域提取内容的函数，缺省时，取domVal.textContent。
            domVal                      // 内容区域的DOM-Element。
        ) {...}
    }
}
```

### Render：function(container, filters, dataObj)
数据渲染方法，无返回值。若重复调用此函数，则重新渲染整个区域（若采用Vue实现，参数可以通过props传递）。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象（若采用Vue实现，则无此参数）。
* filters - [Object]，数据过滤器，数组中的每个对象结构如下：

```javascript
{
    propName: String,       // 需要被渲染的输入数据property名称，可以是某个下级子对象的property名称（即"xxx.yyy"）。
    appearance: String,     // 外观名称。
    label: String,          // 可选，标签内容。
    display: String,        // 可选，渲染出的DOM-ELemenent的style.display属性。
    uneditable: Boolean,    // 可选，指示propName指定的property是否允许编辑，默认为false。
    injectable: Boolean     // 可选，默认为false。当propName指定的property名称在dataObj中不存在时，如果该参数为true，会自动向dataObj中
                            //      注入propName指定的property（值为""）；如果为false，则忽略并继续渲染其它数据。
}
```

* dataObj - Object/[Object], 需要被渲染的输入数据。

#### 核心处理过程：
1. 遍历filters参数，并获取构造函数定义的appearance属性：

    ```
    for each f in filters
        appArgs = this.appearances[f.appearance]
    ```

2. 通过appearance构造HTML：

    ```
        outHTML = <div style/class="{{appArgs.styleOrClass}}" />
        outHTML.label = <span style/class="{{appArgs.labelStyleOrClass}}">{{f.label}}</span>
        outHTML.value = <{{appArgs.valueAppearance.tagName}} style/class="{{appArgs.valueAppearance.styleOrClass}}" />
        outHTML.value.setPropOrAttr(appArgs.valueAppearance.propOrAttr)
    ```

3. 将dataObj的值绑定到目标区域：

    ```
        outHTML.value.setPropOrAttr( appArgs.valueAppearance.bind, dataObj.getProperty(f.propName) )
    ```

4. 在以上过程中同步处理f.display，f.uneditable，f.injectable，appArgs.format，appArgs.deformat的语义

5. 保存绑定关系以便提取数据时使用：

    ```
        outHTML.value.boundProp = f.propName + ':' + appArgs.valueAppearance.bind
    ```

### Extract：function(container, propNames)
提取container中的下级DOM-ELemenent的某个属性值，并以Object/[Object]类型返回。

**注意** 调用本函数前必须至少调用过一次Render函数。

* container - String/DOM-Element，提取的目标容器，可以是id或DOM-Element对象。
* propNames - [String]，可选，绑定的输入数据property名称。

#### 核心处理过程：
1. 遍历container的下级节点：

    ```
    for each node in container
    ```

2. 判断下级节点是否包含boundProp属性：

    ```
        if (node.boundProp)
            boundPair = node.boundProp.split(':');
    ```

3. 将绑定的属性值注入返回数据中：

    ```
        if (boundPair && (propNames==null || boundPair[0] in propNames))
            outData.setProperty( boundPair[0], node.getPropOrAttr(boundPair[1]) )
    ```
