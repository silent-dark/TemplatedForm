// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render nav-list view.

if (TemplatedForm.navList == null) (function() {
    var navItemTpl = function(tplArgs) {
        this.div = {
            $: {
                fieldName: "iconSrc:iconSrc;iconSrcSel:iconSrcSel;id:id",
                'class': TemplatedForm.getRowStyle(tplArgs.itemStyle, 0),
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
    var setItemStyles = function() {
        var childSpan = this.getElementsByTagName("span");
        this.className = arguments[0];
        childSpan[0].className = arguments[1];
        childSpan[1].style.backgroundImage = arguments[2];
    };
    var getTplArgs = function(styles) {
        var self = this;
        return Object.assign({
            onSetSelIdx: function() {
                if (self.domSel != this) {
                    setItemStyles.call(
                        self.domSel,
                        TemplatedForm.getRowStyle(styles.itemStyle, self.domSel.idx),
                        styles.navHighLight,
                        self.domSel.iconSrc
                    );
                    self.domSel = this;
                }
                setItemStyles.call(
                    this,
                    styles.itemStyleSel,
                    styles.navHighLightSel,
                    this.iconSrcSel
                );
                if (self.onSel)
                    self.onSel.call(this);
            }
        }, styles);
    };
    // @param navListDef - definitions of nav-list: {
    //    text: String,
    //    iconSrc: "url(/img/home.png)",
    //    iconSrcSel: "url(/img/home-red.png)"
    // }
    // @param styles - the styles of nav-list: {
    //    itemStyle: String,        // the class name of any nav-item.
    //    itemStyleSel: String,     // the class name of selected nav-item.
    //    navHighLight: String,    // the class name of any highlight-tag.
    //    navHighLightSel: String, // the class name of selected highlight-tag.
    //    navIcon: String          // the class name of any nav-icon.
    // }
    // @param container - the container id or element.
    // @param onSel - the callback function(domSel) when select list-item.
    TemplatedForm.navList = function(navListDef, styles, container, onSel) {
        return new TemplatedForm.ListView(navListDef, styles, container, {
            onBefInit: getTplArgs,
            'onSel': onSel
        }, navItemTpl);
    };
})();
