# TemplatedForm
一个模板化UI视图层的组件库。

## TemplatedForm.Form
一个渲染或提取数据到HTML风格模板的组件。

#### 属性：
* domTpl - 作为模板的DOM对象。
* domItems - 渲染后从模板复制出的DOM对象（Array）。
* onAddDomItem - 当渲染数组时，复制模板DOM对象时的回调函数function(dataObj, dataIdx)，该回调函数的this指向对应的Form对象。
* fieldNameAlias - 给模板属性fieldName设置的别名。
* valAttrEvals - 渲染或提取数据字段时，若需要执行一个过程（而不是映射到DOM对象的某个Property），则以数据字段名称为Key，向该对象中注册一个回调函数function(attrVal)，该回调函数的this指向对应的DOM对象。

#### 方法：
* 构造函数 - function(tpl, onAddDomItem, fieldNameAlias)
    * tpl - 模板的ID或DOM对象。
    * `[`onAddDomItem`]` - 当渲染数组时，复制模板DOM对象时的回调函数function(dataObj, dataIdx)，该回调函数的this指向对应的Form对象。
    * `[`fieldNameAlias`]` - 给模板属性fieldName设置的别名。
* Form.prototype.formData - function(dataArg)
    * `[`dataArg`]` - 被渲染的数据对象或数组，如果某个下级数据字段是数组类型，则需要（利用valAttrEvals和fieldNameAlias）将该数据字段整体进行处理。如果该参数为空，则表示从模板中提取数据。

### 用法:
使用本对象，只需要在作为模板的HTML标签中，增加一个fieldName的自定义属性，该自定义属性的写法类似style属性的格式：`fieldName1[:DOMProperty1][;fieldName2[:DOMProperty2][;...]]`，如果DOMProperty为空，则默认为value或textContent。具体例子请参考：demo/templatedForm-form.html

## TemplatedForm.Template
