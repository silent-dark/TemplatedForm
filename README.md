# TemplatedForm
一个模板化UI视图层的组件库。

## TemplatedForm.Form
一个渲染或提取数据到HTML风格模板的组件。

### 属性：
* domTpl - 作为模板的DOM对象。只需要在作为模板的HTML标签中，增加一个fieldName的自定义属性，该自定义属性的写法类似style属性的格式：`fieldName1[:DOMProperty1][;fieldName2[:DOMProperty2][;...]]`，如果DOMProperty为空，则默认为value或textContent。
* domItems`[]` - 渲染后从模板复制出的DOM对象（Array）。
* onAddDomItem - 当渲染数组时，复制模板DOM对象时的回调函数function(dataObj, dataIdx)，该回调函数的this指向对应的Form对象。
* fieldNameAlias - 给模板属性fieldName设置的别名，可利用该参数在同一个模板中渲染或提取不同的数据。
* valAttrEvals - 渲染或提取数据字段时，若需要执行一个过程（而不是映射到DOM对象的某个Property），则以数据字段名称为Key，向该对象中注册一个回调函数function(attrVal)，该回调函数的this指向对应的DOM对象。

### 方法：
* 构造函数 - function(tpl, onAddDomItem, fieldNameAlias)
    * tpl - 模板的ID或DOM对象。
    * `[onAddDomItem]` - 当渲染数组时，复制模板DOM对象时的回调函数function(dataObj, dataIdx)，该回调函数的this指向对应的Form对象。
    * `[fieldNameAlias]` - 给模板属性fieldName设置的别名，可利用该参数在同一个模板中渲染或提取不同的数据。
* Form.prototype.formData - function(dataArg)
    * `[dataArg]` - 被渲染的数据对象或数组，如果某个下级数据字段是数组类型，则需要（利用valAttrEvals和fieldNameAlias）将该数据字段整体进行处理。如果该参数为空，则表示从模板中提取数据。

### 用法:
请参考：domTpl属性。具体例子请参考：demo/templatedForm-form.html。

## TemplatedForm.Template
一个将Object对象转换为HTML风格模块的组件。

### 属性：
* tplObj - Object风格的模板，propertyName即为转换后DOM对象的tagName，使用$:{}包含的propertyName即为转换后DOM对象的attributeName。
* forms`[]` - 创建的Form对象（Array），个数由构造函数的参数决定。

### 方法：
* 构造函数 - function(container, tplConstructor, tplArgs, fieldNameAlias)
    * container - 接收转换后模板（DOM对象）的容器（ID或DOM对象）。**注意**，此参数与Form构造函数的tpl参数不同，该参数是模板的容器，一般来说不是模板，被转化出来的DOM对象（或某个子节点）才是模板，但forms`[*]`.domTpl默认指向container对应的DOM对象。
    * tplConstructor - 被转换的tplObj对象，或者一个将tplArgs参数转换为tplObj对象的函数。当该参数是对象时，将忽略tplArgs参数。
    * `[tplArgs]` - 请参考：tplConstructor参数。
    * `[fieldNameAlias]` - 给模板属性fieldName设置的别名，可利用该参数在同一个模板中渲染或提取不同的数据。可以为数组，forms的数组大小由该参数的个数决定。
* Template.prototype.init - function(reset)
    * `[reset]` - 是否重置container中的内容。

### 用法:
请参考：tplObj属性。具体例子请参考：demo/templatedForm-temp.html。

## TemplatedForm.layout
一个用于生成布局div的函数function(layoutDef, container)（使用Template实现）。

### 参数：
* layoutDef - 块属性定义，可以为数组。有效的属性为：
```
{
    moduleName: String, // 模块入口函数或名称，接口：function(thisDom)
    trigger: String,    // 指示入口函数调用的事件名，例如onload/onclick等
    cssFile: String,    // 可选，需动态加载的css文件
    jsFile: String,     // 可选，需动态加载的js文件
    id: String,         // 可选，被创建div的id
    className: String,  // 可选，被创建div的class
    style: String,      // 可选，被创建div的style
    text:String         // 可选，被创建div中显示的text
}
```
* container - 接收被创建div的容器（ID或DOM对象）。

### 用法:
请参考：layoutDef参数。具体例子请参考：demo/templatedForm-layout.html。

