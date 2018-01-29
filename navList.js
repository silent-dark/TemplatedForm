// @param navListDef - definitions of nav-list: {
//     text: String,
//     iconSrc: "url(/img/home.png)",
//     iconSrcSel: "url(/img/home-red.png)",
//     comAreaLayout: TemplatedForm.layout.layoutDef
// }
// @param styles - styles of nav-list: {
//     navStyle: String,        // the class name of any nav-item.
//     navStyleSel: String,     // the class name of selected nav-item.
//     navHighLight: String,    // the class name of any highlight-tag.
//     navHighLightSel: String, // the class name of selected highlight-tag.
//     navIcon: String          // the class name of any nav-item.
// }
if (window.navList == null) (function() {
    var domComArea = null;
    var domLastSel = null;
    var setItemStyle = function(itemStyles) {
        var childSpan = this.getElementsByTagName("span");
        this.className = this.getAttribute(itemStyles[0]);
        childSpan[0].className = this.getAttribute(itemStyles[1]);
        childSpan[1].style.backgroundImage = this.getAttribute(itemStyles[2]);
    };
    var setFocus = function() {
        if (domLastSel != this) {
            setItemStyle.call(domLastSel, [
                "navStyle", "navHighLight", "iconSrc"
            ]);
            domLastSel = this;
        }
        setItemStyle.call(this, [
            "navStyleSel", "navHighLightSel", "iconSrcSel"
        ]);
        if(this.comAreaLayout && domComArea)
            TemplatedForm.layout(this.comAreaLayout, domComArea);
    };
    var navListTpl = function(styles) {
        this.div = {
            $: {
                fieldName: "iconSrc:iconSrc;iconSrcSel:iconSrcSel;comAreaLayout:comAreaLayout",
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
    window.navList = function(navListDef, styles, container, comArea) {
        domComArea = TemplatedForm.getDomElement(comArea);
        var navTemplate = new TemplatedForm.Template(
            container, navListTpl, styles
        );
        navTemplate.init();
        domLastSel = navTemplate.forms[0].domTpl.lastChild;
        navTemplate.forms[0].domTpl = domLastSel;
        navTemplate.forms[0].formData(navListDef);
        setFocus.call(domLastSel);
    };
})();
