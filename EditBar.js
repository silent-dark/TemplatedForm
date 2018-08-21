/**
 * 编辑栏组件
 * @param   document   $obj            容器，
 * @param   String     title           标题文本
 * @param   String     highlight       可选，高亮标记，iconUrl || style || class
 * @param   [object]   buttons         按钮样式
 * */
var EditBar = function () {};
EditBar.prototype.render = function ($obj, title, highlight, buttons) {
    //默认数据
    this.sStyleDef = "width: 100%; line-height: 30px; height: 40px; padding: 5px 10px; box-sizing: border-box;" +
        "background: #41007A; overflow: hidden; color: #fff; font-size: 20px; font-weight: bolder; margin-bottom: 10px;";

    this.$container = $($obj);
    $obj.innerHTML = "";
    if (highlight && typeof highlight == "string") {
        this._highlight = highlight;
        this.setHighlight();
    }
    if (title && typeof title == "string") {
        this._title = title;
        this.setTitle();
    }
    if (buttons) {
        this._buttons = TemplatedForm.obj2array(buttons);
        this.setButtons();
    }
};
EditBar.prototype.setHighlight = function () {
    var $b = document.createElement('span');
    if(this._highlight.match(/:.+;?/g)){
        $b.setAttribute('style',this._highlight);
    }else if(this._highlight.match(/\./g)){
        var $img = document.createElement('img');
        $img.setAttribute('style','width:'+ this.$span.setOffset('width') +'px; height:'+ this.$span.setOffset('width') +'px');
        $img.src = this._highlight;
        $b.append($img);
    }else{
        $b.className = this._highlight;
    }
    this.$container.append($b);
};
EditBar.prototype.setTitle = function () {
    this.$span = document.createElement('span');
    if (this.$span.textContent==null)
        this.$span.innerText = this._title+'';
    else
        this.$span.textContent = this._title+'';
    this.$span.style.fontSize = "inherit";
    this.$container.append(this.$span);
};
EditBar.prototype.setButtons = function () {
    var $span = document.createElement('span');
    $span.style = 'float:right;';

    this._buttons.map(function(btn,i){
        btn.domBtn = document.createElement("a");
        btn.domBtn.href = "#";
        if (btn.styleOrClass)
            TemplatedForm.setStyleOrClass(btn.domBtn, btn.styleOrClass);
        if (btn.text) {
            if (btn.domBtn.textContent)
                btn.domBtn.textContent = btn.text;
            else
                btn.domBtn.innerText = btn.text;
        }
        if (btn.onclick) {
            btn.domBtn.onclick = function() {
                btn.onclick.call(this, i, arguments);
            };
        }
        $span.append(btn.domBtn);
    })

    this.$container.append($span);
};
