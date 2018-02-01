// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render nav-list view.

if (TemplatedForm.navList == null) (function() {
    var domContainer = null;
    var domLastSel = null;
    var setItemStyles = function(itemStyles) {
        var childSpan = this.getElementsByTagName("span");
        this.className = this.getAttribute(itemStyles[0]);
        childSpan[0].className = this.getAttribute(itemStyles[1]);
        childSpan[1].style.backgroundImage = this.getAttribute(itemStyles[2]);
    };
    var setFocus = function() {
        if (domLastSel != this) {
            setItemStyles.call(domLastSel, [
                "navStyle", "navHighLight", "iconSrc"
            ]);
            domLastSel = this;
        }
        setItemStyles.call(this, [
            "navStyleSel", "navHighLightSel", "iconSrcSel"
        ]);
        if (domContainer && domContainer.onSel)
            domContainer.onSel(this);
    };
    var navListTpl = function(styles) {
        this.div = {
            $: {
                fieldName: "iconSrc:iconSrc;iconSrcSel:iconSrcSel;id:id",
                'class': styles.navStyle,
                navStyle: styles.navStyle,
                navStyleSel: styles.navStyleSel,
                navHighLight: styles.navHighLight,
                navHighLightSel: styles.navHighLightSel,
                iconSrc: "",
                iconSrcSel: "",
                onclick: setFocus
            },
            span: [{
                $: {
                    'class': styles.navHighLight
                }
            }, {
                $: {
                    fieldName: "iconSrc:style.backgroundImage",
                    'class': styles.navIcon
                }
            }, {
                $: {
                    fieldName: "text"
                }
            }]
        };
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
        var navTemplate = new TemplatedForm.Template(
            container, navListTpl, styles
        );
        navTemplate.init();
        domContainer = navTemplate.forms[0].domTpl;
        domLastSel = domContainer.lastChild;
        navTemplate.forms[0].onAddDomItem = function(dataObj, i) {
            this.domItems[i].idx = i;
        };
        navTemplate.forms[0].domTpl = domLastSel;
        navTemplate.forms[0].formData(navListDef);
        // @param idx - the index of list-item.
        // [@param cb] - a callback function(domSel) or bool value to indicate
        //               if trigger the preset callback.
        domContainer.focusOn = function(idx, cb) {
            if (cb) {
                if (cb.call)
                    domContainer.onSel = cb;
            } else {
                if (cb != null)
                    domContainer.onSel = null;
            }
            setFocus.call(navTemplate.forms[0].domItems[idx]);
            domContainer.onSel = onSel;
        };
        domContainer.focusOn(0, onSel);
    };
})();
