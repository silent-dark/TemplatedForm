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
    var that = this;
    that._appearances = appearances;

    //初始容器
    that.$conLeft = $('<div class="pb-conLeft"></div>');
    that.$conMiddle = $('<div class="pb-conMiddle"></div>');
    that.$conRight = $('<div class="pb-conRight"></div>');
    that.$conRightDiv = $('<div class="pb-conRightDiv"></div>');
    that.$toStart = $('<span class="pb-btn pb-toStart pb-hidden pb-disabled" data-target="toStart">|&lt;</spanspan>');
    that.$toMaxLeft = $('<span class="pb-btn pb-toMaxLeft pb-hidden pb-disabled" data-target="toMaxLeft">&lt;&lt;</span>');
    that.$toLeft = $('<span class="pb-btn pb-toLeft pb-hidden pb-disabled" data-target="toLeft">&lt;</span>');
    that.$startPage = $('<span class="pb-btn pb-startPage pb-hidden" data-target="toStart">1</span>');
    that.$omitLeft = $('<span class="pb-omitLeft pb-hidden">&nbsp;...&nbsp;</span>');
    that.$toEnd = $('<span class="pb-btn pb-toEnd pb-hidden" data-target="toEnd">&gt;|</span>');
    that.$toMaxRight = $('<span class="pb-btn pb-toMaxRight pb-hidden" data-target="toMaxRight">&gt;&gt;</span>');
    that.$toRight = $('<span class="pb-btn pb-toRight pb-hidden" data-target="toRight">&gt;</span>');
    that.$endPage = $('<span class="pb-btn pb-endPage pb-hidden" data-target="toEnd"></span>');
    that.$omitRight = $('<span class="pb-omitRight pb-hidden pb-right">&nbsp;...&nbsp;</span>');
    //常量
    that.pageLiWidth = 0;
    //工具
    that.tools = { 
        setStyleOrClass: setStyleOrClass,
        setBtnTextStyle: setBtnTextStyle,
        getEndIdx      : getEndIdx,
        getStartIdx    : getStartIdx
    };
};

PageBar.prototype.render = function ($top,totalPages,showPages,onGoPage) {
    var that = this;

    $top.innerHTML = "";
    that.$container = $($top);
    that.totalPages = totalPages;
    that.showPages = showPages;
    that.onGoPage = onGoPage || function(){};
    that.curPageIdx = 1;
    that.startIdx = 1;
    that.endIdx = that.tools.getEndIdx(that,that.startIdx);
    //插入dom
    that.addLeftBtn();
    that.addPageBtn(that.curPageIdx,that.endIdx);
    that.$container.append(that.$conMiddle);
    that.addRightBtn(totalPages);
    //配置
    that.setConMiddle();
    //事件绑定
    that.init_event();
};

/**************************************配置*************************************/
PageBar.prototype.setConMiddle = function () {
    var that = this,
        appearances = this._appearances;

    //样式
    that.tools.setStyleOrClass(that.$conMiddle.find('a'),appearances.pageStyleOrClass);
    that.tools.setStyleOrClass(that.$conMiddle.find('a.pb-active'),appearances.curPageStyleOrClass);
    that.tools.setStyleOrClass(that.$conMiddle.find('span.pb-disabled'),appearances.disabledStyleOrClass);

    that.tools.setBtnTextStyle('firstPage',that.$toStart,appearances);
    that.tools.setBtnTextStyle('lastPage',that.$toEnd,appearances);
    that.tools.setBtnTextStyle('preGroup',that.$toMaxLeft,appearances);
    that.tools.setBtnTextStyle('nextGroup',that.$toMaxRight,appearances);
    that.tools.setBtnTextStyle('prePage',that.$toLeft,appearances);
    that.tools.setBtnTextStyle('nextPage',that.$toRight,appearances);

    that.adjustButtons();
};

PageBar.prototype.adjustButtons = function() {
    var that = this;

    //page按钮自适应
    var nConWidth = that.$container.outerWidth(),
        nLeftWidth = that.$conLeft.outerWidth(),
        nMiddenWidth = that.$conMiddle.outerWidth(),
        nRightWidth = that.$conRight.outerWidth(),
        nLeftHeight = that.$conLeft.outerHeight();

    that.$conMiddle.css({
        left:nLeftWidth
    });
    that.$conRight.css({
        left:nLeftWidth+nMiddenWidth,
        height:nLeftHeight
    });
    that.$conMiddle.css({
        height:nLeftHeight
    });
};

