// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render nav-list view.

if (TemplatedForm.navList == null) (function() {
    var navListTpl = function(tplArgs) {
        this.div = {
            $: {
                fieldName: "iconSrc:iconSrc;iconSrcSel:iconSrcSel;id:id",
                'class': tplArgs.navStyle,
                navStyle: tplArgs.navStyle,
                navStyleSel: tplArgs.navStyleSel,
                navHighLight: tplArgs.navHighLight,
                navHighLightSel: tplArgs.navHighLightSel,
                iconSrc: "",
                iconSrcSel: "",
                onclick: tplArgs.onSetSelIdx
            },
            span: [{
                $: {
                    'class': tplArgs.navHighLight
                }
            }, {
                $: {
                    fieldName: "iconSrc:style.backgroundImage",
                    'class': tplArgs.navIcon
                }
            }, {
                $: {
                    fieldName: "text"
                }
            }]
        };
    };
    var setItemStyles = function(itemStyles) {
        var childSpan = this.getElementsByTagName("span");
        this.className = this.getAttribute(itemStyles[0]);
        childSpan[0].className = this.getAttribute(itemStyles[1]);
        childSpan[1].style.backgroundImage = this.getAttribute(itemStyles[2]);
    };
    var getTplArgs = function(styles) {
        var self = this;
        return Object.assign({
            onSetSelIdx: function() {
                if (self.domSel != this) {
                    setItemStyles.call(self.domSel, [
                        "navStyle", "navHighLight", "iconSrc"
                    ]);
                }
                setItemStyles.call(this, [
                    "navStyleSel", "navHighLightSel", "iconSrcSel"
                ]);
            }
        }, styles);
    };
    var getFormTpl = function(domTpl) {
        return domTpl.lastChild;
    };
    // @param navListDef - definitions of nav-list: {
    //     text: String,
    //     iconSrc: "url(/img/home.png)",
    //     iconSrcSel: "url(/img/home-red.png)"
    // }
    // @param styles - styles of nav-list: {
    //     navStyle: String,        // the class name of any nav-item.
    //     navStyleSel: String,     // the class name of selected nav-item.
    //     navHighLight: String,    // the class name of any highlight-tag.
    //     navHighLightSel: String, // the class name of selected highlight-tag.
    //     navIcon: String          // the class name of any nav-item.
    // }
    // @param container - the container id or element.
    // @param onSel - the callback function(domSel) when select list-item.
    TemplatedForm.navList = function(navListDef, styles, container, onSel) {
        return new TemplatedForm.ListView({
            onBefInit: getTplArgs,
            onBefRender: getFormTpl,
            'onSel': onSel
        }, navListTpl, navListDef, styles, container);
    };
})();
