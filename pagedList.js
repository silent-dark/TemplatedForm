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
    //    pageBtnStyle: String, // the class name of page-bar.
    //    listStyle: String,    // the class name of list.
    //    itemStyle: String,    // the class name of list-item.
    //    itemStyleSel: String, // the class name of selected list-item.
    //    fieldMap: String,     // the pairs of fieldName.
    // }
    // @param container - the container id or element.
    // [@param listRender] - the callback function(domList) to render list.
    // [@param pageBtnOpt] - the page-bar options: {
    //    onInitGap: function(domGap),
    //    btnNames: [String]
    // }
    TemplatedForm.pagedList = function(
        values, styles, container, listRender, pageBtnOpt)
    {
        if (listRender == null) {
            listRender = function(domList) {
                container.listView = new TemplatedForm.ListView(
                    values, styles, domList
                );
            };
        }
        if (pageBtnOpt == null)
            pageBtnOpt = {};
        var thisLayout = [{
            moduleName: function(domPageBtn) {
                TemplatedForm.pageBtn({
                    getScrollView: function() {
                        return domPageBtn.nextSibling;
                    },
                    onInitGap: pageBtnOpt.onInitGap
                }, {
                    btnStyle: styles.pageBtnStyle,
                    gapStyle: styles.pageGapStyle
                }, domPageBtn, pageBtnOpt.btnNames);
                domPageBtn.style.display = "none";
            },
            className: styles.pageBtnStyle
        }, {
            moduleName: function(domList) {
                domList.parentNode.refreshPageBtn = function() {
                    var domPageBtn = domList.previousSibling;
                    if (domList.scrollHeight > domList.clientHeight) {
                        domPageBtn.style.display = "block";
                        if (domList.style.height == domList.myHeight) {
                            domList.style.height = (
                                domList.clientHeight - domPageBtn.offsetHeight
                            ).toString() + "px";
                        }
                    } else {
                        if (domList.style.height != domList.myHeight)
                            domList.style.height = domList.myHeight;
                        domPageBtn.style.display = "none";
                    }
                };
                domList.style.overflowY = "auto";
                listRender(domList);
                domList.myHeight = domList.style.height;
                domList.parentNode.refreshPageBtn();
            },
            className: styles.listStyle
        }];
        TemplatedForm.layout(thisLayout, container);
    };
}
