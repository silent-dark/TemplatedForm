// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render paged-list.

if (TemplatedForm.pagedList == null) {
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
    // [@param listRender] - the callback function(domList) to render list.
    // [@param pageBarOpt] - the page-bar options: {
    //    onInitGap: function(domGap),
    //    btnNames: [String]
    // }
    TemplatedForm.pagedList = function(
        values, styles, container, listRender, pageBarOpt)
    {
        if (listRender == null) {
            listRender = function(domList) {
                container.listView = new TemplatedForm.ListView(
                    values, styles, domList
                );
            };
        }
        if (pageBarOpt == null)
            pageBarOpt = {};
        var thisLayout = [{
            moduleName: function(domPageBar) {
                TemplatedForm.pageBar({
                    getScrollView: function() {
                        return domPageBar.nextSibling;
                    },
                    onInitGap: pageBarOpt.onInitGap
                }, {
                    btnStyle: styles.pageBtnStyle,
                    gapStyle: styles.pageGapStyle
                }, domPageBar, pageBarOpt.btnNames);
            },
            className: styles.pageBarStyle
        }, {
            moduleName: function(domList) {
                domList.parentNode.refreshPageBar = function() {
                    var domPageBar = domList.previousSibling;
                    if (domList.scrollHeight > domList.clientHeight) {
                        domPageBar.style.display = "block";
                        if (domList.och == domList.clientHeight) {
                            domList.style.height = (
                                domList.clientHeight - domPageBar.offsetHeight
                            ).toString() + "px";
                        }
                    } else {
                        if (domList.och != domList.clientHeight)
                            domList.style.height = domList.och.toString() +"px";
                        domPageBar.style.display = "none";
                    }
                };
                domList.style.overflowY = "auto";
                listRender(domList);
                domList.och = domList.clientHeight;
                domList.parentNode.refreshPageBar();
            },
            className: styles.listStyle
        }];
        TemplatedForm.layout(thisLayout, container);
    };
}