/***************************************事件**************************************/
PageBar.prototype.init_event = function () {
    var that = this;

    that.$container.on('click','.pb-btn:not(.pb-disabled)',function(){
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

    that.toggleBtn();
};

/****************************************方法**************************************/
PageBar.prototype.fnToStart = function ($this) {
    var that = this,
        endIdx = that.tools.getEndIdx(that,1);
    that.addPageBtn(1,endIdx);
    that.$conMiddle.find('a.pb-active').removeClass('pb-active');
    that.$conMiddle.find('a.pb-btn[data-page=1]').addClass('pb-active');
    that.curPageIdx = 1;
    that.startIdx = 1;
    that.endIdx = endIdx;
};
PageBar.prototype.fnToMaxLeft = function ($this) {
    var that = this;

    switch(true){
        case that.startIdx > 1:
            var startIdx = that.tools.getStartIdx(that,that.startIdx);
            that.addPageBtn(startIdx,that.startIdx - 1,true);
            that.curPageIdx = that.startIdx - 1;
            that.endIdx = that.startIdx - 1;
            that.startIdx = startIdx;
            break;
        default:
            break;
    }
};
PageBar.prototype.fnToLeft = function ($this) {
    var that = this;

    switch(true){
        case that.curPageIdx > that.startIdx:
            that.$conMiddle.find('a.pb-active').removeClass('pb-active');
            that.$conMiddle.find('a.pb-btn[data-page='+(that.curPageIdx-1)+']').addClass('pb-active');
            that.curPageIdx = that.curPageIdx - 1;
            break;
        case that.curPageIdx == that.startIdx:
            that.fnToMaxLeft($this);
            break;
        default:
            break;
    }
};
PageBar.prototype.fnToEnd = function ($this) {
    var that = this,
        startIdx = that.tools.getStartIdx(that,that.totalPages,true);
    that.addPageBtn(startIdx,that.totalPages,true);
    that.$conMiddle.find('a.pb-active').removeClass('pb-active');
    that.$conMiddle.find('a.pb-btn[data-page='+that.totalPages+']').addClass('pb-active');
    that.curPageIdx = that.totalPages;
    that.startIdx = startIdx;
    that.endIdx = that.totalPages;
};
PageBar.prototype.fnToMaxRight = function ($this) {
    var that = this;

    switch(true){
        case that.endIdx < that.totalPages:
            var endIdx = that.tools.getEndIdx(that,that.endIdx+1);
            that.addPageBtn(that.endIdx+1,endIdx);
            that.curPageIdx = that.endIdx + 1;
            that.startIdx = that.endIdx + 1;
            that.endIdx = endIdx;
            break;
        default:
            break;
    }
};
PageBar.prototype.fnToRight = function ($this) {
    var that = this;

    switch(true){
        case that.curPageIdx < that.endIdx:
            that.$conMiddle.find('a.pb-active').removeClass('pb-active');
            that.$conMiddle.find('a.pb-btn[data-page='+(that.curPageIdx+1)+']').addClass('pb-active');
            that.curPageIdx = that.curPageIdx + 1;
            break;
        case that.curPageIdx == that.endIdx:
            that.fnToMaxRight($this);
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
    var that = this,
        appearances = this._appearances;

    if(!!appearances.prePage && that.curPageIdx > 1){
        that.$toLeft.removeClass('pb-disabled');
    }
    if(!!appearances.prePage && that.curPageIdx <= 1){
        that.$toLeft.addClass('pb-disabled');
    }
    if(!!appearances.preGroup && that.startIdx > 1){
        that.$toMaxLeft.removeClass('pb-disabled');
    }
    if(!!appearances.preGroup && that.startIdx <= 1){
        that.$toMaxLeft.addClass('pb-disabled');
    }
    if(!!appearances.firstPage && that.curPageIdx > 1){
        that.$toStart.removeClass('pb-disabled');
    }
    if(!!appearances.firstPage && that.curPageIdx <= 1){
        that.$toStart.addClass('pb-disabled');
    }
    if(!!appearances.nextPage && that.curPageIdx >= that.totalPages){
        that.$toRight.addClass('pb-disabled');
    }
    if(!!appearances.nextPage && that.curPageIdx < that.totalPages){
        that.$toRight.removeClass('pb-disabled');
    }
    if(!!appearances.nextGroup && that.endIdx >= that.totalPages){
        that.$toMaxRight.addClass('pb-disabled');
    }
    if(!!appearances.nextGroup && that.endIdx < that.totalPages){
        that.$toMaxRight.removeClass('pb-disabled');
    }
    if(!!appearances.lastPage && that.curPageIdx >= that.totalPages){
        that.$toEnd.addClass('pb-disabled');
    }
    if(!!appearances.lastPage && that.curPageIdx < that.totalPages){
        that.$toEnd.removeClass('pb-disabled');
    }
    if(that.startIdx > 1){
        that.$omitLeft.removeClass('pb-hidden');
        that.$startPage.removeClass('pb-hidden');
    }
    if(that.startIdx <= 1){
        that.$omitLeft.addClass('pb-hidden');
        that.$startPage.addClass('pb-hidden');
    }
    if(that.endIdx < that.totalPages){
        that.$omitRight.removeClass('pb-hidden');
        that.$endPage.removeClass('pb-hidden');
    }
    if(that.endIdx >= that.totalPages){
        that.$omitRight.addClass('pb-hidden');
        that.$endPage.addClass('pb-hidden');
    }
};
//文档要求的方法
PageBar.prototype.setTotalPages = function (totalPages) {
    var that = this;

    that.totalPages = totalPages;
    that.addRightBtn(that.totalPages);
    that.endIdx = that.tools.getEndIdx(that,that.curPageIdx);
    that.addPageBtn(that.startIdx,that.endIdx,false,true);
    that.toggleBtn();
    that.adjustButtons();
}
PageBar.prototype.getCurPage = function () {
    return this.curPageIdx;
}

/************************************插入dom**********************************/
PageBar.prototype.addLeftBtn = function () {
    var that = this;
    that.$conLeft.append(that.$toStart);
    that.$conLeft.append(that.$toMaxLeft);
    that.$conLeft.append(that.$toLeft);
    that.$conLeft.append(that.$startPage);
    that.$conLeft.append(that.$omitLeft);

    that.$container.append(that.$conLeft);
};
PageBar.prototype.addPageBtn = function (startPage,endPage,isLeft,isSetTotaPage) {
    var that = this;

    that.$conMiddle.html(null);
    for(var i=startPage; i <= endPage; i++){
        var $li = $('<span class="pb-pageLi"></span>');
        if(!!isLeft){
            $li.html('<a class="pb-btn pb-pageSpan '+ (i==endPage && 'pb-active') +'" data-page="'+i+'">'+i+'</a>');
        }else if(!!isSetTotaPage){
            $li.html('<a class="pb-btn pb-pageSpan '+ (i==that.curPageIdx && 'pb-active') +'" data-page="'+i+'">'+i+'</a>');
        }else{
            $li.html('<a class="pb-btn pb-pageSpan '+ (i==startPage && 'pb-active') +'" data-page="'+i+'">'+i+'</a>');
        }

        that.$conMiddle.append($li);
    }
};
PageBar.prototype.addRightBtn = function (totalPages) {
    var that = this;

    that.$conRight.html(null);
    that.$conRight.append(that.$omitRight);
    that.$conRight.append(that.$endPage.html(totalPages));
    that.$conRightDiv.append(that.$toRight);
    that.$conRightDiv.append(that.$toMaxRight);
    that.$conRightDiv.append(that.$toEnd);
    that.$conRight.append(that.$conRightDiv);

    that.$container.append(that.$conRight);
};

/************************************工具**********************************/
/*
 * 设置样式
 * @param  $this  jq对象  需要添加样式的对象
 * @param  str    string  需要判断的字符串
 */
function setStyleOrClass ($this,str){
    var str = str || '';
    if(!!str.match(/:.+;/g)){
        $this.attr('style',str);
    }else{
        $this.addClass(str);
    }
}
/*
* 按钮样式
* @param  key           string   参数key
* @param  $con             jq对象   需要设置的按钮
* @param  appearances     object   数据
* */
function setBtnTextStyle (key,$con,appearances){
    if(!!appearances[key]){
        $con.removeClass('pb-hidden');
        !!appearances[key].text && $con.html(appearances[key].text);
        !!appearances[key].styleOrClass && tools.setStyleOrClass($con,appearances[key].styleOrClass);
    }
}
/**
 * 获取展示页码的最后一个数字
 * @param  this    that    模块this
 * @param  number  curIdx  展示页码的起始页码数
 */
function getEndIdx (that,curIdx) {
    var endIdx = curIdx + that.showPages - 1;

    if(endIdx > that.totalPages){
        return that.totalPages;
    }else{
        return endIdx;
    }
}
/**
 * 获取展示页码的第一个数字
 * @param  this    that    模块this
 * @param  number  curIdx  展示页码的起始页码数
 */
function getStartIdx (that,curIdx,isToEnd) {
    var    nShow = that.totalPages%that.showPages-1;
        startIdx = !!isToEnd ? (curIdx - nShow) : (curIdx - that.showPages);

    if(startIdx > 1){
        return startIdx;
    }else{
        return 1;
    }
}
