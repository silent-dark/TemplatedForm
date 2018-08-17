/**
 * [MapView description]
 * @param {[type]} deAppearances [description]
 * @param {[type]} epAppearances [description]
 */
var MapView = function(deAppearances, epAppearances){
    var that = this;

    that.$container = $('<div class="mv-container"></div>');
    that.$header = $('<div id="mv-header"></div>');
    that.$headerTitle = $('<span class="mv-headerTitle"></span>');
    that.deAppearances = deAppearances;
    that.epAppearances = epAppearances;
    that.modelName = deAppearances.adapters.modelName;
    that.markIconMap = {};
    that.isAdd = false;
    that.onAdd = null;
    that.onMod = null;
    that.onDel = null;

    TemplatedForm.obj2array(that.epAppearances.btnAppearances).map(
        function(item,idx){
            item.onclick = function(index){
                that._editPanelBtnClick(index);
            }
        }
    );

    that.$editPanel = new EditPanel(that.epAppearances.dvAppearances,
                                    that.epAppearances.btnAppearances);
    that.$editPanel.render(that.$header[0]);
    that.$header.append(that.$headerTitle);
};

/***************************方法*********************************/
/**
 * [attach description]
 * @param  {[type]} container [description]
 * @param  {[type]} bgImg     [description]
 * @return {[type]}           [description]
 */
MapView.prototype.attach = function(container, bgImg, iconImg){
    var that = this;

    if(typeof container == 'string'){
        that.$scope = $('#'+ container);
    }else{
        that.$scope = $(container);
    }
    that.$scope.addClass('mv-scope');
    that.$scope.append(that.$header);
    that.$scope.append(that.$container);
    that.$container.css({
        background: 'url('+ bgImg +') no-repeat 0px 0px',
        backgroundSize: '100% 100%'
    });

    that.icon = iconImg;
    that.$container.on('click',function(event){
        if($(event.target).hasClass('mv-container')){
            that._mapMarkClick();
        }
        if(that.isAdd){
            var pxPos = [
                event.offsetX - 6,
                event.offsetY - 6,
                that.$container.innerWidth(),
                that.$container.innerHeight(),
            ];
            var options = {
                x : pxPos[0],
                y : pxPos[1],
                icon : that.icon,
                name : '',
                dvAppearances : that.deAppearances.dvAppearances,
                ebAppearances : that.deAppearances.ebAppearances,
                binders : that.deAppearances.adapters.binders,
                data: { pos: pxPos }
            };
            that._createModule(that,options);
            that._toggleIsAdd(false);
        }
    });
};
/**
 * [refresh description]
 * @param  {[type]} markers [description]
 * @return {[type]}         [description]
 */
MapView.prototype.refresh = function(markers){
    var that = this;

    TemplatedForm.obj2array(markers).map(function(item,idx) {
        var scaleX = 1;
        var scaleY = 1;
        if (item.pos.length > 2) {
            scaleX = that.$container.innerWidth()  / item.pos[2];
            scaleY = that.$container.innerHeight() / item.pos[3];
        }
        var options = {
            x : item.pos[0] * scaleX,
            y : item.pos[1] * scaleY,
            icon : item.icon,
            name : item.name,
            dvAppearances : that.deAppearances.dvAppearances,
            ebAppearances : that.deAppearances.ebAppearances,
            binders : that.deAppearances.adapters.binders,
            data: item
        };
        that._createModule(that,options);
    });
}

MapView.prototype.previewMarkIcon = function(uri, icon) {
    var $IconImg = this.markIconMap[uri];
    if ($IconImg) {
        var attrName;
        if ( $IconImg.is('img') )
            attrName = 'src';
        else if (icon.match(/:.+;?/g))
            attrName = 'style';
        else
            attrName = 'class';
        $IconImg.attr(attrName, icon);
    }
}

MapView.prototype._createModule = function(that,options){
    var $thisMark,
        isAdd = that.isAdd,
        iconStyle = 'top:'+ options.y +'px;left:'+ options.x +'px',
        $detailEditCon = $('<div class="mv-detailEditCon '+ (isAdd? '': 'hidden') +'"></div>'),
        $mark = $('<div class="mv-mark '+ (isAdd? 'action': '') +'" style="'+ iconStyle +'"></div>'),
        detailEdit = new DetailEdit(options.dvAppearances,options.ebAppearances);

    var icon = (options.icon || that.icon);
    if (icon.match(/[\/\.]?/g) > -1)
        that.$IconImg = $('<img class="mv-markImg" src="'+ icon +'" title="'+ options.name +'"/>');
    else if ( icon.match(/:.+;?/g) )
        that.$IconImg = $('<div style="' + icon + '"></div>');
    else
        that.$IconImg = $('<div class="' + icon + '"></div>');

    detailEdit.attach($detailEditCon[0],options.binders,options.data);
    detailEdit.show(true, isAdd);
    $mark.append(that.$IconImg, $detailEditCon);
    that.$container.append($mark);

    that.$IconImg.on('click',function(){
        var $this = $(this);
        $thisMark = $this.closest('.mv-mark');
        that._mapMarkClick($this);
    });
    if (options.data.uri)
        that.markIconMap[options.data.uri] = that.$IconImg;

    detailEdit.onSave = function(dataObj, curData){
        if(isAdd){
            that.onAdd(that.modelName, dataObj);
            isAdd = false;
        }else{
            that.onMod(that.modelName, dataObj, curData);
        }
    };
    detailEdit.onDel = function(dataObj){
        that.$container.find('.mv-detailEditCon:not(.hidden)').addClass('hidden');

        var delResult = that.onDel(that.modelName, dataObj);
        if (delResult)
            return delResult;

        try{
            $thisMark.remove();
        }catch(err){
            $mark.remove();
        }
    };
    detailEdit.onCancel = function() {
        if (isAdd) {
            detailEdit.show(false);
            try{
                $thisMark.remove();
            }catch(err){
                $mark.remove();
            }
        }
    };

    that.editAgain = function() {
        isAdd = true;
        detailEdit.show(true, isAdd);
    }
}

/*******************************事件********************************/
MapView.prototype._editPanelBtnClick = function(idx){
    var that = this;
    switch(idx){
        case 0:
            that._mapMarkClick();
            that._toggleIsAdd(true);
            break;
        default:
            break;
    };
};
MapView.prototype._toggleIsAdd = function(is){
    var that = this;
    if(is){
        that.isAdd = true;
        that.$container.addClass('isAdd');
        that.$headerTitle.html("请在地图上单击添加位置标记");
    }else{
        that.isAdd = false;
        that.$container.removeClass('isAdd');
        that.$headerTitle.html(null);
    }
};
MapView.prototype._mapMarkClick = function($scope){
    var that = this;

    that.$container.find('.mv-detailEditCon:not(.hidden)').addClass('hidden');
    that.$container.find('.mv-mark.action').removeClass('action');
    if(!!$scope){
        $scope.closest('.mv-mark').addClass('action');
        $scope.next('.mv-detailEditCon').removeClass('hidden');
    }
};
