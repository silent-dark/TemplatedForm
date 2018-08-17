if (window.SearchView == null) {
    window.SearchView = function(spAppearances, epAppearances, pbAppearances) {
        if (spAppearances.condOptions == null)
            spAppearances.condOptions = {};
        this.innerSearchPanel = new SearchPanel(
            spAppearances.condOptions, spAppearances.condAppearances
        );
        this.resultEditPanel = new EditPanel(
            epAppearances.dvAppearances,
            epAppearances.buttons? epAppearances.buttons: []
        );
        if (pbAppearances)
            this.innerPageBar = new PageBar(pbAppearances);

        this._condOptions = spAppearances.condOptions;
        this._resultAppearances = epAppearances;
        this._styleOrClasses = [
            spAppearances.condOptions.styleOrClass,
            epAppearances.styleOrClass,
            pbAppearances? pbAppearances.styleOrClass: ""
        ];

        var self = this;
        this.innerSearchPanel.onSearch = function(searchData) {
            if (searchData.modelName) {
                self._searchFor(searchData.modelName, searchData);
            } else if (self._condOptions.searchFieldNames) {
                for (var k in self._condOptions.searchFieldNames)
                    self._searchFor(k, searchData);
            } else {
                throw new TypeError("unknown modelName");
            }
        };
    };

    window.SearchView.prototype = {
        attach: function(container, showPages, pageSize, searchCond) {
            container = TemplatedForm.getDomElement(container);
            container.innerHTML = "";

            this.pageSize = pageSize;

            this.domComponents = [];
            for (var i = 0; i < 3; ++i) {
                var domComp = document.createElement("div");
                if (this._styleOrClasses[i]) {
                    TemplatedForm.setStyleOrClass(
                        domComp, this._styleOrClasses[i]
                    );
                }
                container.appendChild(domComp);
                this.domComponents.push(domComp);
            }

            this._renderSearchPanel(searchCond);

            this.domComponents[2].style.display = "none";
            if (this.innerPageBar) {
                var self = this;
                this.innerPageBar.render(
                    this.domComponents[2], 1, showPages, function() {
                        self.innerSearchPanel.doSearch();
                    }
                );
            }
        },

        refresh: function(queryResult, totalPages, searchCond) {
            if (searchCond)
                this._renderSearchPanel(searchCond);

            var self = this;
            this.domComponents[1].innerHTML = "";
            for (var k in queryResult) {
                queryResult[k].map(function(rec) {
                    self._createResultItem(k, rec);
                });
            }

            if (this.innerPageBar && totalPages > 1) {
                this.domComponents[2].style.display = "block";
                this.innerPageBar.setTotalPages(totalPages);
            } else {
                this.domComponents[2].style.display = "none";
            }
        },

        _renderSearchPanel: function(searchCond) {
            if (searchCond == null || searchCond.dvData == null) {
                searchCond = {
                    // dvFilters can be null.
                    dvData: searchCond? searchCond: {}
                };
            }

            this.innerSearchPanel.render(
                this.domComponents[0], searchCond.dvFilters, searchCond.dvData
            );
        },

        _searchFor: function(modelName, searchData) {
            if (this.onSearch) {
                var pageIdx = 0;
                if (this.innerPageBar && this.innerPageBar.curPageIdx)
                    pageIdx = this.innerPageBar.curPageIdx - 1;

                this.onSearch(
                    modelName,
                    Object.assign({
                        pageSize: this.pageSize? this.pageSize: 0,
                        page: pageIdx
                    }, {
                        cond: this._condFor(modelName, searchData)
                    })
                );
            }
        },

        _condFor: function (modelName, searchData) {
            var finalCond = [];
            var condNames = null;

            if (searchData.beginDate != searchData.endDate) {
                if (this._condOptions.dateFieldNames) {
                    condNames = this._condOptions.dateFieldNames[modelName];
                    if ( condNames && !Array.isArray(condNames) )
                        condNames = [condNames, condNames];
                }
                if (!condNames)
                    condNames = ["createdAt", "updatedAt"];

                finalCond = [
                    {"$gte": searchData.beginDate},
                    {"$lte": searchData.endDate}
                ];
                for (var i = 0; i < 2; ++i) {
                    var cond = {};
                    cond[ condNames[i] ] = finalCond[i];
                    finalCond[i] = cond;
                }
            }

            if (searchData.searchExp && this._condOptions.searchFieldNames) {
                if (searchData.fieldName)
                    condNames = [searchData.fieldName];
                else
                    condNames = this._condOptions.searchFieldNames[modelName];

                var keywords = searchData.searchExp.split(' ');
                keywords.map( function(kw) {
                    if (kw && condNames) {
                        var regexCond = [];
                        condNames.map(function(condKey) {
                            var cond = {};
                            cond[condKey] = {"$regex": kw, "$options": ""};
                            regexCond.push(cond);
                        });
                        if (regexCond.length > 1)
                            finalCond.push({"$or": regexCond});
                        else
                            finalCond.push(regexCond[0]);
                    }
                });
            }

            if (finalCond.length > 1)
                return {"$and": finalCond};
            if (finalCond.length == 1)
                return finalCond[0];
            return {};
        },

        _createResultItem: function (k, rec) {
            rec.resultName = this.onMakeResultName(k, rec);
            if (rec.resultName) {
                var domResultItem = document.createElement("div");
                if (this._resultAppearances.itemStyleOrClass) {
                    TemplatedForm.setStyleOrClass(
                        domResultItem, this._resultAppearances.itemStyleOrClass
                    );
                }
                var dvFilters = null;
                if (this._resultAppearances.resultFilters)
                    dvFilters = this._resultAppearances.resultFilters[k];
                this.resultEditPanel.render(domResultItem, dvFilters, rec);
                this.domComponents[1].appendChild(domResultItem);
            }
        },
    };
}
