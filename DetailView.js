if (window.DetailView == null) {
    window.DetailView = function(appearances) {
        appearances = TemplatedForm.obj2array(appearances);
        this.defaultAppearance = appearances[0].name;

        this._appearances = {};
        for (var i = 0; i < appearances.length; ++i)
            this._appearances[ appearances[i].name ] = appearances[i];
    };

    window.DetailView.prototype = {

        RENDEREDATTR: "detail-view-rendered",

        BOUNDPROP: "bound-prop",

        regAppearance: function(name, appearance, baseName) {
            if (baseName) {
                var baseAppearance = this._appearances[baseName];
                if (baseAppearance) {
                    appearance = TemplatedForm.deepAssign(
                        JSON.parse( JSON.stringify(baseAppearance) ),
                        appearance
                    );
                }
            }
            this._appearances[name] = appearance;
        },

        /**
         *
         * 数据渲染方法，无返回值。若重复调用此函数，则重新渲染整个区域
         *
         * @param dataObj {Object} 需要被渲染的输入数据。
         * @param filters {Array} 数据过滤器，数组中的每个对象结构如下：
         * {
            propName: String,           // 需要被渲染的输入数据property名称，可以是某个下级子对象的property名称（即"xxx.yyy"）。
            appearance: String,         // 外观名称。
            label: String,              // 可选，标签内容。
            display: String,            // 可选，渲染出的DOM-ELmenent的style.display属性。
            injectable: Boolean,        // 可选，当propName指定的property名称在dataObj中不存在时，如果该参数为true，会自动向dataObj中
                                        //      注入propName指定的property（值为""）；如果为false，则忽略并继续渲染其它数据。默认为false。
           }
         * @param container {String/DOM Element}
         *
        **/
        render: function(container, filters, dataObj) {
            dataObj = TemplatedForm.obj2array(dataObj);

            if (filters == null) {
                filters = [];
                for (var k in dataObj[0]) {
                    filters.push({
                        propName: k,
                        appearance: this.defaultAppearance,
                    });
                }
            } else {
                filters = TemplatedForm.obj2array(filters);
            }

            container = TemplatedForm.getDomElement(container);
            container.innerHTML = "";

            for (var i = 0; i < dataObj.length; ++i) {
                for (var j = 0; j < filters.length; j++) {
                    var domItem = this._buildDOMString(filters[j], dataObj[i]);
                    if (domItem)
                        container.appendChild(domItem);
                }
            }
            container.setAttribute(this.RENDEREDATTR, "true");
        },

        /**
         *
         * 构建DOMElement, 返回DOMElement.
         * @param data {Object} 数据对象
         * @param filter {Object} 外观对象。
         * @return {DOMElement}
         *
        **/
        _buildDOMString: function(filter, dataObj) {
            var appearance = this._appearances[filter.appearance];
            if (!appearance) {
                throw new ReferenceError(
                    "unregistered appearance: " + filter.appearance
                );
            }

            var itemElement = document.createElement("div");
            if (appearance.styleOrClass) {
                TemplatedForm.setStyleOrClass(
                    itemElement, appearance.styleOrClass
                );
            }
            if (filter.display)
                itemElement.style.display = filter.display;

            // 构建label元素
            if (filter.label) {
                var labelElement = document.createElement("span");
                if (appearance.labelStyleOrClass) {
                    TemplatedForm.setStyleOrClass(
                        labelElement, appearance.labelStyleOrClass
                    );
                }

                var text = (filter.required)? '*' + filter.label: filter.label;
                if (labelElement.textContent == null)
                    labelElement.innerText = text;
                else
                    labelElement.textContent = text;

                itemElement.appendChild(labelElement);
            }

            // 构建数据元素
            if (appearance.valueAppearance == null)
                appearance.valueAppearance = {};
            if (appearance.valueAppearance.tagName == null)
                appearance.valueAppearance.tagName = "span";
            var dataElement = document.createElement(
                appearance.valueAppearance.tagName
            );
            if (appearance.valueAppearance.styleOrClass) {
                TemplatedForm.setStyleOrClass(
                    dataElement, appearance.valueAppearance.styleOrClass
                );
            }

            if (appearance.valueAppearance.propOrAttr) {
                for (var p in appearance.valueAppearance.propOrAttr) {
                    var propValue = appearance.valueAppearance.propOrAttr[p];
                    if (propValue.call) {
                        // TemplatedForm.addEvent(dataElement, p, propValue);
                        dataElement[p] = propValue;
                    } else {
                        TemplatedForm.refPropOrAttr(dataElement, p, propValue);
                    }
                }
            }

            var dataValue = TemplatedForm.refProp(dataObj, filter.propName);
            if (dataValue == null) {
                if (!filter.injectable)
                    return null;
                TemplatedForm.refProp(dataObj, filter.propName, "");
                dataValue = "";
            }

            if (dataElement.disabled != null)
                dataElement.disabled = (filter.uneditable && dataValue);

            if (appearance.format) {
                if (appearance.format.call)
                    dataValue = appearance.format(dataObj, filter.propName);
                else
                    console.error("不支持指定的format");
            }

            if (appearance.valueAppearance.bind == null) {
                if (dataElement.textContent == null)
                    appearance.valueAppearance.bind = "innerText";
                else
                    appearance.valueAppearance.bind = "textContent";
            }

            if (dataValue == null) {
                console.log(
                    new ReferenceError(filter.propName + " is undefined!")
                );
            } else if (dataValue.call) {
                dataValue(dataElement);
            } else {
                TemplatedForm.refPropOrAttr(
                    dataElement, appearance.valueAppearance.bind, dataValue
                );
            }

            if (appearance.deformat)
                dataElement.deformat = appearance.deformat;

            dataElement.setAttribute(
                this.BOUNDPROP,
                filter.propName + ':' + appearance.valueAppearance.bind
            );

            itemElement.appendChild(dataElement);
            return itemElement;
        },

        _outArray: null,
        _outData: null,
        _loopBoundProp: function(element, befSetProp) {
            if (element.childNodes) {
                for (var i = 0; i < element.childNodes.length; ++i) {
                    var childElement = element.childNodes[i];
                    if ( childElement.hasAttribute &&
                        childElement.hasAttribute(this.BOUNDPROP) )
                    {
                        var boundPair = childElement.getAttribute(
                            this.BOUNDPROP
                        ).split(':');

                        if ( befSetProp(boundPair[0]) ) {
                            if (childElement.deformat) {
                                boundPair[1] = childElement.deformat(
                                    childElement
                                );
                            } else {
                                boundPair[1] = TemplatedForm.refPropOrAttr(
                                    childElement, boundPair[1]
                                );
                            }

                            if ( TemplatedForm.refProp(
                                this._outData, boundPair[0]) != null)
                            {
                                this._outArray.push(this._outData);
                                this._outData = {};
                            }

                            if (boundPair[1] && typeof boundPair[1] == "string")
                                boundPair[1] = boundPair[1].trim();

                            TemplatedForm.refProp(
                                this._outData, boundPair[0], boundPair[1]
                            );
                        }
                    } else {
                        this._loopBoundProp(childElement, befSetProp);
                    }
                }
            }
        },

        /**
         *
         * 提取container中的下级DOM-ELmenent的某个属性值，并以Object类型返回
         * @param container {String/DOM Element} 提取的目标容器，可以是id或DOM-Element对象。
         * @return {Object}
         *
        **/
        extract: function(container, propNames) {
            container = TemplatedForm.getDomElement(container);

            if (!container.hasAttribute(this.RENDEREDATTR)) {
                console.error("容器还未绑定数据");
                return null;
            }

            var befSetProp = function() {
                return true;
            };
            if (propNames) {
                propNames = TemplatedForm.obj2array(propNames);

                befSetProp = function(boundProp) {
                    for (var i = 0; i < propNames.length; ++i) {
                        if (boundProp == propNames[i])
                            return true;
                    }
                    return false;
                }
            }

            this._outArray = [];
            this._outData = {};
            this._loopBoundProp(container, befSetProp);

            if (this._outArray.length > 0) {
                this._outArray.push(this._outData);
                return this._outArray;
            }
            return this._outData;
        }
    };
}
