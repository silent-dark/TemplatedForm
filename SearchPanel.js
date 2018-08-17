if (window.SearchPanel == null) {
    window.SearchPanel = function(condOptions, condAppearances) {
        var that = this;

        var dvAppearances = searchViewAppearances(condOptions);
        if (condAppearances)
            dvAppearances = dvAppearances.concat(condAppearances);

        this.innerEditPanel = new EditPanel(dvAppearances, {
            styleOrClass: condOptions.btnStyleOrClass,
            text: "搜索",
            onclick: function() {
                that.doSearch();
            }
        });
    }

    window.SearchPanel.prototype = {
        render: function(container, dvFilters, dvData) {
            var innerFilters = [{
                propName: "beginDate",
                label: "时间",
                appearance: "searchDate",
                injectable: true
            }, {
                propName: "endDate",
                label: "至",
                appearance: "searchDate",
                injectable: true
            }, {
                propName: "searchExp",
                label: " ",
                appearance: "searchInput",
                injectable: true
            }];

            if (dvFilters)
                innerFilters = dvFilters.concat(innerFilters);
            this.innerEditPanel.render(container, innerFilters, dvData);
            this._container = container;
        },

        doSearch: function() {
            if (this.onSearch && this._container)
                this.onSearch( this.innerEditPanel.extract(this._container) );
        }
    };
}
