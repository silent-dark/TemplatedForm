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
                onclick: tplArgs.onShowList
            }
        }, {
            $: {
                style: "display:none;position:absolute",
                'class': tplArgs.listStyle,
                posOff: tplArgs.posOff
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
            onShowList: function() {
                this.nextSibling.style.display = "block";
                if (this.nextSibling.getAttribute("posOff") == -1) {
                    this.nextSibling.style.top = (
                        -this.nextSibling.clientHeight
                    ).toString() + "px";
                }
            },
            onSetSelIdx: function() {
                this.parentElement.style.display = "none";
                var domSelBody = this.parentElement.previousSibling;
                var domSelInput = domSelBody.getElementsByTagName("input");
                if (domSelInput.length > 0)
                    domSelInput[0].value = this.textContent;
                else
                    domSelBody.textContent = this.textContent;
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
        return new TemplatedForm.ListView({
            onBefInit: getTplArgs,
            onBefRender: getFormTpl,
            'onSel': onSel
        }, selTpl, values, styles, container);
    };
})();
