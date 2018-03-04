// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module to render user-list.

if (TemplatedForm.UserList == null) {
    // @param styles - the styles: {
    //    itemStyle: String,     // the class name of list-item.
    //    itemStyleSel: String,  // the class name of selected list-item.
    //    portraitStyle: String, // the class name of user-portrait.
    //    nameStyle: String,     // the class name of user-name.
    //    statStyle: String      // the class name of user-status.
    //    isTiled: Boolean,      // indicates if the list is tiled.
    // }
    // @param container - the container id or element.
    // [@param callbacks] - the callbacks: {
    //    onRenderStat: function(),
    //    onSel: function()
    // }
    TemplatedForm.UserList = function(styles, container, callbacks) {
        var listTpl = function(tplArgs) {
            this.div = {
                $: {
                    'class': tplArgs.itemStyle,
                    onclick: tplArgs.onSetSelIdx
                },
                span: [{
                    $: {
                        style: "display:inline-block",
                        fieldName: "portrait:style.backgroundImage",
                        'class': tplArgs.portraitStyle
                    }
                }, {
                    $: {
                        fieldName: "name",
                        'class': tplArgs.nameStyle
                    }
                }, {
                    $: {
                        fieldName: "stat",
                        'class': tplArgs.statStyle
                    }
                }]
            };
            if (tplArgs.isTiled)
                this.div.$.style = "display:inline-block";
        };
        var setStatEval = function() {
            this.valAttrEvals["stat"] = function(stat) {
                if (stat == null) {
                    // get:
                    return this.stat;
                } else {
                    // set:
                    this.stat = stat;
                    if (callbacks.onRenderStat)
                        callbacks.onRenderStat.call(this);
                }
            }
            return this.domTpl.lastChild;
        };
        this.add = function(userInfo) {
            if (this.listView == null) {
                this.listView = new TemplatedForm.ListView(
                    userInfo, styles, container, {
                        onBefRender: setStatEval,
                        onSel: callbacks.onSel
                    }, listTpl
                );
            } else {
                this.listView.append(userInfo);
            }
        };
    };
    TemplatedForm.UserList.prototype.remove = function(idx) {
        if (this.listView)
            this.listView.remove(idx);
    };
    TemplatedForm.UserList.prototype.idxEnd = function() {
        return this.listView? this.listView.idxEnd(): 0;
    };
    TemplatedForm.UserList.prototype.userInfo = function(idx) {
        return this.listView? this.listView.itemData(idx): null;
    };
    TemplatedForm.UserList.prototype.checkUserInfo = function(idx) {
        return this.listView? this.listView.validateItem(idx): false;
    };
    TemplatedForm.UserList.prototype.userInfoCount = function() {
        return this.listView? this.listView.itemCount: 0;
    };
    TemplatedForm.UserList.prototype.domItems = function() {
        return this.listView? this.listView.tplForm.domItems: null;
    };
    TemplatedForm.UserList.prototype.replace = function(idx, userInfo) {
        if (this.listView)
            this.listView.update(idx, userInfo);
    };
}
