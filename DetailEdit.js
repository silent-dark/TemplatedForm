if (window.DetailEdit == null) {
    window.DetailEdit = function(dvAppearances, ebAppearances) {
        this.innerDetailView = new DetailView(dvAppearances);
        this.innerEditBar = new EditBar();
        this.onSave = null;
        this.onDel = null;

        this._ebAppearances = TemplatedForm.obj2array(ebAppearances);
        this._ebAppearances.map(function(appearance) {
            if (appearance.btnStyleOrClasses) {
                appearance.buttons = [];
                TemplatedForm.obj2array(appearance.btnStyleOrClasses).map(
                    function(btnStyleOrClass) {
                        appearance.buttons.push({
                            styleOrClass: btnStyleOrClass
                        });
                    }
                );
            }
        });
    };

    window.DetailEdit.prototype = {
        attach: function(container, binders, dataObj) {
            var that = this;

            this.container = TemplatedForm.getDomElement(container);
            this.container.innerHTML = "";

            this.domEditBars = [];
            this.domDetailViews = [];

            TemplatedForm.obj2array(binders).map(function(binder, i) {
                var domDetailView = document.createElement("div");
                if (binder.styleOrClass) {
                    TemplatedForm.setStyleOrClass(
                        domDetailView, binder.styleOrClass
                    );
                }
                that.domDetailViews.push(domDetailView);

                var editBarIdx = binder.editBarIdx;
                if (editBarIdx > -1 && editBarIdx < that._ebAppearances.length)
                {
                    domDetailView.domEditBar = that._createEditBar(
                        editBarIdx, (i == 0)
                    );
                }

                domDetailView.dataFilters = binder.dataFilters;
                that.innerDetailView.render(
                    domDetailView, domDetailView.dataFilters, dataObj
                );
                domDetailView.style.display = "none";
                that.container.appendChild(domDetailView);
            });

            this.dataObj = dataObj;
            this.domDisplayView = null;
        },

        show: function(val, editMode) {
            if (this.domDisplayView) {
                this.domDisplayView.domEditBar.style.display = "none";
                this.domDisplayView.style.display = "none";
                this.domDisplayView = null;
            }

            if (val) {
                this.domDisplayView = this.domDetailViews[editMode? 0: 1];
                this.domDisplayView.domEditBar.style.display = "block";
                this.domDisplayView.style.display = "block";
            }
        },

        _createEditBar: function(editBarIdx, editMode) {
            var ebAppearance = this._ebAppearances[editBarIdx];
            var domEditBar = document.createElement("div");
            if (ebAppearance.styleOrClass) {
                TemplatedForm.setStyleOrClass(
                    domEditBar, ebAppearance.styleOrClass
                );
            }
            this.domEditBars.push(domEditBar);

            if (ebAppearance.buttons) {
                if (editMode)
                    this._initButtonsInEditMode(ebAppearance.buttons);
                else
                    this._initButtonsInViewMode(ebAppearance.buttons);
            }

            this.innerEditBar.render(
                domEditBar,
                ebAppearance.title,
                ebAppearance.highlight,
                ebAppearance.buttons
            );
            domEditBar.style.display = "none";
            this.container.appendChild(domEditBar);
            return domEditBar;
        },

        _initButtonsInEditMode: function(buttons) {
            var that = this;

            if (buttons.length > 0) {
                // save button:
                buttons[0].onclick = function() {
                    var domDetailView = that.domDetailViews[0];
                    var dataObj = that.innerDetailView.extract(domDetailView);

                    for (var i = 0; i < domDetailView.dataFilters.length; ++i) {
                        var filter = domDetailView.dataFilters[i];
                        if (filter.required && !dataObj[filter.propName]) {
                            alert("请填写'" +
                                (filter.label? filter.label: filter.propName) +
                                "'信息"
                            );
                            return;
                        }
                    }

                    var saveResult = null;
                    if (that.onSave)
                        saveResult = that.onSave(dataObj, that.dataObj);
                    if ( saveResult && !TemplatedForm.isEmpty(saveResult) ) {
                        console.log(saveResult);
                        if (saveResult.alertText)
                            alert(saveResult.alertText);
                    } else {
                        that.dataObj = dataObj;

                        var showViewMode = that._showViewMode();
                        if (showViewMode) {
                            domDetailView = that.domDetailViews[1];
                            that.innerDetailView.render(
                                domDetailView,
                                domDetailView.dataFilters,
                                dataObj
                            );
                        }
                        that.show(showViewMode);
                    }
                }
            }

            if (buttons.length > 1) {
                // cancel button:
                buttons[1].onclick = function() {
                    that.show( that._showViewMode() );
                    if (that.onCancel)
                        that.onCancel();
                }
            }
        },

        _initButtonsInViewMode: function(buttons) {
            var that = this;

            if (buttons.length > 0) {
                // edit button:
                buttons[0].onclick = function() {
                    that.show(true, "edit");
                }
            }

            if (buttons.length > 1) {
                // delete button:
                buttons[1].onclick = function() {
                    if (that.onDel) {
                        if ( confirm("确定要删除吗？") ) {
                            var delResult = that.onDel(that.dataObj);
                            if ( delResult &&
                                !TemplatedForm.isEmpty(delResult) )
                            {
                                console.log(delResult);
                                if (delResult.alertText)
                                    alert(delResult.alertText);
                            } else {
                                that.show(false);
                            }
                        }
                    } else {
                        that.show(false);
                    }
                }
            }
        },

        _showViewMode: function() {
            return (this.domDetailViews.length > 1);
        }
    };
}
