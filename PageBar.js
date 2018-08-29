/**
 *PageBar构造函数
 *
 *@param  $top         dom           外层容器
 *@param  appearances  Object        按钮外观
 *@param  totalPages   Number        页面总数
 *@param  showPages    Number        最多显示的页面按钮数量
 *@param  onGoPage     fun(pageIdx)  切换页面时的回掉函数,  pageIdx:切换的目标页号
 */
var PageBar = function (appearances) {
    this._appearances = appearances;

    //初始容器
    this.$conLeft = $('<div class="pb-conLeft"></div>');
    this.$conMiddle = $('<div class="pb-conMiddle"></div>');
    this.$conRight = $('<div class="pb-conRight"></div>');
    this.$conRightDiv = $('<div class="pb-conRightDiv"></div>');
    this.$toStart = $('<span class="pb-btn pb-toStart pb-hidden pb-disabled" data-target="toStart">|&lt;</spanspan>');
    this.$toMaxLeft = $('<span class="pb-btn pb-toMaxLeft pb-hidden pb-disabled" data-target="toMaxLeft">&lt;&lt;</span>');
    this.$toLeft = $('<span class="pb-btn pb-toLeft pb-hidden pb-disabled" data-target="toLeft">&lt;</span>');
    this.$startPage = $('<span class="pb-btn pb-startPage pb-hidden" data-target="toStart">1</span>');
    this.$omitLeft = $('<span class="pb-omitLeft pb-hidden">&nbsp;...&nbsp;</span>');
    this.$toEnd = $('<span class="pb-btn pb-toEnd pb-hidden" data-target="toEnd">&gt;|</span>');
    this.$toMaxRight = $('<span class="pb-btn pb-toMaxRight pb-hidden" data-target="toMaxRight">&gt;&gt;</span>');
    this.$toRight = $('<span class="pb-btn pb-toRight pb-hidden" data-target="toRight">&gt;</span>');
    this.$endPage = $('<span class="pb-btn pb-endPage pb-hidden" data-target="toEnd"></span>');
    this.$omitRight = $('<span class="pb-omitRight pb-hidden pb-right">&nbsp;...&nbsp;</span>');
    //常量
    this.pageLiWidth = 0;
    //工具
    this.tools = {
        setStyleOrClass: setStyleOrClass,
        setBtnTextStyle: setBtnTextStyle,
        getEndIdx      : getEndIdx,
        getStartIdx    : getStartIdx
    };
};

PageBar.prototype.render = function ($top,totalPages,showPages,onGoPage) {
    $top.innerHTML = "";
    this.$container = $($top);
    this.totalPages = totalPages;
    this.showPages = showPages;
    this.onGoPage = onGoPage || function(){};
    this.curPageIdx = 1;
    this.startIdx = 1;
    this.endIdx = this.tools.getEndIdx(this,this.startIdx);
    //插入dom
    this.addLeftBtn();
    this.addPageBtn(this.curPageIdx,this.endIdx);
    this.$container.append(this.$conMiddle);
    this.addRightBtn(totalPages);
    //配置
    this.setConMiddle();
    //事件绑定
    this.init_event();
};

/**************************************配置*************************************/
PageBar.prototype.setConMiddle = function () {
    var appearances = this._appearances;

    //样式
    this.tools.setStyleOrClass(this.$conMiddle.find('a'),appearances.pageStyleOrClass);
    this.tools.setStyleOrClass(this.$conMiddle.find('a.pb-active'),appearances.curPageStyleOrClass);
    this.tools.setStyleOrClass(this.$conMiddle.find('span.pb-disabled'),appearances.disabledStyleOrClass);

    this.tools.setBtnTextStyle('firstPage',this.$toStart,appearances);
    this.tools.setBtnTextStyle('lastPage',this.$toEnd,appearances);
    this.tools.setBtnTextStyle('preGroup',this.$toMaxLeft,appearances);
    this.tools.setBtnTextStyle('nextGroup',this.$toMaxRight,appearances);
    this.tools.setBtnTextStyle('prePage',this.$toLeft,appearances);
    this.tools.setBtnTextStyle('nextPage',this.$toRight,appearances);

    this.adjustButtons();
};

PageBar.prototype.adjustButtons = function() {
    //page按钮自适应
    var nConWidth = this.$container.outerWidth(),
        nLeftWidth = this.$conLeft.outerWidth(),
        nMiddenWidth = this.$conMiddle.outerWidth(),
        nRightWidth = this.$conRight.outerWidth(),
        nLeftHeight = this.$conLeft.outerHeight();

    this.$conMiddle.css({
        left:nLeftWidth
    });
    this.$conRight.css({
        left:nLeftWidth+nMiddenWidth,
        height:nLeftHeight
    });
    this.$conMiddle.css({
        height:nLeftHeight
    });
};

