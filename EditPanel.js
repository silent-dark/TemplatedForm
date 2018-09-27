if (window.EditPanel == null) {
    window.EditPanel = function(dvAppearances, buttons) {
        if (dvAppearances)
            this.innerDetailView = new DetailView(dvAppearances);
        if (buttons)
            this._buttons = TemplatedForm.obj2array(buttons);
    };

    window.EditPanel.prototype = {
        render: function(container, dvFilters, dvData) {
            container = TemplatedForm.getDomElement(container);
            container.innerHTML = "";

            if (this.innerDetailView && dvFilters && dvData)
                this.innerDetailView.render(container, dvFilters, dvData);

            if (this._buttons) {
                this._buttons.map(function(btn, i) {
                    btn.domBtn = document.createElement("a");
                    btn.domBtn.href = "#";
                    if (btn.styleOrClass) {
                        TemplatedForm.setStyleOrClass(
                            btn.domBtn, btn.styleOrClass
                        );
                    }
                    if (btn.text) {
                        if (btn.domBtn.textContent)
                            btn.domBtn.textContent = btn.text;
                        else
                            btn.domBtn.innerText = btn.text;
                    }
                    if (btn.onclick) {
                        btn.domBtn.onclick = function() {
                            btn.onclick.call(this, i);
                        };
                    }
                    container.appendChild(btn.domBtn);
                });
            }
        },

        extract: function(container, propNames) {
            if (this.innerDetailView)
                return this.innerDetailView.extract(container, propNames);
            return {};
        }
    };
}
