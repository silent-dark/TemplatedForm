if (window.DetailEditList == null) {
    window.DetailEditList = function(
        deAppearances, epAppearances, pbAppearances)
    {
        if (epAppearances) {
            this.innerEditPanel = new EditPanel(
                epAppearances.dvAppearances, epAppearances.btnAppearances
            );
        }
        if (pbAppearances)
            this.innerPageBar = new PageBar(pbAppearances);

        this._deAppearances = deAppearances;
        this._styleOrClasses = [
            epAppearances? epAppearances.styleOrClass: "",
            deAppearances.styleOrClass,
            pbAppearances? pbAppearances.styleOrClass: ""
        ];
    };

    window.DetailEditList.prototype = {
        attach: function(
            container, searchModel, showPages, pageSize, condOptions)
        {
            this._container = TemplatedForm.getDomElement(container);
            this._container.innerHTML = "";

            this.searchModel = searchModel;
            this.pageSize = pageSize;

            this.domComponents = [];
            for (var i = 0; i < 3; ++i) {
                var domComp = document.createElement("div");
                if (this._styleOrClasses[i]) {
                    TemplatedForm.setStyleOrClass(
                        domComp, this._styleOrClasses[i]
                    );
                }
                domComp.style.display = "none";
                this._container.appendChild(domComp);
                this.domComponents.push(domComp);
            }

            this._renderCondView(condOptions);

            if (this.innerPageBar) {
                var that = this;
                this.innerPageBar.render(
                    this.domComponents[2], 1, showPages, function() {
                        that._triggerRefresh();
                    }
                );
            }
        },

        refresh: function(listData, totalPages, condOptions) {
            if (condOptions)
                this._renderCondView(condOptions);

            if (listData) {
                this.domComponents[1].style.display = "block";
                this.domComponents[1].innerHTML = "";

                listData = TemplatedForm.obj2array(listData);
                var isAdd = (listData.length == 0);
                if (isAdd)
                    listData.push({});

                var that = this;
                listData.map(function(obj) {
                    that._triggerEdit(obj, isAdd);
                })
            }

            if (totalPages > 1 && this.innerPageBar) {
                this.domComponents[2].style.display = "block";
                if (!this._container.style.height) {
                    this._container.style.height = (
                        this._container.clientHeight + 10 +
                        this.domComponents[2].clientHeight
                    ).toString() + "px";
                }
                this.innerPageBar.setTotalPages(totalPages);
            } else {
                this.domComponents[2].style.display = "none";
                this._container.style.height = "";
            }
        },

        _renderCondView: function(condOptions) {
            if (this.innerEditPanel) {
                if ( condOptions == null || condOptions.dvData == null ||
                    Array.isArray(condOptions) )
                {
                    condOptions = {
                        // dvFilters can be null.
                        dvData: condOptions
                    };
                }

                var that = this;
                var buttons = this.innerEditPanel._buttons;
                if (buttons.length > 0 && buttons[0].onclick == null) {
                    // add button:
                    buttons[0].onclick = function() {
                        that.detailEdit.isAdd = true;
                        that.detailEdit.show(true, true);
                    };
                }

                this.domComponents[0].style.display = "block";
                this.innerEditPanel.render(
                    this.domComponents[0],
                    condOptions.dvFilters,
                    condOptions.dvData
                );
            }
        },

        _triggerRefresh: function() {
            if (this.onSearch) {
                var searchData = {};
                if (this.innerEditPanel) {
                    searchData = this.innerEditPanel.extract(
                        this.domComponents[0]
                    );
                }

                var pageIdx = 0;
                if (this.innerPageBar && this.innerPageBar.curPageIdx)
                    pageIdx = this.innerPageBar.curPageIdx - 1;

                this.onSearch(
                    this.searchModel,
                    searchData,
                    this.pageSize,
                    pageIdx
                );
            }
        },

        _triggerEdit: function(obj, isAdd) {
            var deAdapter = this._findDetailEditAdapter(obj);
            if (deAdapter) {
                this._createDetailEdit(deAdapter, obj, isAdd);
            } else {
                throw new TypeError(
                    "can't create DetailEdit with data:\n" +
                    JSON.stringify(obj)
                );
            }
        },

        _findDetailEditAdapter: function(dataObj) {
            var deAdapters = TemplatedForm.obj2array(
                this._deAppearances.adapters
            );
            for (var i = 0; i < deAdapters.length; ++i) {
                var found = deAdapters[i];
                var dvFilters = TemplatedForm.obj2array(
                    found.binders[0].dataFilters
                );
                for (var j = 0; j < dvFilters.length; ++j) {
                    var filter = dvFilters[j];
                    if (!filter.injectable &&
                        TemplatedForm.refProp(dataObj, filter.propName) == null)
                    {
                        found = null;
                        break;
                    }
                }
                if (found)
                    return found;
            }
            return null;
        },

        _createDetailEdit: function(deAdapter, dataObj, isAdd) {
            var that = this;

            var domDetailEdit = document.createElement("div");
            if (deAdapter.styleOrClass) {
                TemplatedForm.setStyleOrClass(
                    domDetailEdit, deAdapter.styleOrClass
                );
            }
            this.domComponents[1].appendChild(domDetailEdit);

            this.detailEdit = new DetailEdit(
                this._deAppearances.dvAppearances,
                this._deAppearances.ebAppearances
            );
            this.detailEdit.attach(
                domDetailEdit, deAdapter.binders, dataObj
            );
            this.detailEdit.isAdd = isAdd;
            this.detailEdit.onSave = function(obj, curData) {
                if (this.isAdd) {
                    this.isAdd = false;
                    if (that.onAdd)
                        that.onAdd(deAdapter.modelName, obj);
                } else if (that.onMod) {
                    that.onMod(deAdapter.modelName, obj, curData);
                }
            };
            this.detailEdit.onDel = function(obj) {
                if (that.innerPageBar && that.innerPageBar.curPageIdx > 0)
                    --(that.innerPageBar.curPageIdx);

                if (that.onDel)
                    that.onDel(deAdapter.modelName, obj);
            };
            this.detailEdit.onCancel = function() {
            }
            this.detailEdit.show(true, isAdd);
        }
    };
}
