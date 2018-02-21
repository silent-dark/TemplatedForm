if (TemplatedForm.UserList == null) {
    TemplatedForm.UserList = function(styles, container, callbacks) {
        var listTpl = function(tplArgs) {
            var displayStyle = tplArgs.isTiled? "display:inline-block": "";
            this.div = {
                $: {
                    style: displayStyle,
                    'class': tplArgs.itemStyle,
                    onclick: tplArgs.onSetSelIdx
                },
                span: [{
                    fieldName: "portrait:style.backgroundImage",
                    'class': tplArgs.portraitStyle
                }, {
                    fieldName: "name",
                    'class': tplArgs.nameStyle
                }, {
                    fieldName: "stat",
                    'class': tplArgs.statStyle
                }]
            };
        };
        var setChangeStatCallback = function() {
            this.valAttrEvals["stat"] = function(stat) {
                if (stat == null) {
                    // get:
                    return this.stat;
                } else {
                    // set:
                    this.stat = stat;
                    if (callbacks.onSetStat)
                        callbacks.onSetStat.call(this);
                }
            }
            return this.domTpl.lastChild;
        };
        this.add = function(userInfo) {
            if (this.listView == null) {
                this.listView = new TemplatedForm.ListView(
                    userInfo, styles, container, {
                        onBefRender: setChangeStatCallback,
                        onSel: callbacks.onSel
                    }, listTpl
                );
            } else {
                this.listView.append(userInfo);
            }
        };
        this.remove = function(idx) {
            if (this.listView)
                this.listView.remove(idx);
        };
        this.maxUserIdx = function() {
            return this.listView? this.listView.maxItemIdx(): -1;
        };
        this.userInfo = function(idx) {
            return this.listView? this.listView.itemData(idx): null;
        };
    };
}
