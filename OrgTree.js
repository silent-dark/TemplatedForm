/**
 * @Author   MuTong
 * @DateTime 2018-06-07
 * @param    {[type]}   deAppearances [description]
 */
var OrgTree = function(deAppearances) {
    this.$canvas = $('<canvas></canvas>');
    this.$container = $('<div class="ot-container"></div>');
    this.deAppearances = deAppearances;
};

/************************************************方法*************************************************/
/**
 * @title    将组件实例与容器对象绑定
 * @param    [type]
 * @param    {[type]}   container [接收渲染结果的容器，可以是id或DOM-Element对象。]
 */
OrgTree.prototype.attach = function(container){
    if(typeof container == 'string'){
        this.$scope = $('#'+ container);
    }else{
        this.$scope = $(container);
    }
    this.$scope.addClass('ot-scope');

    this.$scope.append( this.$canvas, this.$container );
};

/**
 * @title    刷新组织结构图
 * @param    [type]
 * @param    {[type]}   container [联系人数据，数组中每个对象结构如下：]
 */
OrgTree.prototype.refresh = function(contacts){
    var that = this,
        addRoot = false;

    if (contacts.length == 0) {
        contacts.push({
            leaderChain: '/'
        });
        addRoot = true;
    } else if (contacts.length > 1) {
        contacts.sort(function(a, b) {
            return a.leaderChain.localeCompare(b.leaderChain);
        });
    }

    TemplatedForm.obj2array(contacts).map(function(data,idx){
        that.findByLeaderChain(data.leaderChain).append(
            that._moduleDom(addRoot, data)
        );
    })

    that._setCanvas();
    that._lineTo(that.$container);
};

/**
 * @title    添加数据时的回调函数
 * @param    [type]
 * @param    {[type]}   modelName [description]
 * @param    {[type]}   dataObj   [description]
 */
OrgTree.prototype.onAdd = function(modelName, dataObj){
    console.log(modelName, dataObj);
};

/**
 * @title    删除数据时的回调函数
 * @param    [type]
 * @param    {[type]}   modelName [description]
 * @param    {[type]}   dataObj   [description]
 */
OrgTree.prototype.onDel = function(modelName, dataObj){
    console.log(modelName, dataObj);
};

/**
 * @title    修改数据时的回调函数
 * @param    [type]
 * @param    {[type]}   modelName [description]
 * @param    {[type]}   dataObj   [description]
 */
OrgTree.prototype.onMod = function(modelName, dataObj){
    console.log(modelName, dataObj);
};

/********************************************事件********************************************/
OrgTree.prototype._add_event = function($scope){
    var that = this;

    var $addIcon = $scope.find('.ot-addIcon');
    $addIcon.mouseup(function(){
        $(this).addClass('ot-action');
    });
    $addIcon.mousedown(function(){
        $(this).removeClass('ot-action');
    });
    $addIcon.click(function() {
        if (!that.isAdd)
            that._add($(this),that);
    });
};
OrgTree.prototype._add = function($this,that){
    var $down = $this.closest('.ot-module').children('.ot-down'),
        $module = that._moduleDom(true);

    $down.append($module);
    that._setCanvas();
    that._lineTo(that.$container);
};

OrgTree.prototype._leaderChain = function($module) {
    var ret = '';
    $.each($module.parents('.ot-module'), function(key,item) {
        ret = '/' + item.id + ret;
    });
    return ret? ret: '/';
};

OrgTree.prototype.findByLeaderChain = function(leaderChain) {
    var $scope = this.$container;
    if (leaderChain) {
        leaderChain.split(/\//g).map(function(_id){
            if (_id) {
                var $found = $scope.find('#'+_id).children('.ot-down');
                if ($found.length > 0)
                    $scope = $found;
            }
        });
    }
    return $scope;
};

OrgTree.prototype.updateNodeId = function(leaderChain, id) {
    var $nodes = this.findByLeaderChain(leaderChain).children('.ot-module');
    for (var i = 0; i < $nodes.length; ++i) {
        if (!$nodes[i].id) {
            $nodes[i].id = id;
            break;
        }
    }
};

/************************************************内置方法****************************************/
/**
 * @Author   MuTong
 * @DateTime 2018-06-07
 * @param    [type]
 * @param    {[type]}   up   [description]
 * @param    {[type]}   down [description]
 * @return   {[type]}        [description]
 */
