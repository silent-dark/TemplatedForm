# PageBar
一个可配置的翻页栏组件。具体外观请参考UI效果图。

![pageBar.png](../UIDesign/components/1.bars/pageBar.png)

## 方法：
### 构造函数：function(appearances)
（若采用Vue实现，构造参数通过props传递）

* appearances - Object，按钮外观，对象结构如下：

```javascript
{
    pageStyleOrClass: String,       // 页面链接按钮基本样式。
    curPageStyleOrClass: String,    // 当前页按钮样式。
    disabledStyleOrClass: String,   // 被禁用按钮样式（例如当前页为第1页时的“首页”、“上一组”、“上一页”按钮）。
    firstPage: {                    // 可选，“首页”按钮，若不指定，表示没有“首页”按钮。
        text: String,                   // 可选，按钮文字，默认为"|<"。
        styleOrClass: String,           // 可选，按钮样式，若不指定则使用按钮基本样式。
    },
    lastPage: {                     // 可选，“尾页”按钮，若不指定，表示没有“尾页”按钮。
        text: String,                   // 可选，按钮文字，默认为">|"。
        styleOrClass: String,           // 可选，按钮样式，若不指定则使用按钮基本样式。
    },
    preGroup: {                     // 可选，“上一组”按钮，若不指定，表示没有“上一组”按钮。
        text: String,                   // 可选，按钮文字，默认为"<<"。
        styleOrClass: String,           // 可选，按钮样式，若不指定则使用按钮基本样式。
    },
    nextGroup: {                    // 可选，“下一组”按钮，若不指定，表示没有“下一组”按钮。
        text: String,                   // 可选，按钮文字，默认为">>"。
        styleOrClass: String,           // 可选，按钮样式，若不指定则使用按钮基本样式。
    },
    prePage: {                      // 可选，“上一页”按钮，若不指定，表示没有“上一页”按钮。
        text: String,                   // 可选，按钮文字，默认为"<"。
        styleOrClass: String,           // 可选，按钮样式，若不指定则使用按钮基本样式。
    },
    nextPage: {                     // 可选，“下一页”按钮，若不指定，表示没有“下一页”按钮。
        text: String,                   // 可选，按钮文字，默认为">"。
        styleOrClass: String,           // 可选，按钮样式，若不指定则使用按钮基本样式。
    }
}
```

### render：function(container, totalPages, showPages, onGoPage)
数据渲染方法，无返回值。若重复调用此函数，则重新渲染整个区域（若采用Vue实现，参数可以通过props传递）。

**注意** 当切换页面时，如果上一页/下一页超出了第一个/最后一个页面链接按钮的页号，则应当自动更新所有页面链接按钮的页号。

* container - String/DOM-Element，接收渲染结果的容器，可以是id或DOM-Element对象（若采用Vue实现，则无此参数）。
* totalPages - Number，页面总数。
* showPages - Number，最多显示的页面链接按钮数，如果大于等于totalPages，则只显示totalPages个页面链接按钮，如果小于totalPages，则使用“...{{页面总数}}”代替被隐藏的链接按钮。
* onGoPage - function(pageIdx) {...}，切换页面时的回调函数，参数说明如下：
    * pageIdx - Number，切换的目标页号。

### setTotalPages：function(totalPages)
设置页面总数，并重新渲染整个组件（**注意** 此方法并不改变当前页和当前组）

* totalPages - Number，页面总数。

## 属性/事件句柄：
### curPageIdx: Number
当前页号。