/***************************************事件**************************************/
PageBar.prototype.init_event = function () {
    var that = this;

    this.$container.on('click','.pb-btn:not(.pb-disabled)',function(){
        var $this = $(this),
            target = $this.data('target');

        switch (target){
            case 'toStart':
                that.fnToStart($this);
                break;
            case 'toMaxLeft':
                that.fnToMaxLeft($this);
                break;
            case 'toLeft':
                that.fnToLeft($this);
                break;
            case 'toEnd':
                that.fnToEnd($this);
                break;
            case 'toMaxRight':
                that.fnToMaxRight($this);
                break;
            case 'toRight':
                that.fnToRight($this);
                break;
            default:
                that.fnToCurrent($this,that);
                break;
        };

        that.toggleBtn();
        that.setConMiddle();
        that.onGoPage(that.curPageIdx);
    })

    this.toggleBtn();
};

/****************************************方法**************************************/
PageBar.prototype.fnToStart = function ($this) {
    var endIdx = this.tools.getEndIdx(this,1);
    this.addPageBtn(1,endIdx);
    this.$conMiddle.find('a.pb-active').removeClass('pb-active');
    this.$conMiddle.find('a.pb-btn[data-page=1]').addClass('pb-active');
    this.curPageIdx = 1;
    this.startIdx = 1;
    this.endIdx = endIdx;
};
PageBar.prototype.fnToMaxLeft = function ($this) {
    switch(true){
        case this.startIdx > 1:
            var startIdx = this.tools.getStartIdx(this,this.startIdx);
            this.addPageBtn(startIdx,this.startIdx - 1,true);
            this.curPageIdx = this.startIdx - 1;
            this.endIdx = this.startIdx - 1;
            this.startIdx = startIdx;
            break;
        default:
            break;
    }
};
PageBar.prototype.fnToLeft = function ($this) {
    switch(true){
        case this.curPageIdx > this.startIdx:
            this.$conMiddle.find('a.pb-active').removeClass('pb-active');
            this.$conMiddle.find('a.pb-btn[data-page='+(this.curPageIdx-1)+']').addClass('pb-active');
            this.curPageIdx = this.curPageIdx - 1;
            break;
        case this.curPageIdx == this.startIdx:
            this.fnToMaxLeft($this);
            break;
        default:
            break;
    }
};
PageBar.prototype.fnToEnd = function ($this) {
    var startIdx = this.tools.getStartIdx(this,this.totalPages,true);
    this.addPageBtn(startIdx,this.totalPages,true);
    this.$conMiddle.find('a.pb-active').removeClass('pb-active');
    this.$conMiddle.find('a.pb-btn[data-page='+this.totalPages+']').addClass('pb-active');
    this.curPageIdx = this.totalPages;
    this.startIdx = startIdx;
    this.endIdx = this.totalPages;
};
PageBar.prototype.fnToMaxRight = function ($this) {
    switch(true){
        case this.endIdx < this.totalPages:
            var endIdx = this.tools.getEndIdx(this,this.endIdx+1);
            this.addPageBtn(this.endIdx+1,endIdx);
            this.curPageIdx = this.endIdx + 1;
            this.startIdx = this.endIdx + 1;
            this.endIdx = endIdx;
            break;
        default:
            break;
    }
};
PageBar.prototype.fnToRight = function ($this) {
    switch(true){
        case this.curPageIdx < this.endIdx:
            this.$conMiddle.find('a.pb-active').removeClass('pb-active');
            this.$conMiddle.find('a.pb-btn[data-page='+(this.curPageIdx+1)+']').addClass('pb-active');
            this.curPageIdx = this.curPageIdx + 1;
            break;
        case this.curPageIdx == this.endIdx:
            this.fnToMaxRight($this);
            break;
        default:
            break;
    }
};
PageBar.prototype.fnToCurrent = function ($this,that) {
    var nPage = $this.data('page');

    that.$conMiddle.find('a.pb-active').removeClass('pb-active');
    $this.addClass('pb-active');
    that.curPageIdx = nPage;
};
PageBar.prototype.toggleBtn = function () {
    var appearances = this._appearances;

    if(appearances.prePage && this.curPageIdx > 1)
        this.$toLeft.removeClass('pb-disabled');
    if(appearances.prePage && this.curPageIdx <= 1)
        this.$toLeft.addClass('pb-disabled');
    if(appearances.preGroup && this.startIdx > 1)
        this.$toMaxLeft.removeClass('pb-disabled');
    if(appearances.preGroup && this.startIdx <= 1)
        this.$toMaxLeft.addClass('pb-disabled');
    if(appearances.firstPage && this.curPageIdx > 1)
        this.$toStart.removeClass('pb-disabled');
    if(appearances.firstPage && this.curPageIdx <= 1)
        this.$toStart.addClass('pb-disabled');
    if(appearances.nextPage && this.curPageIdx >= this.totalPages)
        this.$toRight.addClass('pb-disabled');
    if(appearances.nextPage && this.curPageIdx < this.totalPages)
        this.$toRight.removeClass('pb-disabled');
    if(appearances.nextGroup && this.endIdx >= this.totalPages)
        this.$toMaxRight.addClass('pb-disabled');
    if(appearances.nextGroup && this.endIdx < this.totalPages)
        this.$toMaxRight.removeClass('pb-disabled');
    if(appearances.lastPage && this.curPageIdx >= this.totalPages)
        this.$toEnd.addClass('pb-disabled');
    if(appearances.lastPage && this.curPageIdx < this.totalPages)
        this.$toEnd.removeClass('pb-disabled');

    if(this.startIdx > 1){
        this.$omitLeft.removeClass('pb-hidden');
        this.$startPage.removeClass('pb-hidden');
    } else {
        this.$omitLeft.addClass('pb-hidden');
        this.$startPage.addClass('pb-hidden');
    }
    if(this.endIdx < this.totalPages){
        this.$omitRight.removeClass('pb-hidden');
        this.$endPage.removeClass('pb-hidden');
    } else {
        this.$omitRight.addClass('pb-hidden');
        this.$endPage.addClass('pb-hidden');
    }
};
//文档要求的方法
PageBar.prototype.setTotalPages = function (totalPages) {
    if (this.totalPages != totalPages) {
        this.totalPages = totalPages;
        this.addRightBtn(this.totalPages);
        this.endIdx = this.tools.getEndIdx(this,this.curPageIdx);
        this.startIdx = this.tools.getStartIdx(this,this.endIdx+1);
        this.addPageBtn(this.startIdx,this.endIdx,false,true);
        this.toggleBtn();
        this.adjustButtons();
    }
}
PageBar.prototype.getCurPage = function () {
    return this.curPageIdx;
}