OrgTree.prototype._moduleDom = function(isAdd, data){
    var that = this,
        id = (data && data._id) ? data._id : '',
        $module = $('<div id="'+ id +'" class="ot-module"></div>'),
        $add = $('<span class="ot-addIcon '+ (isAdd ? 'hidden' : '') +'">+</span>'),
        $up = $('<div class="ot-up"></div>'),
        $down = $('<div class="ot-down"></div>'),
        modelName = that.deAppearances.adapters.modelName;

    $module.append($add);
    $module.append($up);
    $module.append($down);

    that.detailEdit = new DetailEdit(that.deAppearances.dvAppearances,that.deAppearances.ebAppearances);
    that.detailEdit.attach($up[0],that.deAppearances.adapters.binders,data || {});
    that.detailEdit.show(true, isAdd);

    that.detailEdit.onSave = function(dataObj,curData){
        if (isAdd) {
            dataObj.leaderChain = that._leaderChain($module);
            that.onAdd(modelName, dataObj);
            $add.removeClass('hidden');
            that.isAdd = isAdd = false;
        } else {
            that.onMod(modelName, dataObj, curData);
        }
    };
    that.detailEdit.onDel = function(dataObj) {
        var delResult = that.onDel(modelName,dataObj);
        if (delResult)
            return delResult;

        var $parent = $module.closest('.ot-down').closest('.ot-module'),
            $next = $module.next('.ot-module'),
            nIdex = $module.index(),
            $downM = $module.children('.ot-down').children('.ot-module');

        $.each($downM,function(key,item){
            if(!!$next.length){
                $next.before(item);
            }else{
                $parent.children('.ot-down').append(item);
            }
        });

        $module.remove();
        that._setCanvas();
        that._lineTo(that.$container);
    };
    that.detailEdit.onCancel = function() {
        if (isAdd) {
            that.detailEdit.show(false);
            $module.remove();
            that._setCanvas();
            that._lineTo(that.$container);
            that.isAdd = isAdd = false;
        }
    };

    that.isAdd = isAdd;
    that._add_event($module);

    return $module;
};
//
OrgTree.prototype._setCanvas = function(){
    var $top = this.$container.find('.ot-module');
    var minW = this.$container.innerWidth(),
        minH = this.$container.innerHeight(),
        w = $top.outerWidth() + 60,
        h = $top.outerHeight();
    this.$canvas.css('background','#171341');
    this.$canvas.attr({
        width:  ( (w < minW)? minW: w ),
        height: ( (h < minH)? minH: h )
    });
};
//
OrgTree.prototype._lineTo = function($scope){
    var that = this,
        $top = $($scope.find('.ot-up')[0]),
        $dwn = $($scope.find('.ot-down')[0]),
        topL = $top.offset().left - that.$canvas.offset().left,
        topT = $top.offset().top - that.$canvas.offset().top,
        topW = $top.outerWidth(),
        topH = $top.outerHeight(),
        topX = parseInt(topL + ( topW / 2 )),
        topY = parseInt( topT + topH ),
        cld  = [],
        ctx  = that.$canvas[0].getContext('2d');

    var line = {
        color  : '#2F257E',
        height : 30,
        width  : 2,
        s      : 5
    };

    $.each($scope.find('.ot-module>.ot-up'),function(key,item){
        var l = $(item).offset().left - that.$canvas.offset().left,
            t = $(item).offset().top - that.$canvas.offset().top,
            w = $(item).outerWidth(),
            h = $(item).outerHeight();

        cld.push({
            $ : $(item),
            l : l,
            t : t,
            w : w,
            h : h,
            x : parseInt(l + ( w / 2 )),
            y : parseInt(t + h),
        });
    });

    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;

    cld.map(function(item,idx){
        var nChile = item.$.next('.ot-down').find('.ot-module').length;
        var nTop = item.$.parents('.ot-down').length;
        if(!!nTop){
            that._animation(ctx, 'top', line, item.x, item.t);
        }
        if(!!nChile){
            that._animation(ctx, 'bottom', line, item.x, item.t + item.h);
        }
        if(nChile > 1){
            var child = that._childSE(item.$);
            that._animation(ctx, 'left', line, item.x, item.t + item.h + line.height, child.start);
            that._animation(ctx, 'right', line, item.x, item.t + item.h + line.height, child.end);
        }
    });
};
OrgTree.prototype._animation = function(ctx,dir,line,x,y,ex){
    ctx.beginPath();
    ctx.moveTo( x, y );
    var now_x = x, now_y = y;
    switch(dir){
        case 'left':
            now_x = ex;
            break;
        case 'right':
            now_x = ex;
            break;
        case 'top':
            now_y = y - line.height;
            break;
        case 'bottom':
            now_y = y + line.height;
            break;
        default:
            break;
    }
    ctx.lineTo( now_x, now_y );
    ctx.stroke();
    ctx.closePath();
};
OrgTree.prototype._childSE = function($up){
    var child = $up.next('.ot-down').children('.ot-module');
    
    return {
        start : $(child[0]).offset().left - this.$canvas.offset().left + ($(child[0]).outerWidth() / 2),
        end   : $(child[child.length - 1]).offset().left - this.$canvas.offset().left + ($(child[child.length - 1]).outerWidth() / 2),
    }
};
