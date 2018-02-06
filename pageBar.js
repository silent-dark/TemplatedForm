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
    //     btnStyle: String,    // the class name of button.
    //     gapStyle: String     // the class name of gap.
    // }
    // @param container - the container id or element.
    TemplatedForm.pageBar = function(callbacks, styles, container) {
        var domScrollView = (
            callbacks.getScrollView
        )? callbacks.getScrollView(): null;
        if (callbacks.onPrePage == null && domScrollView) {
            callbacks.onPrePage = function() {
                var scrollPos = domScrollView.scrollTop +
                                domScrollView.clientHeight;
                domScrollView.scrollTop = (
                    scrollPos < domScrollView.scrollTopMax
                )? scrollPos: domScrollView.scrollTopMax;
            }
        }
        if (callbacks.onNextPage == null && domScrollView) {
            callbacks.onNextPage = function() {
                var scrollPos = domScrollView.scrollTop -
                                domScrollView.clientHeight;
                domScrollView.scrollTop = (scrollPos > 0)? scrollPos: 0;
            }
        }
        var barLayout = [{
            moduleName: callbacks.onPrePage,
            trigger: "onclick",
            className: styles.btnStyle,
            style: "display:inline-block;cursor:pointer",
            text: "上一页"
        }, {
            moduleName: callbacks.onInitGap,
            className: styles.gapStyle,
            style: "display:inline-block",
        }, {
            moduleName: callbacks.onNextPage,
            trigger: "onclick",
            className: styles.btnStyle,
            style: "display:inline-block;cursor:pointer",
            text: "下一页"
        }];
        TemplatedForm.layout(barLayout, container);
    };
}
