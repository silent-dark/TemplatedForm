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
    this._title = title;
    this._highlight = highlight;
    this._buttons = TemplatedForm.obj2array(buttons) || [{
        styleOrClass:'fa fa-trash-o',
        onclick:function(idx){
            alert('按钮编号：'+ idx);
        }
    }];
    //初始容器
    this.$container = $($obj);
    $obj.innerHTML = "";
    if (highlight && typeof highlight == "string")
        this.setHighlight();
    if (title && typeof title == "string")
        this.setTitle();
    this.setButtons();
};
EditBar.prototype.setHighlight = function () {
    var $b = document.createElement('span');
    if(!!this._highlight.match(/:.+;?/g)){
        $b.setAttribute('style',this._highlight);
    }else if(!!this._highlight.match(/\./g)){
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
    //添加标题
    this.$span = document.createElement('span');
    if (this.$span.textContent==null)
        this.$span.innerText = this._title+'';
    else
        this.$span.textContent = this._title+'';
    this.$span.style.fontSize = "inherit";
    this.$container.append(this.$span);
};
EditBar.prototype.setButtons = function () {
    var that = this,
        $span = document.createElement('span');
    $span.style = 'float:right; color:#D6D400;';

    try {
        that._buttons.map(function(item,idx){
            var $a = document.createElement('a');
            //样式
            if(!!item.styleOrClass.match(/:.+;/g)){
                $a.setAttribute('style',item.styleOrClass);
            }else{
                $a.className = item.styleOrClass;
            }
            //绑定事件
            $a.addEventListener('click',function(event){
                item.onclick(idx);
            });
            //插入span
            $span.append($a);
        })
    }catch(e){
        alert('参数buttons格式不正确，格式为数组')
    }
    //插入document
    that.$container.append($span);
};
