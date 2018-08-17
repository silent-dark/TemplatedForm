if (window.TableEdit == null) {
    window.TableEdit = function(
        tvAppearances, epAppearances, pbAppearances, deAppearances)
    {
        var that = this;

        var _appearances = TemplatedForm.obj2array(tvAppearances.appearances);
        _appearances.map(function(appearance) {
            appearance.columns = [that._colCheckbox(
                appearance.headAppearance, appearance.chkStyleOrClass
            )].concat(
                appearance.columns
            );
            appearance.columns.push( that._colOperations(
                appearance.headAppearance, appearance.btnStyleOrClass
            ) );
        });

        this.innerTableView = new TableView(
            _appearances, tvAppearances.tblStyleOrClass
        );
        this.innerEditPanel = new EditPanel(
            epAppearances.dvAppearances, epAppearances.btnAppearances
        );
        if (pbAppearances)
            this.innerPageBar = new PageBar(pbAppearances);
        this.innerDetailEdit = new DetailEdit(
            deAppearances.dvAppearances, deAppearances.ebAppearances
        );

        this.innerDetailEdit.onSave = function(dataObj, curData) {
            that.domComponents[3].style.display = "none";
            if (this.isNew) {
                if (that.onAdd)
                    return that.onAdd(this.modelName, dataObj);
                return { alertText: "onAdd is undefined!" };
            } else if (that.onMod) {
                return that.onMod(this.modelName, dataObj, curData);
            }
            return { alertText: "onMod is undefined!" };
        };
        this.innerDetailEdit.onCancel = function() {
            that.domComponents[3].style.display = "none";
        };

        this._styleOrClasses = [
            epAppearances.styleOrClass,
            tvAppearances.styleOrClass,
            pbAppearances? pbAppearances.styleOrClass: "",
            deAppearances.styleOrClass
        ];
        this._deAdapters = deAppearances.adapters;
    };

    window.TableEdit.prototype = {
        attach: function(container, headData, showPages, pageSize, searchData)
        {
            container = TemplatedForm.getDomElement(container);
            container.innerHTML = "";

            this.pageSize = pageSize;
            this.searchData = searchData;
            this.domCheckboxes = [];
            this.rowsData = [];

            this.domComponents = [];
            for (var i = 0; i < 4; ++i) {
                var domComp = document.createElement("div");
                if (this._styleOrClasses[i]) {
                    TemplatedForm.setStyleOrClass(
                        domComp, this._styleOrClasses[i]
                    );
                }
                container.appendChild(domComp);
                this.domComponents.push(domComp);
            }

            this._renderEditPanel(searchData);
            this.innerTableView.renderHead(this.domComponents[1], headData);
            this.domComponents[2].style.display = "none";
            if (this.innerPageBar) {
                var that = this;
                this.innerPageBar.render(
                    this.domComponents[2], 1, showPages,
                    function() {
                        that._triggerRefresh();
                    }
                );
            }
            var css = this.domComponents[3].style;
            css.display = "none";
            css.position = "absolute";
            css.top = "0";
            css.right = "0";
        },

        refresh: function(tvAppearanceIdx, data, totalPages) {
            if (data) {
                this.domCheckboxes.length = 1;
                this.rowsData.length = 1;
                this.innerTableView.clear(this.domComponents[1]);
                this.innerTableView.append(
                    this.domComponents[1], tvAppearanceIdx, data
                );
            }

            if (this.domCheckboxes[0].checked)
                this.domCheckboxes[0].checked = false;

            if (totalPages > 1 && this.innerPageBar) {
                this.domComponents[2].style.display = "block";
                this.innerPageBar.setTotalPages(totalPages);
            } else {
                this.domComponents[2].style.display = "none";
            }
        },

        _renderEditPanel: function(condOptions) {
            var that = this;

            var buttons = this.innerEditPanel._buttons;
            if (buttons.length > 0 && buttons[0].onclick == null) {
                // add button:
                buttons[0].onclick = function() {
                    that._triggerEdit();
                };
            }

            if (buttons.length > 1 && buttons[1].onclick == null) {
                // edit button:
                buttons[1].onclick = function() {
                    that._hideInnerEdit();

                    var selRows = that._selectedRowsData();
                    if (selRows.length > 0)
                        that._triggerEdit(selRows);
                    else
                        alert("请选择要编辑的行");
                };
            }

            if (buttons.length > 2 && buttons[2].onclick == null) {
                // trash button:
                buttons[2].onclick = function() {
                    that._hideInnerEdit();

                    var selRows = that._selectedRowsData();
                    if (selRows.length > 0)
                        that._triggerRemove(selRows);
                    else
                        alert("请选择要删除的行");
                };
            }

            if ( condOptions == null || condOptions.dvData == null ||
                Array.isArray(condOptions) )
            {
                condOptions = {
                    // dvFilters can be null.
                    dvData: condOptions
                };
            }
            this.innerEditPanel.render(
                this.domComponents[0],
                condOptions.dvFilters,
                condOptions.dvData
            );
        },

        _triggerEdit: function(editData) {
            if (editData == null) {
                editData = {};
            } else if ( Array.isArray(editData) ) {
                var dataObj = {};
                for (var i = 0; i < editData.length; ++i) {
                    for (var k in editData[i]) {
                        var val = editData[i][k];
                        if (dataObj[k] == null)
                            dataObj[k] = [val];
                        else if (dataObj[k].indexOf(val) < 0)
                            dataObj[k].push(val);
                    }
                }
                editData = dataObj;
            }

            this.innerDetailEdit.modelName = this._deAdapters.modelName;
            this.innerDetailEdit.isNew = TemplatedForm.isEmpty(editData);
            this.domComponents[3].style.display = "block";
            this.innerDetailEdit.attach(
                this.domComponents[3], this._deAdapters.binders, editData
            );
            this.innerDetailEdit.show(true, "editMode");
        },

        _triggerRefresh: function() {
            if (this.onSearch) {
                var pageIdx = 0;
                if (this.innerPageBar && this.innerPageBar.curPageIdx)
                    pageIdx = this.innerPageBar.curPageIdx - 1;

                this.onSearch(
                    this._deAdapters.modelName,
                    this.searchData,
                    this.pageSize,
                    pageIdx
                );
            }
        },

        _triggerRemove: function(delData) {
            if ( this.onDel && confirm("确定要删除吗？") )
                this.onDel(this._deAdapters.modelName, delData);
        },

        _selectedRowsData: function() {
            var ret = [];
            for (var i = 1; i < this.domCheckboxes.length; ++i) {
                if (this.domCheckboxes[i].checked)
                    ret.push(this.rowsData[i]);
            }
            return ret;
        },

        _colCheckbox: function(isHead, styleOrClass) {
            var that = this;

            return {
                propName: "_checkbox",
                format: function(rowData) {
                    var domCheckbox = document.createElement("input");
                    domCheckbox.type = "checkbox";
                    if (styleOrClass) {
                        TemplatedForm.setStyleOrClass(
                            domCheckbox, styleOrClass
                        );
                    }

                    if (isHead) {
                        domCheckbox.onclick = function() {
                            that._hideInnerEdit();

                            for (var i = 1; i < that.domCheckboxes.length; ++i)
                                that.domCheckboxes[i].checked = this.checked;
                        }
                    } else {
                        domCheckbox.onclick = function() {
                            that._hideInnerEdit();

                            if (!this.checked)
                                that.domCheckboxes[0].checked = false;
                        }
                    }

                    that.domCheckboxes.push(domCheckbox);
                    that.rowsData.push(rowData);

                    return function(domCell) {
                        domCell.appendChild(domCheckbox);
                    };
                },
                deformat: function() {
                    return null;
                }
            };
        },

        _colOperations: function(isHead, styleOrClasses) {
            var that = this;

            if (styleOrClasses == null)
                styleOrClasses = ["panel-btn-edit", "panel-btn-trash"];

            return {
                propName: "_operations",
                format: function(rowData) {
                    if (isHead)
                        return "操作";

                    var btnOperations = new EditPanel(null, [{
                        text: " 编辑",
                        styleOrClass: TemplatedForm.getRowStyle(
                            styleOrClasses, 0
                        ),
                        onclick: function() {
                            that._triggerEdit(rowData);
                        }
                    }, {
                        text: " 删除",
                        styleOrClass: TemplatedForm.getRowStyle(
                            styleOrClasses, 1
                        ),
                        onclick: function() {
                            that._hideInnerEdit();
                            that._triggerRemove(rowData);
                        }
                    }]);

                    return function(domCell) {
                        btnOperations.render(domCell);
                    };
                },
                deformat: function() {
                    return null;
                }
            };
        },

        _hideInnerEdit: function() {
            this.domComponents[3].style.display = "none";
            this.innerDetailEdit.show(false);
        }
    };
}
