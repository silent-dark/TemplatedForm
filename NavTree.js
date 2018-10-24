/**
* navTree组件构造函数
* @param    $dom              jqueryObj    组件容器
* @param    hasTouchEffect    Boolean      是否有点击效果，默认值为false
* @param    touchClass        string       列表条目点击效果CSS类,类名可自定义
* @param    isCloseOther      string       是否关闭其他组
**/
var NavTree = function () {}

NavTree.prototype.init = function($dom, hasTouchEffect, touchClass, isCloseOther) {
  //参数
  this.$container     = $($dom);
  this.hasTouchEffect = hasTouchEffect;
  this.touchClass     = touchClass;
  this.isCloseOther   = isCloseOther;
};

/**********************************方法************************************/
/*
* 文档要求渲染方法
* @param    data    JSON    组件外获取到的JSON对象数组
*/
NavTree.prototype.setData = function (data, focus) {
  this.data = TemplatedForm.obj2array(data);
  this.$container.off('click');
  this.$container.empty();
  this.headMap = {};

  /*var $searchArea = $('<h3 class="h3-title"></h3>');
  var $searchBar  = $('<div class="search-item search-cond search-border"></div>');
  var $searchEdit = $('<input type="search" class="search-item search-edit">');
  var $searchBtn  = $('<a href="#" class="search-noborder search-btn">搜索</a>');

  $searchBtn.on('click', function() {
    dbClient.msgDriver.triggerLocalMsg("NavTree", "Search", $searchEdit[0].value);
    $searchEdit[0].value = "";
  })

  $searchBar.append(
    $('<span class="fa fa-search contact-label"> </span>')
  );
  $searchBar.append($searchEdit);
  $searchArea.append($searchBar);
  $searchArea.append($searchBtn);
  this.$container.append($searchArea);*/

  this.addDom();
  this.init_event();

  if (focus)
    this.expand(focus);
};

NavTree.prototype.expand = function(focus) {
  var clickStack = [];
  for( var k = focus; k.length > 1; k = TemplatedForm.parentPath(k) ) {
    var target = this.headMap[k];
    if (target)
      clickStack.push(target);
    else
      break;
  }

  var i = clickStack.length;
  while (i > 0)
    clickStack[--i].click();

  if (clickStack.length > 0) {
    this.$container.scrollTop(
        this.$container.scrollTop() + clickStack[0].offset().top - 80
    );
  }
};

//数据递归                                 ***核心函数***
NavTree.prototype.forJson = function (data,isHidden,left) {
  var that = this,
      $header = this.createHeader(data.menuNam,
                                  data.iconClassName,
                                  data.hasIcon,
                                  data.hasAngle),
      $list = this.createList(data.id,isHidden);

  $header.on('click',function(){
    if(!!that.hasTouchEffect){
      that.$container.find('.'+ that.touchClass).removeClass(that.touchClass);
      $(this).addClass(that.touchClass);
    }
    data.onclick($list.attr('uri'))
  })
  $list.append($header);
  that.headMap[data.id] = $header;

  if(data.children instanceof Array){
    $header.attr('toggle',isHidden).css('paddingLeft',left);

    data.children.map(function(item,idx){
      $list.append(that.forJson(item,true,left + 20));
    })
  }else{
    $header.attr('toggle',isHidden).css('paddingLeft',left);
    $header.children('.nt-rightIcon').remove();
  }

  return $list;
}

/*******************************插入dom********************************/
//插入dom节点
NavTree.prototype.addDom = function () {
  var that = this;
  that.data.map(function(item,idx){
    that.$container.append(that.forJson(item,false,0));
  })
};

/*********************************事件******************************/
NavTree.prototype.init_event = function () {
  var that = this;

  that.$container.on('click','.nt-header',function(){
    var $this  = $(this),
        $list  = $this.closest('.nt-list'),
        $child = $list.children('.nt-list'),
        toggle = $this.attr('toggle');

    if(!!$this.find('.nt-rightIcon').hasClass('toButtom')){
      that.hiddenList($this,$child);
    }else{
      that.showList($this,$child);
    }

    if(!!that.isCloseOther){
      var $siblings = $this.closest('.nt-list').siblings();
      that.hiddenList($siblings.find('.nt-header'),$siblings.find('.nt-list'));
    }
  })
};
NavTree.prototype.hiddenList = function ($this,$child) {
  $this.attr('toggle','false');
  $this.find('.nt-rightIcon').removeClass('toButtom');
  !!$child ? $child.addClass('hidden') : $($child).addClass('hidden');
};
NavTree.prototype.showList = function ($this,$child) {
  $this.attr('toggle','true');
  $this.find('.nt-rightIcon').addClass('toButtom');
  $child.removeClass('hidden');
};

/************************************dom模板**************************************/
/*
* 创建组件dom
*/
NavTree.prototype.createHeader = function (title,icon,hasIcon,hasAngle) {
  var $header     = $('<div class="nt-header" style="padding-left:0px;"></span>'),
      $icon       = $('<i class="nt-icon '+ (!!hasIcon ? icon : '') +'"></i>'),
      $title      = $('<span class="nt-title">'+ title +'</span>'),
      $rightIcon  = $('<i class="nt-rightIcon '+ (!!hasAngle ? 'fa fa-angle-right' : '') +'"></i>');

      $header.append($icon);
      $header.append($title);
      $header.append($rightIcon);

  return $header;
};
NavTree.prototype.createList = function (id,isHidden) {
  var $list = $('<div class="nt-list" uri="'+ id +'"></div>');
  !!isHidden && $list.addClass('hidden');

  return $list;
};
