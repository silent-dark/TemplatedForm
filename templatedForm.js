// @author: Rick Li
// @email: 18611924492@163.com
// @version: 1.0
// @licence: BSD
// @remark: a module for templating view layer.

var GLOBAL = window;
if (GLOBAL.TemplatedForm == null) {
    var TemplatedForm = {
        DOCX: document
    };

    // @param target - the element id or object.
    TemplatedForm.getDomElement = function(target) {
        return (
            target instanceof Element || target.getAttribute
        )? target: this.DOCX.getElementById(target);
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

    // @param target - the JS object for getting/setting the value.
    // @param refPath - the ref-path of the value.
    // [@param fieldVal] - the field value.
    TemplatedForm.fieldData = function(target, refPath, fieldVal) {
        var subNames = refPath.split(".");
        var field = target;
        var k = subNames[0];
        for (var i = 0; i < subNames.length; ++i) {
            if (i > 0) {
                if (field[k] == null)
                    field[k] = {};
                field = field[k];
                k = subNames[i];
            }
            if ( Array.isArray(field) )
                throw TypeError("array is unsupported!");
        }
        if (fieldVal == null)
            return field[k];        // get
        else
            field[k] = fieldVal;    // set
    };

    // @param obj - the object for convert.
    // @param outHtml - the out element for convert.
    TemplatedForm.obj2html = function(obj, outHtml) {
        for (var tagName in obj) {
            if (tagName === "$") {
                for (var attrName in obj["$"]) {
                    var attrVal = obj["$"][attrName];
                    if (attrName === "text") {
                        outHtml.textContent = attrVal;
                    } else {
                        if (typeof attrVal === "function") {
                            var func = "$" + this.randomString(12);
                            GLOBAL[func] = attrVal;
                            attrVal = func + ".apply(this,arguments);";
                        }
                        outHtml.setAttribute(attrName, attrVal);
                    }
                }
            } else {
                var objArgs = obj[tagName];
                if ( !Array.isArray(objArgs) )
                    objArgs = [objArgs];
                for (var i = 0; i < objArgs.length; ++i) {
                    var subNode = this.DOCX.createElement(tagName);
                    this.obj2html(objArgs[i], subNode);
                    outHtml.appendChild(subNode);
                }
            }
        }
    };

    // @param tpl - the template id or element.
    // [@param onAddDomItem] - callback function(@param dataObj, @param i) when
    //                         add multiple elements.
    // [@param fieldNameAlias] - for naming an alias of 'fieldName' attribute.
    var Form = function(tpl, onAddDomItem, fieldNameAlias) {
        this.domTpl = TemplatedForm.getDomElement(tpl);
        this.domItems = [this.domTpl];
        //this.onAddDomItem = function(dataObj, i) {
        //    // use this.domItems[i] for getting the dom object;
        //};
        this.onAddDomItem = onAddDomItem;
        this.fieldNameAlias = fieldNameAlias? fieldNameAlias: "fieldName";
        this.valAttrEvals = {};
    };

    // @param domObj - the element of the default evaluator.
    Form.prototype.defaultValAttrEval = function(domObj) {
        var kDefaultValAttrEvals = ["value", "textContent", "innerHTML"];
        for (var i = 0; i < kDefaultValAttrEvals.length; ++i) {
            if (domObj[ kDefaultValAttrEvals[i] ] != null)
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
        )? fieldPair.split(":"): fieldPair;
        var attrEval = (
            pairItems.length > 1 && pairItems[1] !== "function"
        )? pairItems[1]: this.valAttrEvals[ pairItems[0] ];
        if (attrEval == null)
            attrEval = this.defaultValAttrEval(target);
        return (
            attrEval.call
        )? attrEval.call(target, attrVal): TemplatedForm.fieldData(
            target, attrEval, attrVal
        );
    };

    // @param domObj - the element for getting/setting form data.
    // @param cb - the callback for getting/setting form data.
    Form.prototype.mapping = function(domObj, cb) {
        if (domObj instanceof Element || domObj.getAttribute) {
            var fieldMapping = domObj.getAttribute(this.fieldNameAlias);
            if (fieldMapping) {
                var fieldPairs = fieldMapping.split(";");
                for (var i = 0; i < fieldPairs.length; ++i) {
                    if (fieldPairs[i])
                        cb.call( this, domObj, fieldPairs[i].split(":") );
                }
            }
            if ( domObj.hasChildNodes() ) {
                for (var subNode = domObj.firstChild;
                    subNode; subNode = subNode.nextSibling)
                {
                    this.mapping(subNode, cb);
                }
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
                if ( TemplatedForm.fieldData(outObj, pairItems[0]) != null )
                    throw TypeError("array is unsupported!");
                TemplatedForm.fieldData(
                    outObj, pairItems[0], this.valAttrData(domObj, pairItems)
                );
            });
            return outObj;
        } else {
            // set:
            this.mapping(domTpl, function(domObj, pairItems) {
                this.valAttrData(
                    domObj, pairItems,
                    TemplatedForm.fieldData(dataObj, pairItems[0])
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
        for (var nextNode = null;
            subNode && subNode != domTpl; subNode = nextNode)
        {
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
    var Template = function(container, tplConstructor, tplArgs, fieldNameAlias)
    {
        if (tplConstructor.call) {
            this.tplObj = {};
            tplConstructor.call(this.tplObj, tplArgs);
        } else {
            this.tplObj = tplConstructor;
            fieldNameAlias = tplArgs;
            tplArgs = undefined;
        }
        fieldNameAlias = new Array().concat(
            fieldNameAlias? fieldNameAlias: "fieldName"
        );
        this.forms = new Array(fieldNameAlias.length);
        for (var i = 0; i < fieldNameAlias.length; ++i)
            this.forms[i] = new Form(container, null, fieldNameAlias[i]);
    };

    // @param reset - indicates if clear the innerHTML of the container.
    Template.prototype.init = function(reset) {
        if (reset)
            this.forms[0].domTpl.innerHTML = "";
        TemplatedForm.obj2html(this.tplObj, this.forms[0].domTpl);
    };

    // @param tpl - the template for load.
    // @param pathAttr - the attribute name of the file path.
    // [@param container] - the container for load.
    TemplatedForm.dynamicLoad = function(tpl, pathAttr, container) {
        var tagName = Object.keys(tpl)[0];
        var tplAttr = tpl[tagName].$;
        var filePath = tplAttr[pathAttr];
        var s = filePath.lastIndexOf("/") + 1;
        var fileName = (s > 0)? filePath.substring(s): filePath;
        var domLoaded = this.DOCX.getElementsByTagName(tagName);
        for (var i = 0; i < domLoaded.length; ++i) {
            if ( domLoaded[i][pathAttr].lastIndexOf(fileName) >=0 ) {
                // loaded:
                tagName = null;
                break;
            }
        }
        if (tagName) {
            if (container == null)
                container = this.DOCX.head;
            this.obj2html(tpl, container);
        } else if (tplAttr.onload) {
            // set timeout to avoid dead-loop.
            setTimeout(tplAttr.onload);
        }
    };

    // @param filePath - the file path for load.
    // [@param onLoad] - the callback on load.
    // [@param container] - the container for load.
    TemplatedForm.loadCSS = function(filePath, onLoad, container) {
        this.dynamicLoad({
            link: {$:{
                rel: "stylesheet",
                href: filePath,
                onload: (onLoad? onLoad: "")
            }}
        }, "href", container);
    };

    // @param filePath - the file path for load.
    // [@param onLoad] - the callback on load.
    // [@param container] - the container for load.
    TemplatedForm.loadJS = function(filePath, onLoad, container) {
        this.dynamicLoad({
            script: {$:{
                type: "text/javascript",
                src: filePath,
                onload: (onLoad? onLoad: "")
            }}
        }, "src", container);
    };

    // @param layoutDef - definitions of layout: {
    //    moduleName: String, // optional, the module name or callback of
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
        var self = this;
        var tplForm = new TemplatedForm.Template(container, {
            div: {$:{
                fieldName: "moduleName;cssFile;jsFile;id:id;className:className;style:style;text;trigger"
            }}
        });
        tplForm.init(true);
        tplForm.forms[0].domTpl = tplForm.forms[0].domTpl.lastChild;
        tplForm.forms[0].valAttrEvals["moduleName"] = function(module) {
            if (module) {
                var domDiv = this;
                domDiv.invokeModule = function() {
                    try {
                        switch(typeof module) {
                        case "string":
                            eval(module)(domDiv);
                            break;
                        case "function":
                            module(domDiv);
                            break;
                        default:
                            console.log( new TypeError("unknown module!") );
                        }
                    } catch (err) {
                        console.log(err);
                    }
                };
            }
        };
        tplForm.forms[0].valAttrEvals["cssFile"] = function(filePath) {
            if (filePath) {
                var domDiv = this;
                domDiv.style.visibility = "hidden";
                self.loadCSS(filePath, function() {
                    domDiv.style.visibility = "visible";
                });
            }
        };
        tplForm.forms[0].valAttrEvals["jsFile"] = function(filePath) {
            if (filePath)
                this.myJS = filePath;
        };
        tplForm.forms[0].valAttrEvals["trigger"] = function(eventName) {
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
        tplForm.forms[0].formData(layoutDef);
    };

    TemplatedForm.Template = Template;
    TemplatedForm.Form = Form;
    GLOBAL.TemplatedForm = TemplatedForm;
}
