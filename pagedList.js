// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render paged-list.

if (TemplatedForm.pagedList == null) {
    // @param cbs - the callbacks: {
    //    onBefInit: function(styles),  // should return tplArgs.
    //    onBefRender: function(domTpl),// should return domTpl.
    //    onSel: function()
    // }
    // @param tpl - the tpl constructor (function).
    // @param values - the data for render.
    // @param styles - the styles: {
    //    pageBtnStyle: String, // the class name of page-bar button.
    //    pageGapStyle: String  // the class name of page-bar gap.
    //    pageBarStyle: String, // the class name of page-bar.
    //    listStyle: String,    // the class name of list.
    //    itemStyle: String,    // the class name of list-item.
    //    itemStyleSel: String, // the class name of selected list-item.
    //    fieldMap: String,     // the pairs of fieldName.
    // }
    // @param container - the container id or element.
    TemplatedForm.pagedList = function(values, styles, container, cbs, tpl) {
        var thisLayout = [{
            moduleName: function(domPageBar) {
                TemplatedForm.pageBar({
                    getScrollView: function() {
                        return domPageBar.nextSibling;
                    }
                }, {
                    btnStyle: styles.pageBtnStyle,
                    gapStyle: styles.pageGapStyle
                }, domPageBar);
            },
            className: styles.pageBarStyle
        }, {
            moduleName: function(domList) {
                domList.parentElement.myListView = new TemplatedForm.ListView(
                    values, styles, domList, cbs, tpl
                );
                var domPageBar = domList.previousSibling;
                if (domList.scrollHeight > domList.clientHeight) {
                    domList.style.height = (
                        domList.clientHeight - domPageBar.clientHeight
                    ).toString() + "px";
                } else {
                    domPageBar.style.display = "none";
                }
            },
            className: styles.listStyle
        }];
        TemplatedForm.layout(thisLayout, container);
    };
}
