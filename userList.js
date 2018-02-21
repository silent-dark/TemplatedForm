if (TemplatedForm.UserList == null) {
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
                        onBefRender: setStatEval,
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
