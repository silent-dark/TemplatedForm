// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module for templating view layer.

var GLOBAL = window;
if (GLOBAL.TemplatedForm == null)(function() {
    var TemplatedForm = {
        DOCX: document
    };

    // @param target - the element id or object.
    TemplatedForm.getDomElement = function(target) {
        return(
            target instanceof Element || target.getAttribute
        ) ? target : this.DOCX.getElementById(target);
    };

    TemplatedForm.firstDomElement = function(target, cbCond) {
        target = this.getDomElement(target);
        if ( cbCond(target) )
            return target;

        var travel = function(item) {
            var children = item.childNodes;
            var i = 0;
            while (i < children.length) {
                if ( cbCond(children[i]) )
                    return children[i];
                ++i;
            }
            for (i = 0; i < children.length; ++i) {
                item = travel(children[i]);
                if (item)
                    return item;
            }
            return null;
        };
        return travel(target);
    };

    // @param length - the length of the random string.
    TemplatedForm.randomString = function(length) {
        const kAvailableChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var ret = "";
        for (var i = 0; i < length; ++i) {
            var x = Math.floor(Math.random() * kAvailableChars.length);
            ret += kAvailableChars.charAt(x);
        }
        return ret;
    };

    // @param target - the object or array for check.
    TemplatedForm.isEmpty = function(target) {
        if ( Array.isArray(target) )
            return(target.length == 0);
        for (var k in target)
            return false;
        return true;
    };

    // @param path - the path for getting parent.
    TemplatedForm.parentPath = function(path) {
        var i = path.length - 1;
        while ( path.charAt(i) == '/' ) --i;
        return path.substr( 0, path.lastIndexOf('/', i) );
    };

    // @param target - the JS object for getting/setting the value.
    // @param refPath - the ref-path of the value.
    // [@param propVal] - the property value.
    TemplatedForm.refProp = function(target, refPath, propVal) {
        var subNames = refPath.split('.');
        var obj = target;
        var k = subNames[0];
        for (var i = 1; i < subNames.length; ++i) {
            if (obj[k] == null) {
                if (propVal == null)
                    return null;
                obj[k] = {};
            }
            obj = obj[k];
            k = subNames[i];
        }
        if (propVal != null)
            obj[k] = propVal;
        return obj[k];
    };

    TemplatedForm.refPropOrAttr = function(element, name, val) {
        if (name[0] == '@') {
            name = name.substr(1);
            if (val != null)
                element.setAttribute(name, val);
            return element.getAttribute(name);
        }
        return this.refProp(element, name, val);
    };

    TemplatedForm.addEvent = function(element, type, func) {
        if (element.addEventListener)
            element.addEventListener(type, func, false);
        else if (element.attachEvent)
            element.attachEvent('on' + type, func, false);
    };

    TemplatedForm.setStyleOrClass = function(element, val) {
        if ( val && (val.indexOf(';') > -1 || val.indexOf(':') > -1) )
            element.setAttribute("style", val);
        else
            element.className = val;
    };

    TemplatedForm.deepAssign = function(dst, src) {
        for (var k in src) {
            if (src[k] != null && typeof src[k] == "object") {
                if (dst[k] == null || typeof dst[k] != "object")
                    dst[k] = {};
                this.deepAssign(dst[k], src[k]);
                continue;
            }
            dst[k] = src[k];
        }
        return dst;
    };

    TemplatedForm.obj2array = function(obj) {
        return Array.isArray(obj)? obj: [obj];
    };
    // @param obj - the object for convert.
    // @param outHtml - the out element for convert.
    TemplatedForm.obj2html = function(obj, outHtml) {
        for (var tagName in obj) {
            if (tagName === '$') {
                for (var attrName in obj['$']) {
                    var attrVal = obj['$'][attrName];
                    if (attrName === "text") {
                        outHtml.textContent = attrVal;
                    } else {
                        if (typeof attrVal === "function") {
                            var func = '$' + this.randomString(12);
                            GLOBAL[func] = attrVal;
                            attrVal = func + ".apply(this,arguments);";
                        }
                        outHtml.setAttribute(attrName, attrVal);
                    }
                }
            } else {
                var objArgs = this.obj2array(obj[tagName]);
                for (var i = 0; i < objArgs.length; ++i) {
                    var subNode = this.DOCX.createElement(tagName);
                    this.obj2html(objArgs[i], subNode);
                    outHtml.appendChild(subNode);
                }
            }
        }
    };

    // @param tpl - the template id or element.
    // [@param onAddDomItem] - the callback function(dataObj, dataIdx) when add
    //                         multiple elements.
    // [@param fieldNameAlias] - for naming an alias of 'fieldName' attribute.
    var Form = function(tpl, onAddDomItem, fieldNameAlias) {
        this.domTpl = TemplatedForm.getDomElement(tpl);
        this.domItems = null;
        //this.onAddDomItem = function(dataObj, i) {
        //    // use this.domItems[i] for getting the dom object;
        //};
        if (onAddDomItem && onAddDomItem.call == null) {
            fieldNameAlias = onAddDomItem;
            onAddDomItem = null;
        }
        this.onAddDomItem = onAddDomItem;
        this.fieldNameAlias = fieldNameAlias ? fieldNameAlias : "fieldName";
        this.valAttrEvals = {};
    };

    // @param domObj - the element of the default evaluator.
    Form.prototype.defaultValAttrEval = function(domObj) {
        var kDefaultValAttrEvals = ["value", "textContent", "innerHTML"];
        for (var i = 0; i < kDefaultValAttrEvals.length; ++i) {
            if (domObj[kDefaultValAttrEvals[i]] != null)
                return kDefaultValAttrEvals[i];
        }
        return null;
    };

    // @param target - the element for getting/setting the attribute.
    // @param fieldPair - the field name or pair for getting the evaluator.
    // [@param attrVal] - the value of the attribute.
    Form.prototype.valAttrData = function(target, fieldPair, attrVal) {
        var pairItems = (
            typeof fieldPair === "string"
        ) ? fieldPair.split(':') : fieldPair;
        var attrEval = (
            pairItems.length > 1 && pairItems[1] !== "function"
        ) ? pairItems[1] : this.valAttrEvals[pairItems[0]];
        if (attrEval) {
            if (attrEval.call == null && target.getAttribute(attrEval) != null) {
                var attrName = attrEval;
                attrEval = function(attrVal) {
                    if (attrVal == null)
                        return target.getAttribute(attrName);   // get
                    else
                        target.setAttribute(attrName, attrVal); // set
                };
            }
        } else {
            attrEval = this.defaultValAttrEval(target);
        }
        return(
            attrEval.call
        ) ? attrEval.call(target, attrVal) : TemplatedForm.refProp(
            target, attrEval, attrVal
        );
    };

    // @param domObj - the element for getting/setting form data.
    // @param cb - the callback for getting/setting form data.
    Form.prototype.mapping = function(domObj, cb) {
        if (domObj instanceof Element || domObj.getAttribute) {
            var fieldMapping = domObj.getAttribute(this.fieldNameAlias);
            if (fieldMapping) {
                var fieldPairs = fieldMapping.split(';');
                for (var i = 0; i < fieldPairs.length; ++i) {
                    if (fieldPairs[i])
                        cb.call( this, domObj, fieldPairs[i].split(':') );
                }
            }
            if ( domObj.hasChildNodes() ) {
                for (var subNode = domObj.firstChild; subNode; subNode = subNode.nextSibling)
                    this.mapping(subNode, cb);
            }
        }
    };

    // @param domTpl - the element for getting/setting form data.
    // @param dataObj - the data object for getting/setting form data.
    Form.prototype.mappingData = function(domTpl, dataObj) {
        if (dataObj == null) {
            // get:
            var outObj = {};
            this.mapping(domTpl, function(domObj, pairItems) {
                if (TemplatedForm.refProp(outObj, pairItems[0]) != null)
                    throw TypeError("array is unsupported!");
                TemplatedForm.refProp(
                    outObj, pairItems[0], this.valAttrData(domObj, pairItems)
                );
            });
            return outObj;
        } else {
            // set:
            if (this.domItems == null)
                this.domItems = [domTpl];
            this.mapping(domTpl, function(domObj, pairItems) {
                this.valAttrData(
                    domObj, pairItems,
                    TemplatedForm.refProp(dataObj, pairItems[0])
                );
            });
        }
    };

    // @param domTpl - the element for setting form data.
    // @param dataArray - the data array for setting form data.
    Form.prototype.mappingArray = function(domTpl, dataArray) {
        // reset owner:
        var domOwner = domTpl.parentNode;
        var subNode = domOwner.lastChild;
        for (var nextNode = null; subNode && subNode != domTpl; subNode = nextNode) {
            nextNode = subNode.previousSibling;
            domOwner.removeChild(subNode);
        }
        // >>>>>>>>>>>> done.
        var domItem = domTpl;
        this.domItems = new Array(dataArray.length);
        for (var i = 0; i < dataArray.length; ++i) {
            if (i > 0) {
                domItem = domTpl.cloneNode(true);
                domItem.removeAttribute("id");
            }
            this.mappingData(domItem, dataArray[i]);
            this.domItems[i] = domItem;
            if (this.onAddDomItem)
                this.onAddDomItem.call(this, dataArray[i], i);
            if (i > 0)
                domOwner.appendChild(domItem);
        }
    };

    // [@param dataArg] - the data object for setting form data or the index for
    //                    getting form data.
    Form.prototype.formData = function(dataArg) {
        if (dataArg == null)
            return this.mappingData(this.domTpl);
        else if ( Array.isArray(dataArg) )
            this.mappingArray(this.domTpl, dataArg);
        else if (typeof dataArg === "number")
            return this.mappingData(this.domItems[dataArg]);
        else
            this.mappingData(this.domTpl, dataArg);
    };

    // @param container - the container id or element.
    // @param tplConstructor - the template object or construction function.
    // [@param tplArgs] - the args for constructing the template, ignore if
    //                    tplConstructor is object.
    // [@param fieldNameAlias] - for naming an alias of 'fieldName' attribute.
    var Template = function(container, tplConstructor, tplArgs, fieldNameAlias) {
        if (tplConstructor.call) {
            this.tplObj = {};
            tplConstructor.call(this.tplObj, tplArgs);
        } else {
            this.tplObj = tplConstructor;
            fieldNameAlias = tplArgs;
            tplArgs = undefined;
        }
        fieldNameAlias = new Array().concat(
            fieldNameAlias ? fieldNameAlias : "fieldName"
        );
        this.forms = new Array(fieldNameAlias.length);
        for (var i = 0; i < fieldNameAlias.length; ++i)
            this.forms[i] = new Form(container, fieldNameAlias[i]);
    };

    // @param reset - indicates if clear the innerHTML of the container.
    Template.prototype.init = function(reset) {
        var domTpl = this.forms[0].domTpl;
        if (reset)
            domTpl.innerHTML = "";
        TemplatedForm.obj2html(this.tplObj, domTpl);
    };

    // @param tpl - the template for load.
    // @param pathAttr - the attribute name of the file path.
    // [@param onLoad] - the callback on load.
    // [@param container] - the container for load.
    TemplatedForm.dynamicLoad = function(tpl, pathAttr, onLoad, container) {
        var tagName = Object.keys(tpl)[0];
        var tplAttr = tpl[tagName].$;
        var filePath = tplAttr[pathAttr];
        var s = filePath.lastIndexOf('/') + 1;
        var fileName = (s > 0) ? filePath.substr(s) : filePath;
        var domLoaded = this.DOCX.getElementsByTagName(tagName);
        for (var i = domLoaded.length - 1; i > -1; --i) {
            var loadedPath = domLoaded[i][pathAttr];
            s = loadedPath.lastIndexOf('/') + 1;
            var loadedFile = (s > 0) ? loadedPath.substr(s) : loadedPath;
            s = loadedFile.indexOf('?');
            if (s > -1)
                loadedFile = loadedFile.substr(0, s);
            if (fileName === loadedFile && domLoaded[i].loaded) {
                // loaded:
                tagName = null;
                break;
            }
        }
        if (tagName) {
            if (container == null)
                container = this.DOCX.head;
            tplAttr[pathAttr] += "?_=" + this.randomString(12);
            tplAttr.onload = function() {
                this.loaded = true;
                if (onLoad)
                    onLoad.call(this);
            }
            this.obj2html(tpl, container);
        } else if (onLoad) {
            // set timeout to avoid dead-loop.
            setTimeout(onLoad);
        }
    };

    // @param filePath - the file path for load.
    // [@param onLoad] - the callback on load.
    // [@param container] - the container for load.
    TemplatedForm.loadCSS = function(filePath, onLoad, container) {
        this.dynamicLoad({
            link: {
                $: {
                    rel: "stylesheet",
                    href: filePath
                }
            }
        }, "href", onLoad, container);
    };

    // @param filePath - the file path for load.
    // [@param onLoad] - the callback on load.
    // [@param container] - the container for load.
    TemplatedForm.loadJS = function(filePath, onLoad, container) {
        this.dynamicLoad({
            script: {
                $: {
                    type: "text/javascript",
                    src: filePath
                }
            }
        }, "src", onLoad, container);
    };

    // @param layoutDef - definitions of layout: {
    //    moduleName: String, // optional, the module name or callback
    //                           function(thisDom).
    //    trigger: String,    // optional, the trigger event name, such as
    //                           onload/onclick/...
    //    cssFile: String,    // optional, dynamic load css file.
    //    jsFile: String,     // optional, dynamic load js file.
    //    id: String,         // optional, the id of target div.
    //    className: String,  // optional, the class of target div.
    //    style: String,      // optional, the style of target div.
    //    text:String         // optional, the text of target div.
    // }
    // @param container - the container id or element.
    TemplatedForm.layout = function(layoutDef, container) {
        var err = new TypeError("");
        var self = this;
        var tpl = new TemplatedForm.Template(container, {
            div: {
                $: {
                    fieldName: "moduleName;cssFile;jsFile;id:id;className:className;style:style;text;trigger"
                }
            }
        });
        tpl.init(true);
        var tplForm = tpl.forms[0];
        tplForm.domTpl = tplForm.domTpl.lastChild;
        tplForm.valAttrEvals["moduleName"] = function(module) {
            if (module) {
                var domDiv = this;
                domDiv.invokeModule = function() {
                    err.message = "invoke '" + module.toString() + "' failed! ";
                    try {
                        switch (typeof module) {
                            case "string":
                                eval(module)(domDiv);
                                break;
                            case "function":
                                module(domDiv);
                                break;
                            default:
                                console.log(err);
                        }
                    } catch(e) {
                        console.log(err);
                        console.log(e);
                    }
                };
            }
        };
        tplForm.valAttrEvals["cssFile"] = function(filePath) {
            if (filePath)
                self.loadCSS(filePath);
        };
        tplForm.valAttrEvals["jsFile"] = function(filePath) {
            if (filePath)
                this.myJS = filePath;
        };
        tplForm.valAttrEvals["trigger"] = function(eventName) {
            var domDiv = this;
            if (eventName && eventName !== "onload") {
                var regEvent = function() {
                    if (domDiv.invokeModule)
                        domDiv[eventName] = domDiv.invokeModule;
                };
                if (domDiv.myJS)
                    self.loadJS(domDiv.myJS, regEvent);
                else
                    regEvent();
            } else {
                if (domDiv.myJS)
                    self.loadJS(domDiv.myJS, domDiv.invokeModule);
                else if (domDiv.invokeModule)
                    setTimeout(domDiv.invokeModule); // to avoid dead-loop.
            }
        };
        tplForm.formData(layoutDef);
    };

    TemplatedForm.getRowStyle = function(styleClass, rowNum) {
        return Array.isArray(styleClass) ? styleClass[rowNum % styleClass.length] : styleClass;
    }
    // @param listData - the data for render.
    // @param styles - the styles: {
    //    itemStyle: String,    // the class name of list-item.
    //    itemStyleSel: String, // the class name of selected list-item.
    //    fieldMap: String,     // the pairs of fieldName.
    //    isTiled: Boolean,     // indicates if the list is tiled.
    // }
    // @param container - the container id or element.
    // [@param callbacks] - the callbacks: {
    //    onBefInit: function(styles),  // should return tplArgs.
    //    onBefRender: function(),      // should return domTpl.
    //    onSel: function(nextStep)
    // }
    // [@param listTpl] - the tpl constructor (function).
    var ListView = function(listData, styles, container, callbacks, listTpl) {
        if (callbacks == null)
            callbacks = {};
        if (listTpl == null) {
            listTpl = function(tplArgs) {
                this.div = {
                    $: {
                        fieldName: tplArgs.fieldMap,
                        'class': TemplatedForm.getRowStyle(
                            tplArgs.itemStyle, 0
                        ),
                        onclick: tplArgs.onSetSelIdx
                    }
                };
                if (tplArgs.isTiled)
                    this.div.$.style = "display:inline-block";
            };
        }
        if (callbacks.onBefInit == null) {
            callbacks.onBefInit = function(styleArgs) {
                var self = this;
                return Object.assign({
                    onSetSelIdx: function() {
                        if (self.domSel != this) {
                            self.domSel.className = TemplatedForm.getRowStyle(
                                styleArgs.itemStyle, self.domSel.idx
                            );
                            self.domSel = this;
                        }

                        var nextStep = function () {
                            self.domSel.className = styleArgs.itemStyleSel;
                        }
                        if (self.onSel)
                            self.onSel.call(this, nextStep);
                        else
                            nextStep();
                    }
                }, styleArgs);
            };
        }
        if (callbacks.onBefRender == null) {
            callbacks.onBefRender = function() {
                return this.domTpl.lastChild;
            };
        }

        var tplArgs = callbacks.onBefInit.call(this, styles);
        var tpl = new TemplatedForm.Template(container, listTpl, tplArgs);
        tpl.init(true);
        var tplForm = this.tplForm = tpl.forms[0];
        tplForm.domTpl.style.verticalAlign = "top";
        tplForm.domTpl = this.domSel = callbacks.onBefRender.call(tplForm);
        var onAddDomItem = tplForm.onAddDomItem;
        tplForm.onAddDomItem = function(dataObj, i) {
            this.domItems[i].idx = i;
            this.domItems[i].className = TemplatedForm.getRowStyle(
                styles.itemStyle, i
            );
            if (onAddDomItem)
                onAddDomItem.call(this, dataObj, i);
        };
        tplForm.formData(listData);
        if ( !Array.isArray(listData) )
            tplForm.domTpl.idx = 0;
        this.itemCount = tplForm.domItems.length;
        this.onSel = callbacks.onSel;
        var self = this;

        // @param idx - the index of list-item.
        // [@param cb] - a callback function() or bool value to indicate if
        //               trigger the preset callback.
        this.setSelIdx = function(idx, cb) {
            if (tplForm.domItems[idx] == null)
                throw new ReferenceError("invalid index!");
            if (cb == null)
                this.onSel = callbacks.onSel;
            else if (!cb)
                this.onSel = null;
            else if (cb.call)
                this.onSel = cb;
            else
                this.onSel = callbacks.onSel;
            tplArgs.onSetSelIdx.call(tplForm.domItems[idx]);
        };

        // @param itemData - the data for append.
        this.append = function(itemData) {
            var formItems = tplForm.domItems;
            var itemIdxOff = this.itemCount;
            var onAddDomItem = tplForm.onAddDomItem;
            tplForm.onAddDomItem = null;
            tplForm.domItems = null;
            if (itemIdxOff > 0) {
                var domOwner = tplForm.domTpl.parentNode;
                tplForm.domTpl = tplForm.domTpl.cloneNode(true);
                tplForm.domTpl.removeAttribute("id");
                domOwner.appendChild(tplForm.domTpl);
            } else if (tplForm.domTpl.style.visibility == "hidden") {
                tplForm.domTpl.style.visibility = "visible";
            }
            tplForm.formData(itemData);
            if (itemIdxOff > 0)
                tplForm.domItems = formItems.concat(tplForm.domItems);
            this.itemCount = tplForm.domItems.length;
            if ( Array.isArray(itemData) ) {
                for (var i = 0; i < itemData.length; ++i)
                    onAddDomItem.call(tplForm, itemData[i], itemIdxOff + i);
            } else {
                onAddDomItem.call(tplForm, itemData, itemIdxOff);
            }
            tplForm.onAddDomItem = onAddDomItem;
        };

        // @param idx - the index of list-item.
        // [@param emptyData] - the data or callback when removed all items.
        this.remove = function(idx, emptyData) {
            var domItem = tplForm.domItems[idx];
            if (domItem) {
                if (domItem.parentNode.childNodes.length > 1) {
                    if (this.domSel == domItem) {
                        this.domSel = (
                            domItem.previousSibling
                        ) ? domItem.previousSibling : domItem.nextSibling;
                    }
                    if (tplForm.domTpl == domItem) {
                        tplForm.domTpl = (
                            domItem.previousSibling
                        ) ? domItem.previousSibling : domItem.nextSibling;
                    }
                    domItem.parentNode.removeChild(domItem);
                    for (var i = idx + 1; i < tplForm.domItems.length; ++i) {
                        tplForm.domItems[i].idx = i - 1;
                        tplForm.domItems[i - 1] = tplForm.domItems[i];
                    }
                    tplForm.domItems.pop();
                } else {
                    tplForm.domTpl = this.domSel = domItem;
                    tplForm.domItems = [domItem];
                    domItem.idx = 0;
                    if (emptyData) {
                        if (emptyData.call)
                            emptyData.call(tplForm);
                        else
                            tplForm.formData(emptyData);
                    } else {
                        tplForm.domTpl.style.visibility = "hidden";
                    }
                }
                --(this.itemCount);
            }
        };

        // @param idx - the index of list-item.
        // @param itemData - the data for update.
        this.update = function(idx, itemData) {
            if ( Array.isArray(itemData) )
                throw new TypeError("invalid item-data!");
            tplForm.domTpl = tplForm.domItems[idx];
            tplForm.formData(itemData);
            tplForm.domTpl.idx = idx;
        };

        this.idxEnd = function() {
            return tplForm.domItems ? tplForm.domItems.length : 0;
        };
        this.itemData = function(idx) {
            return this.validateItem(idx) ? tplForm.formData(idx) : null;
        };
        this.validateItem = function(idx) {
            return(tplForm.domItems && tplForm.domItems[idx]);
        };
    };
    TemplatedForm.Template = Template;
    TemplatedForm.Form = Form;
    TemplatedForm.ListView = ListView;
    GLOBAL.TemplatedForm = TemplatedForm;
})();
