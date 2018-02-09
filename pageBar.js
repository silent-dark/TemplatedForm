// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render page-bar.

if (TemplatedForm.pageBar == null) {
    // @param callbacks - the callbacks: {
    //    onPrePage: function(domBtn),
    //    onNextPage: function(domBtn),
    //    onInitGap: function(domGap),
    //    getScrollView: function()
    // }
    // @param styles - the styles of page-bar: {
    //    btnStyle: String,    // the class name of button.
    //    gapStyle: String     // the class name of gap.
    // }
    // @param container - the container id or element.
    // [@param btnNames] - the array of button names.
    TemplatedForm.pageBar = function(callbacks, styles, container, btnNames) {
        var domScrollView = (
            callbacks.getScrollView
        )? callbacks.getScrollView(): null;
        if (callbacks.onPrePage == null && domScrollView) {
            callbacks.onPrePage = function() {
                var scrollPos = domScrollView.scrollTop -
                                domScrollView.clientHeight;
                domScrollView.scrollTop = (scrollPos > 0)? scrollPos: 0;
            }
        }
        if (callbacks.onNextPage == null && domScrollView) {
            callbacks.onNextPage = function() {
                var scrollPos = domScrollView.scrollTop +
                                domScrollView.clientHeight;
                domScrollView.scrollTop = (
                    scrollPos < domScrollView.scrollTopMax
                )? scrollPos: domScrollView.scrollTopMax;
            }
        }
        if (btnNames == null)
            btnNames = ["上一页", "下一页"];
        var barLayout = [{
            moduleName: callbacks.onPrePage,
            trigger: "onclick",
            className: styles.btnStyle,
            style: "display:inline-block;cursor:pointer",
            text: btnNames[0]
        }, {
            moduleName: callbacks.onInitGap,
            className: styles.gapStyle,
            style: "display:inline-block",
            text: ""
        }, {
            moduleName: callbacks.onNextPage,
            trigger: "onclick",
            className: styles.btnStyle,
            style: "display:inline-block;cursor:pointer",
            text: btnNames[1]
        }];
        TemplatedForm.layout(barLayout, container);
    };
}