/************************************插入dom**********************************/
PageBar.prototype.addLeftBtn = function () {
    this.$conLeft.append(this.$toStart);
    this.$conLeft.append(this.$toMaxLeft);
    this.$conLeft.append(this.$toLeft);
    this.$conLeft.append(this.$startPage);
    this.$conLeft.append(this.$omitLeft);
    this.$container.append(this.$conLeft);
};
PageBar.prototype.addPageBtn = function (startPage,endPage,isLeft,isSetTotaPage) {
    this.$conMiddle.html(null);
    for(var i=startPage; i <= endPage; i++){
        var $li = $('<span class="pb-pageLi"></span>');
        if(isLeft)
            $li.html('<a class="pb-btn pb-pageSpan '+ (i==endPage && 'pb-active') +'" data-page="'+i+'">'+i+'</a>');
        else if(isSetTotaPage)
            $li.html('<a class="pb-btn pb-pageSpan '+ (i==this.curPageIdx && 'pb-active') +'" data-page="'+i+'">'+i+'</a>');
        else
            $li.html('<a class="pb-btn pb-pageSpan '+ (i==startPage && 'pb-active') +'" data-page="'+i+'">'+i+'</a>');

        this.$conMiddle.append($li);
    }
};
PageBar.prototype.addRightBtn = function (totalPages) {
    this.$conRight.html(null);
    this.$conRight.append(this.$omitRight);
    this.$conRight.append(this.$endPage.html(totalPages));
    this.$conRightDiv.append(this.$toRight);
    this.$conRightDiv.append(this.$toMaxRight);
    this.$conRightDiv.append(this.$toEnd);
    this.$conRight.append(this.$conRightDiv);
    this.$container.append(this.$conRight);
};

/************************************工具**********************************/
/*
 * 设置样式
 * @param  $this  jq对象  需要添加样式的对象
 * @param  str    string  需要判断的字符串
 */
function setStyleOrClass ($this,str){
    var str = str || '';
    if(str.match(/:.+;/g))
        $this.attr('style',str);
    else
        $this.addClass(str);
}
/*
* 按钮样式
* @param  key           string   参数key
* @param  $con             jq对象   需要设置的按钮
* @param  appearances     object   数据
* */
function setBtnTextStyle (key,$con,appearances){
    if(appearances[key]){
        $con.removeClass('pb-hidden');
        appearances[key].text && $con.html(appearances[key].text);
        appearances[key].styleOrClass && tools.setStyleOrClass($con,appearances[key].styleOrClass);
    }
}
/**
 * 获取展示页码的最后一个数字
 * @param  this    that    模块this
 * @param  number  curIdx  展示页码的起始页码数
 */
function getEndIdx (that,curIdx) {
    var endIdx = curIdx + that.showPages - 1;
    return (endIdx > that.totalPages) ? that.totalPages : endIdx;
}
/**
 * 获取展示页码的第一个数字
 * @param  this    that    模块this
 * @param  number  curIdx  展示页码的起始页码数
 */
function getStartIdx (that,curIdx,isToEnd) {
    var nShow = isToEnd ? (that.totalPages%that.showPages-1) : that.showPages;
    return (curIdx > nShow) ? (curIdx - nShow) : 1;
}
