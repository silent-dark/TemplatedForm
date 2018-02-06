// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render select view.

if (TemplatedForm.selView == null) (function() {
    var selTpl = function(tplArgs) {
        this.div = [{
            $: {
                'class': tplArgs.bodyStyle,
                onclick: function() {
                    var domList = this.nextSibling;
                    domList.style.display = "block";
                    domList.style.width = this.clientHeight.toString() + "px";
                    if (domList.getAttribute("posOff") == -1) {
                        domList.style.top = (
                            -domList.clientHeight
                        ).toString() + "px";
                    }
                    domList.focus();
                }
            }
        }, {
            $: {
                posOff: tplArgs.posOff,
                style: "display:none;position:absolute",
                'class': tplArgs.listStyle,
                tabindex: -1,
                onblur: function() {
                    this.style.display = "none";
                }
            },
            div: {
                $: {
                    fieldName: tplArgs.fieldMap,
                    'class': tplArgs.itemStyle,
                    onclick: tplArgs.onSetSelIdx
                }
            }
        }];
    };
    var getTplArgs = function(styles) {
        var self = this;
        return Object.assign({
            onSetSelIdx: function() {
                var domList = this.parentElement;
                domList.style.display = "none";
                domList.previousSibling.textContent = this.textContent;
                self.domSel = this;
                if (self.onSel)
                    self.onSel.call(this);
            }
        }, styles);
    };
    var getFormTpl = function(domTpl) {
        return domTpl.lastChild.lastChild;
    };
    // @param values - the values for render.
    // @param styles - styles of nav-list: {
    //     bodyStyle: String,   // the class name of sel-body.
    //     listStyle: String,   // the class name of sel-list.
    //     itemStyle: String    // the class name of list-item.
    //     posOff: Number,      // show sel-list on sel-body if set to -1.
    //     fieldMap: String,    // the pairs of fieldName.
    // }
    // @param container - the container id or element.
    // @param onSel - the callback function(domSel) when select list-item.
    TemplatedForm.selView = function(values, styles, container, onSel) {
        return new TemplatedForm.ListView(values, styles, container, {
            onBefInit: getTplArgs,
            onBefRender: getFormTpl,
            'onSel': onSel
        }, selTpl);
    };
})();
