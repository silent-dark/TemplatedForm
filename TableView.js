if (window.TableView == null) {
    window.TableView = function(appearances, tblStyleOrClass) {
        this._appearances = appearances;
        this._tblStyleOrClass = tblStyleOrClass;
    };

    window.TableView.prototype = {
        renderHead: function(container, headData) {
            var domTbl = document.createElement("table");
            if (this._tblStyleOrClass)
                TemplatedForm.setStyleOrClass(domTbl, this._tblStyleOrClass);

            var that = this;
            TemplatedForm.obj2array(headData).map(function(head){
                that._renderRow(head.appearanceIdx, domTbl, head.titles);
            });

            container = TemplatedForm.getDomElement(container);
            container.innerHTML = "";
            container.appendChild(domTbl);
        },

        append: function(container, appearanceIdx, data) {
            var domTbl = TemplatedForm.firstDomElement(
                container, function(target) {
                    return (target.tagName.toLowerCase() == "table");
                }
            );
            if (domTbl) {
                var that = this;
                TemplatedForm.obj2array(data).map(function(obj) {
                    that._renderRow(appearanceIdx, domTbl, obj);
                });
            }
        },

        extract: function(container, appearanceIdx, rowFilter, propNames) {
            var outData = [];
            this._query(
                container, appearanceIdx, rowFilter,
                function(rowData) {
                    if (propNames) {
                        var validData = {};
                        TemplatedForm.obj2array(propNames).map(
                            function(propName) {
                                validData[propName] = rowData[propName];
                            }
                        );

                        for (var k in rowData) {
                            if (validData[k] == null)
                                delete rowData[k];
                        }
                    }
                    if ( !TemplatedForm.isEmpty(rowData) )
                        outData.push(rowData);
                }
            );
            return outData;
        },

        remove: function(container, appearanceIdx, rowFilter) {
            this._query(
                container, appearanceIdx, rowFilter,
                function(rowData, domRow, domSec) {
                    domSec.deleteRow(domRow.sectionRowIndex);
                }
            );
        },

        update: function(container, appearanceIdx, rowFilter, dataObj) {
            var that = this;
            var appearance = this._appearances[appearanceIdx];
            this._query(
                container, appearanceIdx, rowFilter,
                function(rowData, domRow) {
                    for (var i = 0; i < domRow.cells.length; ++i) {
                        that._renderCellData(
                            domRow.cells[i],
                            appearance.columns[i],
                            dataObj,
                            domRow.sectionRowIndex
                        );
                    }
                }
            );
        },

        clear: function(container) {
            var domTbl = TemplatedForm.firstDomElement(
                container, function(target) {
                    return (target.tagName.toLowerCase() == "table");
                }
            );

            if (domTbl) {
                var domSec = domTbl.tBodies[0];
                if (domSec) {
                    while (domSec.rows.length)
                        domSec.deleteRow(0);
                }
            }
        },

        _renderRow: function(appearanceIdx, domSec, rowData) {
            var appearance = this._appearances[appearanceIdx];
            if (appearance.headAppearance) {
                if (domSec.tHead)
                    domSec = domSec.tHead;
                else
                    domSec = domSec.createTHead();
            } else {
                if (domSec.createTBody == null) {
                    domSec.prototype.createTBody = function() {
                        var domTBody = document.createElement("tbody");
                        this.appendChild(domTBody);
                        return domTBody;
                    };
                }
                if (domSec.tBodies.length > 0)
                    domSec = domSec.tBodies[0];
                else
                    domSec = domSec.createTBody();
            }
            var domRow = domSec.insertRow();
            var domCell = null;

            if (appearance.rowStyleOrClass) {
                TemplatedForm.setStyleOrClass(
                    domRow, TemplatedForm.getRowStyle(
                        appearance.rowStyleOrClass, domRow.sectionRowIndex
                    )
                );
            }

            var that = this;
            TemplatedForm.obj2array(appearance.columns).map(function(col) {
                if (appearance.headAppearance) {
                    domCell = document.createElement("th");
                    if (col.colSpan)
                        domCell.colSpan = col.colSpan;
                    domRow.appendChild(domCell);
                } else {
                    domCell = domRow.insertCell();
                }

                if (col.styleOrClass)
                    TemplatedForm.setStyleOrClass(domCell, col.styleOrClass);

                if (col.hidable)
                    domCell.style.display = "none";

                that._renderCellData(
                    domCell, col, rowData, domRow.sectionRowIndex
                );
            });
        },

        _renderCellData: function(domCell, col, rowData, rowIdx) {
            var cellData = "";
            if (col.format) {
                if (col.format.call)
                    cellData = col.format(rowData, col.propName, rowIdx);
                else
                    console.error("不支持指定的format");
            } else {
                cellData = TemplatedForm.refProp(rowData, col.propName);
            }

            if (cellData == null)
                console.log(
                    new ReferenceError(col.propName + " is undefined!")
                );
            else if (cellData.call)
                cellData(domCell);
            else if (col.useHTML)
                domCell.innerHTML = cellData;
            else if (domCell.textContent == null)
                domCell.innerText = cellData;
            else
                domCell.textContent = cellData;
        },

        _query: function(container, appearanceIdx, rowFilter, cbTodo) {
            var domTbl = TemplatedForm.firstDomElement(
                container, function(target) {
                    return (target.tagName.toLowerCase() == "table");
                }
            );
            if (domTbl) {
                var befGetRowData = function() {
                    return true;
                };
                var aftGetRowData = function() {
                    return true;
                };
                if (rowFilter) {
                    if (rowFilter.call) {
                        aftGetRowData = rowFilter;
                    } else if ( Array.isArray(rowFilter) ) {
                        befGetRowData = function(rowIdx) {
                            for (var i = 0; i < rowFilter.length; ++i) {
                                if (rowIdx == rowFilter[i])
                                    return true;
                            }
                            return false;
                        };
                    } else {
                        befGetRowData = function(rowIdx) {
                            return (rowIdx == rowFilter);
                        };
                    }
                }

                var appearance = this._appearances[appearanceIdx];
                var domSec = domTbl.tBodies[0];
                for (var y = 0; y < domSec.rows.length; ++y) {
                    if ( befGetRowData(y) ) {
                        var domRow = domSec.rows[y];
                        var rowData = {};
                        for (var x = 0; x < domRow.cells.length; ++x) {
                            var col = appearance.columns[x];
                            var domCell = domRow.cells[x];
                            var cellData = null;
                            if (col.deformat) {
                                cellData = col.deformat(domCell);
                            } else {
                                cellData = domCell.textContent;
                                if (cellData == null)
                                    cellData = domCell.innerText;
                            }
                            if (cellData != null) {
                                TemplatedForm.refProp(
                                    rowData, col.propName, cellData
                                );
                            }
                        }
                        if ( aftGetRowData(rowData, y) )
                            cbTodo(rowData, domRow, domSec);
                    }
                }
            }
        }
    };
}
