(function(window) {
  drawTop = {
    init: function() {
      this.version = '1.0.0-bata';
      this.error=function(str){
        alert(str);
      };
      Array.prototype.Nrepetitive = function() {
        var ary = [],
          len = this.length; 
        for (i = 0; i < len; i++) {   if (this[i] !== this[i - 1]) ary.push(this[i]);  } 
        return ary;
      }
      Array.prototype.Map = function(fn) {
        this.fn = fn || null;
        var arr = [];
        for (var i = 0; i < this.length; i++) {
          var num = this.fn && this.fn(this[i],i);
          num && arr.push(num);
        }
        return arr;
      }
    },
    theme: {
      type: 'rect',
      width: 150,
      height: 30,
      strokeStyle: '#0099cc',
      lineWidth: 1,
      fillStyle: '#fff',
      fillArcStyle: '#fff',
      hoverFillArcStyle: '#fff',
      strokeArcStyle: '#ccc',
      hoverStrokeArcStyle: '#81e874',
      textColor: '#333',
      x: 0,
      y: 0,
      arcWidth: 3,
      arclineWidth: 2,
      hoverArcWidth: 4,
      hoverArclineWidth: 2,
      centerText: '[绘图]',
      centerTextColor: '#333',
      lineStrokeStyle: '#0099cc',
      lineLineWidth: 1,
      hoverLineStrokeStyle: '#21baed',
      hoverLineLineWidth: 2,
    },
    setTheme: function(json) {
      for (var i in this.theme) {
        this.theme[i] = json[i] || this.theme[i];
      }
    },
  }, drawTop.init();
})(window);
(function(drawTop) {
  drawTop.Stage = function(id,config) {
    function css(obj, json) {
      for (var i in json) {
        obj.style[i] = json[i];
      }
    }
    this.__proto__ = {
      initialize: function(id,config) {
        this.config=config||{};
        if(toString.apply(id)=='[object Object]'){
          this.config=id;
        }else{
          this.config.id=id;
        }
        Object.defineProperty(this, 'id', { value: (new Date).getTime() });
        this.canvasBox = document.getElementById(this.config.id);
        this.canvas = document.createElement('canvas');
        css(this.canvasBox, {
          position: 'relative',
          top: 0,
          left: 0,
          overflow: 'auto',
        });
        css(this.canvas, {
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex:2,
          backgroundColor: 'rgba(255,255,255,0)',
        });
        this.canvasBox.appendChild(this.canvas);
        this.canvas.width = this.canvasBox.clientWidth;
        this.canvas.height = this.canvasBox.clientHeight;
        this.context = this.canvas.getContext('2d');
        this.childs = [];
        this.scale={x:1,y:1};
        this.translate={x:0,y:0};
        this.origin={x:0,y:0};
        this.offset = this.offSet(this.canvas) || 0;
        this.Event={};
        this.MenuConfig=this.config.Menu||{};
        this.viewConfig=this.config.view||{};
        this.Menu=this.initMenu();
        this.Title=this.initTitle();
        this.doLink=this.config.doLink||{};
        this.init();
        return this;
      },
      initMenu:function(){
        var result;
        result=document.createElement('div');
        result.setAttribute('id','drawTopMenuBox');
        result.setAttribute('class','drawTop-Menu-box');
        this.canvasBox.appendChild(result);
        return result;
      },
      initTitle:function(){
        var result;
        result=document.createElement('div');
        result.setAttribute('id','drawTopTitleBox');
        result.setAttribute('class','drawTop-Title-box');
        this.canvasBox.appendChild(result);
        return result;
      },
      HTMLhide:function(obj){
        obj.innerHTML='';
        css(obj,{
          display:'none',
        });
      },
      HTMLshow:function(e,obj){
        css(obj,{
          display:'block',
          left:e.x+10+'px',
          top:e.y+10+'px',
        });
      },
      init: function() {
        var _this = this;
        var startX = null,
          startY = null,
          startWs = null,
          startHs = null,
          isInGraphJson = null,
          isMousDown = false,
          lastLinkPoints = null,
          lastLink = null,
          moveLineobj = null,
          isClick = false,
          btn = null,
          triggerObj=null,
          startObjX=null,
          startObjY=null,
          startTranslate={},
          wheelDelta={x:0,y:0},
          timmer=null,
          lastObj=null,
          idDblclick=false,
          linkPoints={};
        var clickType = ['dblclick'];
        for (var i = 0; i < clickType.length; i++) {
          addEvent(clickType[i], this.canvas, canvasEvent);
        }
        function canvasEvent(e) {
          e.stopPropagation();
          var json = isInGraph(e);
          if (json) {
            e.Stage=_this;
            e.triggerDrawNode=json.obj;
            json.obj[e.type] && json.obj[e.type](e);
            if(e.type=='dblclick'&&json.obj[e.type]) idDblclick=true;
          }
          e.preventDefault();
        }
        addEvent('scroll', document, documentScroll);
        addEvent('mousedown', this.canvas, canvasmousedown);
        addEvent('mouseup', this.canvas, canvasmouseup);
        addEvent('mousemove', this.canvas, canvasmousemove);
        addEvent('contextmenu',this.canvas,canvasmenu);
        addEvent('click',this.Menu,menuEvent);
        addEvent('mousewheel',this.canvas,canvasmousewheel);
        this.viewConfig.resize=this.viewConfig.resize||true;
        this.viewConfig.resize&&addEvent('resize',window,viewResize);
        function menuEvent(e){
          if(e.target.nodeName=='A'){
            var id=e.target.getAttribute('data-drawTopMenuListid');
            if(_this.MenuConfig.btn&&_this.MenuConfig.btn[triggerObj.type]){
              var btn=_this.MenuConfig.btn[triggerObj.type];
              btn.map(function(item,index){
                if(item.id==id){
                  e.Stage=_this;
                  e.triggerDrawNode=triggerObj;
                  item[e.type]&&item[e.type](e);
                }
              });
              _this.HTMLhide(_this.Menu);
            }
          }
        }
        function viewResize(e){
          _this.reloadsize();
        }
        function canvasmousewheel(e){
          e.stopPropagation();
          e.preventDefault();
          var windowscroll=_this.scroll(_this.canvas);
          if(e.wheelDelta<0){
            _this.scale.x/=1.1;
            _this.scale.y/=1.1;
            _this.scale.x=_this.scale.x<0.3?0.3:_this.scale.x;
            _this.scale.y=_this.scale.y<0.3?0.3:_this.scale.y;
          }else{
            _this.scale.x*=1.1;
            _this.scale.y*=1.1;
            _this.scale.x=_this.scale.x>5?5:_this.scale.x;
            _this.scale.y=_this.scale.y>5?5:_this.scale.y;
          }
          if(e.x!=_this.origin.x||e.y!=_this.origin.y){
            _this.translate.x-=(e.x-_this.offset.left-_this.origin.x+windowscroll.left)/_this.scale.x;
            _this.translate.y-=(e.y-_this.offset.top-_this.origin.y+windowscroll.top)/_this.scale.y;
            _this.origin.x=e.x-_this.offset.left+windowscroll.left;
            _this.origin.y=e.y-_this.offset.top+windowscroll.top;
          }
          _this.reloadsize();
        }
        function canvasmenu(e){
          e.stopPropagation();
          e.preventDefault();
          isInGraphJson=isInGraph(e)||{};
          if(!isInGraphJson.obj) return false;
          triggerObj = isInGraphJson.obj;
          _this.Menu.innerHTML='';
          if(_this.MenuConfig.btn&&_this.MenuConfig.btn[isInGraphJson.type]){
            var btn=_this.MenuConfig.btn[isInGraphJson.type];
            btn.Map(function(item,index){
              if(item.dataKay){
                if(!(isInGraphJson.obj.dataValue[item.dataKay]==true)) return false;
              }
              var a=document.createElement('a'),id=Math.floor((new Date).getTime() + '' + Math.floor(Math.random() * 10000));
              a.setAttribute('href','javascript:;');
              a.setAttribute('data-drawTopMenuListid',id);
              item.id=id;
              a.innerHTML=item.name;
              a.className=item.className;
              _this.Menu.append(a);
            });
            _this.HTMLshow(e,_this.Menu);
          }
          
        }

        function documentScroll(e){
          isInGraphJson=null;
          _this.HTMLhide(_this.Menu);
        }
        function canvasmousedown(e) {
          css(_this.Menu,{
            top: 0,
            left: 0,
            display: 'none',
          });
          isInGraphJson = isInGraph(e)||{};
          isMousDown = true;
          startX = e.x;
          startY = e.y;
          if(isInGraphJson.type) {
            startObjX=isInGraphJson.obj.x;
            startObjY=isInGraphJson.obj.y;
            isClick = true;
          }else{
            startTranslate={x:_this.translate.x,y:_this.translate.y};
          }
          btn = e.button
          if (e.button == 0) {

          } else if (e.button == 2) {

          } else if (e.button == 1) {

          }
        }

        function canvasmousemove(e) {
          e.stopPropagation();
          e.preventDefault();
          clearInterval(timmer);
          _this.HTMLhide(_this.Title);
          if (isMousDown && btn == 0) {
            isClick = false;
            switch (isInGraphJson.type) {
              case 'rect':
                isInGraphJson.obj.setLocation((e.x-startX)/_this.scale.x+startObjX, (e.y -startY)/_this.scale.y+startObjY);
                break;
              case 'linkPoints':
                _this.drawChild();
                var windowscroll = _this.scroll(_this.canvas);
                var to = e;
                var path2d = new Path2D();
                var json = isInGraph(e) || {},
                  spotA = {},
                  spotB = {},
                  spotC = {},
                  spotD = {};
                _this.context.beginPath(path2d);
                _this.context.strokeStyle = isInGraphJson.obj.strokeStyle;
                _this.context.lineWidth = isInGraphJson.obj.lineWidth;
                spotA.x = isInGraphJson.Path.x;
                spotA.y = isInGraphJson.Path.y;
                switch(isInGraphJson.Path.type){
                  case 'left':
                    spotB.x = spotA.x - 40;
                    spotB.y = spotA.y;
                  break;
                  case 'right':
                    spotB.x = spotA.x + 40;
                    spotB.y = spotA.y;
                  break;
                  case 'top':
                    spotB.x = spotA.x;
                    spotB.y = spotA.y - 40;
                  break;
                  case 'bottom':
                    spotB.x = spotA.x;
                    spotB.y = spotA.y + 40;
                  break;
                }
                path2d.moveTo(spotA.x, spotA.y);
                if (json.type == 'rect') {
                  if(typeof(isInGraphJson.obj.LinePoint.PointTo[isInGraphJson.Path.type])=='string'){
                    moveLineobj = json.obj
                    if(moveLineobj.rPath2d.length) return;
                    if(typeof(isInGraphJson.obj.LinePoint.place[isInGraphJson.Path.type])!='boolean') linkPoints.frompath=isInGraphJson.Path;
                    switch(isInGraphJson.obj.LinePoint.PointTo[isInGraphJson.Path.type]){
                      case 'left':
                        spotC.x = moveLineobj.x - 40;
                        spotD.x = spotC.x + 40;
                        spotD.y = moveLineobj.y + moveLineobj.lineWidth + moveLineobj.height/2;
                        spotC.y = spotD.y;
                      break;
                      case 'right':
                        spotC.x = moveLineobj.x + moveLineobj.lineWidth*2 + moveLineobj.width + 40;
                        spotD.x = spotC.x - 40;
                        spotD.y = moveLineobj.y + moveLineobj.lineWidth + moveLineobj.height/2;
                        spotC.y = spotD.y;
                      break;
                      case 'top':
                        spotC.x = moveLineobj.x + moveLineobj.lineWidth + moveLineobj.width / 2;
                        spotD.x = spotC.x;
                        spotD.y = moveLineobj.y;
                        spotC.y = spotD.y - 40;
                      break;
                      case 'bottom':
                        spotC.x = moveLineobj.x + moveLineobj.lineWidth + moveLineobj.width / 2;
                        spotD.x = spotC.x;
                        spotD.y = moveLineobj.y + moveLineobj.lineWidth * 2 + moveLineobj.height;
                        spotC.y = spotD.y + 40;
                      break;
                    }
                    path2d.bezierCurveTo(spotB.x, spotB.y, spotC.x, spotC.y, spotD.x, spotD.y);
                  }
                }else if(json.type == 'rLinkPoints'){
                  moveLineobj = json.obj;
                  if(typeof(isInGraphJson.obj.LinePoint.PointTo[isInGraphJson.Path.type])=='string') return false;
                  var goid=isInGraphJson.obj.LinePoint.PointTo[isInGraphJson.Path.type].way[isInGraphJson.Path.id];
                  if(typeof(goid)=='object'){
                    var passblean=false;
                    for(var i = 0 ; i<goid.length; i++){
                      if(goid[i]==json.Path.id){
                        passblean=true;
                      }
                    }
                    if(!passblean) return false;
                  }else{
                    if(json.Path.id!=goid) return false;
                  }
                  linkPoints.frompath=isInGraphJson.Path;
                  linkPoints.topath=json.Path;
                  linkPoints.totype=isInGraphJson.obj.LinePoint.PointTo[isInGraphJson.Path.type].direction;
                  switch(isInGraphJson.obj.LinePoint.PointTo[isInGraphJson.Path.type].direction){
                    case 'left':
                      spotC.x = moveLineobj.x - 40;
                      spotD.x = spotC.x + 40;
                      spotD.y = moveLineobj.y + moveLineobj.lineWidth + moveLineobj.height/2;
                      spotC.y = spotD.y;
                    break;
                    case 'right':
                      spotC.x = moveLineobj.x + moveLineobj.lineWidth*2 + moveLineobj.width + 40;
                      spotD.x = spotC.x - 40;
                      spotD.y = moveLineobj.y + moveLineobj.lineWidth + moveLineobj.height/2;
                      spotC.y = spotD.y;
                    break;
                    case 'top':
                      spotC.x = linkPoints.topath.x;
                      spotD.x = spotC.x;
                      spotD.y = moveLineobj.y;
                      spotC.y = spotD.y - 40;
                    break;
                    case 'bottom':
                      spotC.x = linkPoints.topath.x;
                      spotD.x = spotC.x;
                      spotD.y = moveLineobj.y + moveLineobj.lineWidth * 2 + moveLineobj.height;
                      spotC.y = spotD.y + 40;
                    break;
                  }
                  path2d.bezierCurveTo(spotB.x, spotB.y, spotC.x, spotC.y, spotD.x, spotD.y);
                } else {
                  moveLineobj = null;
                  switch(isInGraphJson.Path.type){
                    case 'left':
                      spotC.x = (to.x-startX)/_this.scale.x+startObjX+40;
                      spotD.x = spotC.x-40;
                      spotD.y = (to.y-startY)/_this.scale.y+startObjY+isInGraphJson.obj.lineWidth*2 + (isInGraphJson.Path.y-isInGraphJson.obj.y);
                      spotC.y = spotD.y;
                    break;
                    case 'right':
                      spotC.x = (to.x-startX)/_this.scale.x+startObjX+isInGraphJson.obj.lineWidth*2 + isInGraphJson.obj.width-40;
                      spotD.x = spotC.x+40;
                      spotD.y = (to.y-startY)/_this.scale.y+startObjY+isInGraphJson.obj.lineWidth*2 + (isInGraphJson.Path.y-isInGraphJson.obj.y);
                      spotC.y = spotD.y;
                    break;
                    case 'top':
                      spotC.x = (to.x-startX)/_this.scale.x+startObjX+isInGraphJson.obj.lineWidth + (isInGraphJson.Path.x-isInGraphJson.obj.x);
                      spotD.x = spotC.x;
                      spotD.y = (to.y-startY)/_this.scale.y+startObjY;
                      spotC.y = spotD.y + 40;
                    break;
                    case 'bottom':
                      spotC.x = (to.x-startX)/_this.scale.x+startObjX+isInGraphJson.obj.lineWidth + (isInGraphJson.Path.x-isInGraphJson.obj.x);
                      spotD.x = spotC.x;
                      spotD.y = (to.y-startY)/_this.scale.y+startObjY+isInGraphJson.obj.lineWidth*2 + isInGraphJson.obj.height;
                      spotC.y = spotD.y - 40;
                    break;
                  }
                  path2d.bezierCurveTo(spotB.x, spotB.y, spotC.x, spotC.y, spotD.x, spotD.y);
                }
                _this.context.stroke(path2d);
                path2d.closePath();
                var baseLineB = _this.PointOnCubicBezier([spotA, spotB, spotC, spotD], 0.5);
                var baseLineA = _this.PointOnCubicBezier([spotA, spotB, spotC, spotD], 0.4);
                isInGraphJson.obj.LinePoint.link.arrows.show&&_this.drawArrow(baseLineA.x, baseLineA.y, baseLineB.x, baseLineB.y, isInGraphJson.obj.strokeStyle, isInGraphJson.obj.lineWidth);
                break;
              case 'line':

                break;
              case 'rLinkPoints':

                break;
              default:
                _this.translate.x=startTranslate.x+(e.x-startX)/_this.scale.x;
                _this.translate.y=startTranslate.y+(e.y-startY)/_this.scale.y;
                _this.reloadsize();
                break;
            }
          } else {
            var json = isInGraph(e);
            if (json) {
              reloadLinkpoints()
              switch (json.type) {
                case 'linkPoints':
                  _this.canvas.style.cursor = "crosshair";
                  lastObj = json.obj;
                  lastLinkPoints = json.Path;
                  json.obj.PathStyle[lastLinkPoints.type] = {};
                  json.obj.PathStyle[lastLinkPoints.type][lastLinkPoints.id] = { width:lastObj.hoverArcWidth || lastObj.arcWidth,fillStyle:lastObj.hoverFillArcStyle || lastObj.fillArcStyle,lineWidth:lastObj.hoverArclineWidth || lastObj.arclineWidth,strokeStyle:lastObj.hoverStrokeArcStyle || lastObj.strokeArcStyle}
                  _this.reloadsize();
                  break;
                case 'rect':
                  _this.canvas.style.cursor = "pointer";
                  break;
                case 'line':
                  _this.canvas.style.cursor = "pointer";
                  lastLink = json.obj;
                  json.obj.strokeStyle=json.obj.hoverLineStrokeStyle||json.obj.strokeStyle;
                  json.obj.lineWidth=json.obj.hoverLineWidth||json.obj.lineWidth;
                  _this.reloadsize();
                break;
              }
              var num=0;
              timmer=setInterval(function(){
                num++;
                if(num==2) {
                  if(json.type!='line'){
                    var span=document.createElement('span');
                    span.className='drawTop-title-header';
                    span.innerHTML=json.obj.centerText;
                    var span2=document.createElement('span');
                    span2.className='drawTop-title-text';
                    span2.innerHTML=json.obj.text;
                    _this.Title.append(span);
                    _this.Title.append(span2);
                  }else{
                    _this.Title.innerHTML='从  '+json.obj.from.centerText+''+json.obj.from.text+'  到  '+json.obj.to.centerText+''+json.obj.to.text+'   的连线';
                  }
                  _this.HTMLshow(e,_this.Title);
                  clearInterval(timmer);
                };
              },1000);
            } else {
              _this.canvas.style.cursor = "default";
              reloadLinkpoints();
            }
          }
        }

        function reloadLinkpoints() {
          if (lastLinkPoints) {
            lastObj.PathStyle[lastLinkPoints.type][lastLinkPoints.id].width = lastObj.config.arcWidth || drawTop.theme.arcWidth;
            lastObj.PathStyle[lastLinkPoints.type][lastLinkPoints.id].fillStyle = lastObj.config.hoverFillArcStyle || drawTop.theme.fillArcStyle;
            lastObj.PathStyle[lastLinkPoints.type][lastLinkPoints.id].lineWidth = lastObj.config.hoverArclineWidth || drawTop.theme.arclineWidth;
            lastObj.PathStyle[lastLinkPoints.type][lastLinkPoints.id].strokeStyle = lastObj.config.hoverStrokeArcStyle || drawTop.theme.strokeArcStyle;
            _this.reloadsize();
          }
          if(lastLink){
            lastLink.strokeStyle=lastLink.config.lineStrokeStyle||drawTop.theme.lineStrokeStyle;
            lastLink.lineWidth=lastLink.config.lineLineWidth||drawTop.theme.lineLineWidth;
            _this.reloadsize();
            lastLink=null;
          }
        }

        function canvasmouseup(e) {
          if (moveLineobj) {
            if((_this.doLink.doLinkJudge&&_this.doLink.doLinkJudge({from:isInGraphJson.obj,to:moveLineobj}))||!_this.doLink.doLinkJudge){
              if(linkPoints.frompath){
                var lineStartPlace={
                  fromPath:linkPoints.frompath.id,
                  toPath:linkPoints.topath?linkPoints.topath.id:null,
                  type:isInGraphJson.Path.type,
                  totype:linkPoints.totype||null
                };
              }else{
                var lineStartPlace=isInGraphJson.Path.type;
              }
              var link = new drawTop.Link(isInGraphJson.obj, moveLineobj,{
                lineStrokeStyle:isInGraphJson.obj.strokeStyle,
                lineStartPlace:lineStartPlace,
                arrows:{
                  show:isInGraphJson.obj.LinePoint.link.arrows.show,
                },
              });
              _this.add(link);
            }
            moveLineobj = null;
          }
          if (isMousDown && isClick && (!idDblclick)) {
            canvasClick(e, isInGraphJson.obj);
            isClick = false;
          }
          isInGraphJson = null;
          isMousDown = false;
          idDblclick=false;
        }

        function isInGraph(e) {
          var json = {};
          var children = _this.childs;
          var windowscroll = _this.scroll(_this.canvas);
          for (var i = children.length - 1; i > -1; i--) {
            var item = children[i];
            if(item.type=='line'){
              if (_this.context.isPointInPath(item.path2d, e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top) || _this.context.isPointInStroke(item.path2d, e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top)) {
                json.type = item.type;
                json.obj = item;
                json.Path=item.path2d;
                return json;
              }
            }else{
              if (_this.context.isPointInPath(item.path2d, e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top) || _this.context.isPointInStroke(item.path2d, e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top)) {
                json.type = item.type;
                json.obj = item;
                json.Path=item.path2d;
                return json;
              }
              for(var j = 0 ; j<item.arcPath2d.length; j++){
                if (_this.context.isPointInPath(item.arcPath2d[j], e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top) || _this.context.isPointInStroke(item.arcPath2d[j], e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top)) {
                  json.type = 'linkPoints';
                  json.obj = item;
                  json.Path=item.arcPath2d[j];
                  return json;
                }
              }
              for(var k = 0 ; k<item.rPath2d.length; k++){
                if (_this.context.isPointInPath(item.rPath2d[k], e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top) || _this.context.isPointInStroke(item.rPath2d[k], e.x - _this.offset.left + windowscroll.left, e.y - _this.offset.top + windowscroll.top)) {
                  json.type = 'rLinkPoints';
                  json.obj = item;
                  json.Path=item.rPath2d[k];
                  return json;
                }
              }
            }
          }
          return false;
        }

        function canvasClick(e, json) {
          e.type = 'click';
          json && json['click'] && json['click'](e);
        }
      },
      offSet: function(obj) {
        var json={top:null,left:null};
        json.top=obj.offsetTop;
        json.left=obj.offsetLeft;
        parent=obj.offsetParent;
        while(parent!=null){
          json.top+=parent.offsetTop;
          json.left+=parent.offsetLeft;
          parent=parent.offsetParent;
        }
        return json;
      },
      scroll: function(obj, json) {
        json = json || {};
        json.left = json.left || 0;
        json.top = json.top || 0;
        if (obj != document) {
          json.left += obj.scrollLeft;
          json.top += obj.scrollTop;
          return this.scroll(obj.parentNode, json);
        } else {
          return json;
        }
      },
      drawArrow: function(fromX, fromY, toX, toY, color, width, theta, headlen) {
        theta = theta || 20;
        headlen = headlen || 10;
        width = width || 1;
        color = color || '#333';
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI;
        var angle1 = (angle + theta) * Math.PI / 180,
          angle2 = (angle - theta) * Math.PI / 180,
          topX = headlen * Math.cos(angle1),
          topY = headlen * Math.sin(angle1),
          botX = headlen * Math.cos(angle2),
          botY = headlen * Math.sin(angle2);
        this.context.save();
        this.context.beginPath();
        var arrowX = fromX - topX,
          arrowY = fromY - topY;
        this.context.moveTo(arrowX, arrowY);
        arrowX = toX + topX;
        arrowY = toY + topY;
        this.context.moveTo(arrowX, arrowY);
        this.context.lineTo(toX, toY);
        arrowX = toX + botX;
        arrowY = toY + botY;
        this.context.lineTo(arrowX, arrowY);
        this.context.strokeStyle = color;
        this.context.lineWidth = width;
        this.context.stroke();
        this.context.restore();
        return this;
      },
      reloadsize: function() {
        this.canvas.width = this.canvasBox.clientWidth;
        this.canvas.height = this.canvasBox.clientHeight;
        this.offset = this.offSet(this.canvas) || 0;
        this.drawChild();
        return this;
      },
      PointOnCubicBezier: function(spotArr, t) {
        var ax, bx, cx;
        var ay, by, cy;
        var tSquared, tCubed;
        var result = {};

        cx = 3.0 * (spotArr[1].x - spotArr[0].x);
        bx = 3.0 * (spotArr[2].x - spotArr[1].x) - cx;
        ax = spotArr[3].x - spotArr[0].x - cx - bx;

        cy = 3.0 * (spotArr[1].y - spotArr[0].y);
        by = 3.0 * (spotArr[2].y - spotArr[1].y) - cy;
        ay = spotArr[3].y - spotArr[0].y - cy - by;

        tSquared = t * t;
        tCubed = tSquared * t;

        result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + spotArr[0].x;
        result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + spotArr[0].y;
        return result;
      },
      drawChild: function() {
        this.context.setTransform(this.scale.x, 0, 0, this.scale.y, this.origin.x,this.origin.y);
        this.context.translate(this.translate.x,this.translate.y);
        this.context.clearRect(-this.translate.x-this.origin.x/this.scale.x, -this.translate.y-this.origin.y/this.scale.y, this.canvas.width/this.scale.x, this.canvas.height/this.scale.y);
        var _this = this;
        this.childs.Map(function(val) {
          val.parentStages = val.parentStages.Map(function(val) {
            if (val.id != _this.id) return val;
          });
          val.parentStages.push(_this);
          if(val.type!='line'){
            val.path2d = new Path2D();
            _this.context.save(val.path2d);
            _this.context.beginPath(val.path2d);
            _this.context.fillStyle = val.fillStyle;
            _this.context.lineWidth = val.lineWidth * 2;
            _this.context.strokeStyle = val.strokeStyle;
            switch (val.type) {
              case 'rhombus':
                val.path2d.rect(val.x + val.lineWidth, val.y + val.lineWidth, val.width, val.height);
                break;
              default:
                val.path2d.rect(val.x + val.lineWidth, val.y + val.lineWidth, val.width, val.height);
                break;
            }
            _this.context.stroke(val.path2d);
            _this.context.fill(val.path2d);
            val.path2d.closePath();
            // 绘制链接组块
            _this.drawLinePoint(val,val.LinePointPlace);
            _this.drawText(val);
          }else{
            var from = val.from;
            var to = val.to;
            var spotA = {},
              spotB = {},
              spotC = {},
              spotD = {};
            val.path2d = new Path2D();
            _this.context.save(val.path2d);
            _this.context.beginPath(val.path2d);
            _this.context.strokeStyle = val.strokeStyle;
            _this.context.lineWidth = val.lineWidth;
            if(typeof(val.lineStartPlace)=='string'){
              switch(val.lineStartPlace){
                case 'left':
                  spotA.x = from.x;
                  spotA.y = from.y + from.lineWidth + from.height/2;
                  spotB.x = spotA.x-40;
                  spotB.y = spotA.y;
                break;
                case 'right':
                  spotA.x = from.x + from.lineWidth*2 + from.width;
                  spotA.y = from.y + from.lineWidth + from.height/2;
                  spotB.x = spotA.x + 40;
                  spotB.y = spotA.y;
                break;
                case 'top':
                  spotA.x = from.x + from.lineWidth + from.width / 2;
                  spotA.y = from.y;
                  spotB.x = spotA.x;
                  spotB.y = spotA.y - 40;
                break;
                case 'bottom':
                  spotA.x = from.x + from.lineWidth + from.width / 2;
                  spotA.y = from.y + from.lineWidth * 2 + from.height;
                  spotB.x = spotA.x;
                  spotB.y = spotA.y + 40;
                break;
              }
              switch(from.LinePoint.PointTo[val.lineStartPlace]){
                case 'left':
                  spotC.x = to.x - 40;
                  spotD.x = spotC.x + 40;
                  spotD.y = to.y + to.lineWidth + to.height/2;
                  spotC.y = spotD.y;
                break;
                case 'right':
                  spotC.x = to.x + to.lineWidth*2 + to.width + 40;
                  spotD.x = spotC.x - 40;
                  spotD.y = to.y + to.lineWidth + to.height/2;
                  spotC.y = spotD.y;
                break;
                case 'top':
                  spotC.x = to.x + to.lineWidth + to.width / 2;
                  spotD.x = spotC.x;
                  spotD.y = to.y;
                  spotC.y = spotD.y - 40;
                break;
                case 'bottom':
                  spotC.x = to.x + to.lineWidth + to.width / 2;
                  spotD.x = spotC.x;
                  spotD.y = to.y + to.lineWidth * 2 + to.height;
                  spotC.y = spotD.y + 40;
                break;
              }
            }else{
              var type=val.lineStartPlace.type;
              val.fromPath=_this.findPoint(from,type,val.lineStartPlace.fromPath).path;
              val.toPath=_this.findPoint(to,val.lineStartPlace.totype,val.lineStartPlace.toPath,'rpoint').path;
              switch(type){
                case 'left':
                  spotA.x = from.x;
                  spotA.y = val.fromPath.y;
                  spotB.x = spotA.x-40;
                  spotB.y = spotA.y;
                break;
                case 'right':
                  spotA.x = from.x + from.lineWidth*2 + from.width;
                  spotA.y = val.fromPath.y;
                  spotB.x = spotA.x + 40;
                  spotB.y = spotA.y;
                break;
                case 'top':
                  spotA.x = val.fromPath.x;
                  spotA.y = from.y;
                  spotB.x = spotA.x;
                  spotB.y = spotA.y - 40;
                break;
                case 'bottom':
                  spotA.x = val.fromPath.x;
                  spotA.y = from.y + from.lineWidth * 2 + from.height;
                  spotB.x = spotA.x;
                  spotB.y = spotA.y + 40;
                break;
              }
              if(val.toPath){
                switch(from.LinePoint.PointTo[type].direction){
                  case 'left':
                    spotC.x = to.x - 40;
                    spotD.x = spotC.x + 40;
                    spotD.y = val.toPath.y;
                    spotC.y = spotD.y;
                  break;
                  case 'right':
                    spotC.x = to.x + to.lineWidth*2 + to.width + 40;
                    spotD.x = spotC.x - 40;
                    spotD.y = val.toPath.y;
                    spotC.y = spotD.y;
                  break;
                  case 'top':
                    spotC.x = val.toPath.x;
                    spotD.x = spotC.x;
                    spotD.y = to.y;
                    spotC.y = spotD.y - 40;
                  break;
                  case 'bottom':
                    spotC.x = val.toPath.x;
                    spotD.x = spotC.x;
                    spotD.y = to.y + to.lineWidth * 2 + to.height;
                    spotC.y = spotD.y + 40;
                  break;
                }
              }else{
                switch(from.LinePoint.PointTo[type]){
                  case 'left':
                    spotC.x = to.x - 40;
                    spotD.x = spotC.x + 40;
                    spotD.y = to.y + to.lineWidth + to.height/2;
                    spotC.y = spotD.y;
                  break;
                  case 'right':
                    spotC.x = to.x + to.lineWidth*2 + to.width + 40;
                    spotD.x = spotC.x - 40;
                    spotD.y = to.y + to.lineWidth + to.height/2;
                    spotC.y = spotD.y;
                  break;
                  case 'top':
                    spotC.x = to.x + to.lineWidth + to.width / 2;
                    spotD.x = spotC.x;
                    spotD.y = to.y;
                    spotC.y = spotD.y - 40;
                  break;
                  case 'bottom':
                    spotC.x = to.x + to.lineWidth + to.width / 2;
                    spotD.x = spotC.x;
                    spotD.y = to.y + to.lineWidth * 2 + to.height;
                    spotC.y = spotD.y + 40;
                  break;
                }
              }
            }
            val.path2d.moveTo(spotA.x, spotA.y);
            val.path2d.bezierCurveTo(spotB.x, spotB.y, spotC.x, spotC.y, spotD.x, spotD.y);
            _this.context.stroke(val.path2d);
            val.path2d.closePath();
            var baseLineB = _this.PointOnCubicBezier([spotA, spotB, spotC, spotD], 0.5);
            var baseLineA = _this.PointOnCubicBezier([spotA, spotB, spotC, spotD], 0.4);
            val.arrows.show&&_this.drawArrow(baseLineA.x, baseLineA.y, baseLineB.x, baseLineB.y, val.strokeStyle, val.lineWidth);
          }
        });
        return this;
      },
      findPoint:function(obj,path,id,type){
        type=type||'point';
        switch(type){
          case 'point':
            var len=obj.arcPath2d.length,pointPath=obj.arcPath2d;
            if(len){
              for(var i = 0 ; i<len; i++){
                var item=pointPath[i];
                if(item.type==path&&(id?(item.id==id):true)){
                  return {path:item,index:i+1};
                }
              }
            }
          break;
          case 'rpoint':
            var len=obj.rPath2d.length,pointPath=obj.rPath2d;
            if(len){
              for(var i = 0 ; i<len; i++){
                var item=pointPath[i];
                if(item.type==path&&(id?(item.id==id):true)){
                  return {path:item,index:i+1};
                }
              }
            }
          break;
        }
        return false;
      },
      drawLinePoint: function(obj) {
        var pointConfig=obj.LinePoint.place;
        var rPointConfig=obj.LinePoint.RLinkPoint;
        obj.arcPath2d=obj.arcPath2d.length?obj.arcPath2d:[];
        for(var i in pointConfig){
          if(!pointConfig[i]) continue;
          if(typeof(pointConfig[i])=='boolean'){
            var _thisFindPath=this.findPoint(obj,i)||{path:{},id:null};
            var path = new Path2D();
            Object.defineProperty(path , 'id',{value: (Math.floor((new Date).getTime() + '' + Math.floor(Math.random() * 10000))) });
            this.context.save(path);
            this.context.beginPath(path);
            var pointS=obj.PathStyle[i][_thisFindPath.path.id]||{};
            path.fillStyle=pointS.fillStyle||obj.fillArcStyle;
            path.lineWidth=pointS.lineWidth||obj.arclineWidth;
            path.strokeStyle=pointS.strokeStyle||obj.strokeArcStyle;
            path.width=pointS.width||obj.arcWidth;
            this.context.fillStyle = path.fillStyle;
            this.context.lineWidth = path.lineWidth;
            this.context.strokeStyle = path.strokeStyle;
            switch(i){
              case 'left':
                path.x=obj.x;
                path.y=obj.y + obj.lineWidth * 2 + obj.height/2;
                path.arc(path.x,path.y, path.width, 1.5*Math.PI,0.5*Math.PI, true);
                break;
              case 'right':
                path.x=obj.x + obj.lineWidth*2 + obj.width;
                path.y=obj.y + obj.lineWidth * 2 + obj.height/2;
                path.arc(path.x,path.y, path.width, 1.5*Math.PI,0.5*Math.PI, false);
                break;
              case 'top':
                path.x=obj.x + obj.lineWidth + obj.width / 2;
                path.y=obj.y;
                path.arc(path.x,path.y, path.width, 0, Math.PI, true);
                break;
              case 'bottom':
                path.x=obj.x + obj.lineWidth + obj.width / 2;
                path.y=obj.y + obj.lineWidth * 2 + obj.height;
                path.arc(path.x,path.y,path.width,0,Math.PI,false);
                break;
            }
            path.type=i;
            this.context.stroke(path);
            this.context.fill(path);
            path.closePath();
            if(_thisFindPath.index){
              obj.arcPath2d[_thisFindPath.index-1]=path;
            }else{
              obj.arcPath2d.push(path);
            }
          }else{
            var len=pointConfig[i].length;
            for(var j = 0; j<len; j++){
              var item_ps=pointConfig[i][j];
              var _thisFindPath=this.findPoint(obj,i,item_ps.id)||{path:{}};
              var path = new Path2D();
              this.context.save(path);
              this.context.beginPath(path);
              var pointS=obj.PathStyle[i][_thisFindPath.path.id]||{};
              path.fillStyle=pointS.fillStyle||item_ps.fillArcStyle||obj.fillArcStyle;
              path.lineWidth=pointS.lineWidth||item_ps.arclineWidth||obj.arclineWidth;
              path.strokeStyle=pointS.strokeStyle||item_ps.strokeStyle||obj.strokeArcStyle;
              path.width=pointS.width||item_ps.width||obj.arcWidth;
              Object.defineProperty(path , 'id',{value: (item_ps.id||Math.floor((new Date).getTime() + '' + Math.floor(Math.random() * 10000))) });
              this.context.fillStyle = path.fillStyle;
              this.context.lineWidth = path.lineWidth;
              this.context.strokeStyle = path.strokeStyle;
              switch(i){
                case 'left':
                  path.x=obj.x;
                  path.y=obj.y + obj.lineWidth * 2 + obj.height / (len+1) * (j+1);
                  path.arc(path.x,path.y, path.width, 1.5*Math.PI,0.5*Math.PI, true);
                  break;
                case 'right':
                  path.x=obj.x + obj.lineWidth*2 + obj.width;
                  path.y=obj.y + obj.lineWidth * 2 + obj.height / (len+1) * (j+1);
                  path.arc(path.x,path.y, path.width, 1.5*Math.PI,0.5*Math.PI, false);
                  break;
                case 'top':
                  path.x=obj.x + obj.lineWidth + obj.width / (len+1) * (j+1);
                  path.y=obj.y;
                  path.arc(path.x,path.y, path.width, 0, Math.PI, true);
                  break;
                case 'bottom':
                  path.x=obj.x + obj.lineWidth + obj.width / (len+1) * (j+1);
                  path.y=obj.y + obj.lineWidth * 2 + obj.height;
                  path.arc(path.x,path.y,path.width,0,Math.PI,false);
                  break;
              }
              path.type=i;
              this.context.stroke(path);
              this.context.fill(path);
              path.closePath();
              if(_thisFindPath.index){
                obj.arcPath2d[_thisFindPath.index-1]=path;
              }else{
                obj.arcPath2d.push(path);
              }
            }
          }
        }
        for(var k in rPointConfig){
          var item=rPointConfig[k];
          var length=item.length;
          if(length&&typeof(item)=='object'){
            for(var q = 0; q<length; q++){
              var this_point=this.findPoint(obj,k,item[q].id,'rpoint')||{path:{},id:null};;
              var path = new Path2D();
              this.context.save(path);
              this.context.beginPath(path);
              var rpointS={};
              path.fillStyle=rpointS.fillStyle||item.fillArcStyle||obj.fillArcStyle;
              path.lineWidth=rpointS.lineWidth||item.arclineWidth||obj.arclineWidth;
              path.strokeStyle=rpointS.strokeStyle||item.strokeStyle||obj.strokeArcStyle;
              path.width=rpointS.width||item.width||obj.arcWidth;
              Object.defineProperty(path , 'id',{value: (item[q].id||Math.floor((new Date).getTime() + '' + Math.floor(Math.random() * 10000))) });
              this.context.fillStyle = path.fillStyle;
              this.context.lineWidth = path.lineWidth;
              this.context.strokeStyle = path.strokeStyle;
              switch(k){
                case 'left':
                  path.x=obj.x;
                  path.y=obj.y + obj.lineWidth * 2 + obj.height / (length+1) * (q+1);
                  path.arc(path.x,path.y, path.width, 1.5*Math.PI,0.5*Math.PI, true);
                  break;
                case 'right':
                  path.x=obj.x + obj.lineWidth*2 + obj.width;
                  path.y=obj.y + obj.lineWidth * 2 + obj.height / (length+1) * (q+1);
                  path.arc(path.x,path.y, path.width, 1.5*Math.PI,0.5*Math.PI, false);
                  break;
                case 'top':
                  path.x=obj.x + obj.lineWidth + obj.width / (length+1) * (q+1);
                  path.y=obj.y;
                  path.arc(path.x,path.y, path.width, 0, Math.PI, true);
                  break;
                case 'bottom':
                  path.x=obj.x + obj.lineWidth + obj.width / (length+1) * (q+1);
                  path.y=obj.y + obj.lineWidth * 2 + obj.height;
                  path.arc(path.x,path.y,path.width,0,Math.PI,false);
                  break;
              }
              path.type=k;
              this.context.stroke(path);
              this.context.fill(path);
              path.closePath();
              if(this_point.index){
                obj.rPath2d[this_point.index-1]=path;
              }else{
                obj.rPath2d.push(path);
              }
            }
          }
        }
      },
      clearAll: function() {
        this.context.clearRect(-this.translate.x-this.origin.x/this.scale.x, -this.translate.y-this.origin.y/this.scale.y, this.canvas.width/this.scale.x, this.canvas.height/this.scale.y);
        this.childs = [];
        return this;
      },
      clear: function(node) {
        node=(typeof(node)=='string'||typeof(node)=='number')?this.getinChild(node).node:(typeof(node)=='object'?node:null);
        var nodes = this.childs,_this=this;
        if (nodes&&node) {
          var nodeindex=nodes.indexOf(node);
          nodeindex>-1&&this.childs.splice(nodeindex, 1);
          if (node.type != 'line') {
            node.linkFrom.Map(function(item){
              var index = nodes.indexOf(item),line=item;
              index>-1&&_this.childs.splice(index, 1);
              if(index>-1){
                nodes.Map(function(item){
                  if(item.type!='line'){
                    var index=item.linkTo.indexOf(line);
                    index>-1&&item.linkTo.splice(index, 1);
                  }
                });
              }
            });
            node.linkTo.Map(function(item){
              var index = nodes.indexOf(item),line=item;
              index>-1&&_this.childs.splice(index, 1);
              if(index>-1){
                nodes.Map(function(item){
                  if(item.type!='line'){
                    var index=item.linkFrom.indexOf(line);
                    index>-1&&item.linkFrom.splice(index, 1);
                  }
                });
              }
            });
          }else{
            var indexfrom=node.from.linkTo.indexOf(node);
            indexfrom>-1&&node.from.linkTo.splice(indexfrom, 1);
            var indexto=node.to.linkFrom.indexOf(node);
            indexto>-1&&node.to.linkFrom.splice(indexto,1);
          }
        }else{
          drawTop.error&&drawTop.error('缺少节点');
          return false;
        }
        this.reloadsize();
        return this;
      },
      isHasloop:function(){
        var iNode=this.childs.Map(function(val){
          if(val.type!='line') return val;
        }),isor=false;
        function isc(link,item){
          var len=link.length;
          for(var i = 0 ; i<len; i++){
            var item_this=link[i];
            if(item.id==item_this.to.id){
              isor=true;
              return true;
            }
            (!isor)&&isc(item_this.to.linkTo,item);
          }
        }
        iNode.Map(function(item){
          (!isor)&&isc(item.linkTo,item);
        });
        return isor;
      },
      drawText: function(node, path) {
        if (typeof(this.config.id)!='string'&&typeof(this.config.id)!='number') return false;
        // 绘制文字
        node.textMaxWidth = node.textMaxWidth || node.width + 30;
        node.textSize = node.textSize || 12;
        this.context.beginPath(path);
        this.context.fillStyle = node.centerTextColor;
        this.context.font = node.textSize + "px Arial,微软雅黑";
        this.context.textAlign = "center";
        this.context.fillText(node.centerText, node.x + node.lineWidth + node.width / 2, node.y + node.height / 2 + node.textSize / 2);
        // 标题下面的主要文字
        this.context.closePath();
        this.context.beginPath(path);
        this.context.fillStyle = node.textColor;
        this.context.font = node.textSize + "px Arial,微软雅黑";
        this.context.textAlign = "center";
        var rw = node.textMaxWidth / (node.textSize * 0.5);
        var text = node.text;
        for (var i = 1; getTrueLength(text) > 0; i++) {
          var tl = cutString(text, rw);
          this.context.fillText(text.substr(0, tl).replace(/^\s+|\s+$/, ""), node.x + node.lineWidth + node.width / 2, node.y + node.height + 10 + i * node.textSize * 1.3);
          text = text.substr(tl);
        }
        this.context.closePath();
        //获取字符串的真实长度（字节长度）
        function getTrueLength(str) {
          var len = str.length,
            truelen = 0;
          for (var x = 0; x < len; x++) {
            if (str.charCodeAt(x) > 128) {
              truelen += 2;
            } else {
              truelen += 1;
            }
          }
          return truelen;
        }
        //按字节长度截取字符串，返回substr截取位置
        function cutString(str, leng) {
          var len = str.length,
            tlen = len,
            nlen = 0;
          for (var x = 0; x < len; x++) {
            if (str.charCodeAt(x) > 128) {
              if (nlen + 2 < leng) {
                nlen += 2;
              } else {
                tlen = x;
                break;
              }
            } else {
              if (nlen + 1 < leng) {
                nlen += 1;
              } else {
                tlen = x;
                break;
              }
            }
          }
          return tlen;
        }
      },
      add: function(obj) {
        if (obj.length) {
          var lineChilds=[],_this=this;
          obj.Map(function(item){
            if (item.type == 'line') {
              lineChilds.push(item);
            } else {
              _this.childs.push(item);
            }
          });
          lineChilds.Map(function(item){
            var index=null;
            if(typeof(item.from)!='object'&&(item.from?(isNaN(item.from-0)?true:item.from-=0):false)){
              var json=_this.getinChild(item.from);
              item.from=json.node;
            }
            if(typeof(item.to)!='object'&&(item.to?(isNaN(item.to-0)?true:item.to-=0):false)){
              var json=_this.getinChild(item.to);
              item.to=json.node;
              index=json.nodeindex;
            }else{
              index=_this.childs.indexOf(item.to);
            }
            item.from.linkTo.push(item);
            item.to.linkFrom.push(item);
            index?_this.childs.splice(index+1,0,item):_this.childs.push(item);
          });
          this.childs=this.NrepetitiveId(this.childs);
          this.drawChild();
        } else {
          if(obj.error) return this;
          var index=null;
          if (obj.type == 'line') {
            if (obj.from.id == obj.to.id) {
              this.drawChild();
              return this;
            }
            if(typeof(obj.from)=='number'){
              var json=this.getinChild(item.from);
              obj.from=json.node;
            }
            if(typeof(obj.to)=='number'){
              var json=this.getinChild(item.from);
              obj.to=json.node;
              index=json.nodeindex;
            }else{
              index=this.childs.indexOf(obj.to);
            }
            obj.from.linkTo.push(obj);
            obj.to.linkFrom.push(obj);
          }
          this.childs.Map(function(val) { if (val.id === obj.id) return 1; }).length ? this.drawChild() : (index?this.childs.splice(index,0,obj):this.childs.push(obj)) && this.drawChild();
        }
        return this;
      },
      getinChild:function(id){
        var json={};
        this.childs.Map(function(item,index){
          if(item.id==id){
            json.node=item;
            json.nodeindex=index;
          }
        });
        return json;
      },
      NrepetitiveId: function(arr) {
        var json = {},
          rarr = [],
          len = arr.length;
        for (var i = 0; i < len; i++) {
          var item = arr[i];
          if (!json[item.id]) {
            json[item.id] = 1;
            rarr.push(item);
          }
        }
        return rarr;
      },
      getNodeObj:function(type){
        var result=this.childs.Map(function(item,index){
          if(item.type==type) return item;
        });
        return result;
      },
      getNodeObjFromDataValue:function(name,value){
        var result=this.childs.Map(function(item,index){
          if(item.type!='line'){
            if(item.dataValue[name]==value) return item;
          }
        });
        return result;
      },
      getNodeData: function() {
        var result={Node:[],Theme:{},StageData:{}};
        var childs=this.childs;
        childs.Map(function(val,index){
          if(val.type!='line'){
            var json={location:{},id:val.id,name:val.text,title:val.centerText,type:val.type,styles:{},linkTo:[]};
            json.location={x:val.x,y:val.y};
            if(val.linkTo){
              var linktoarr=val.linkTo.Map(function(val,index){
                var json_i={toNodeid:val.to.id,lineId:val.id,styles:{}};
                for(var i in val.config){
                  json_i.styles[i]=val.config[i];
                }
                json.linkTo.push(json_i);
              });
            }
            for(var i in val.config){
              json.styles[i]=val.config[i];
            }
            json.dataValue=val.dataValue;
            result.Node.push(json);
          }
        });
        result.Theme=drawTop.theme;
        result.StageData={
          scale:this.scale,
          translate:this.translate,
          origin:this.origin,
        };
        return result;
      },
      drawNodeData:function(data){
        if(data){
          drawTop.theme=data.Theme?data.Theme:drawTop.theme;
          if(data.StageData){
            this.scale=data.StageData.scale?data.StageData.scale:{x:1,y:1};
            this.translate=data.StageData.translate?data.StageData.translate:{x:0,y:0};
            this.origin=data.StageData.origin?data.StageData.origin:{x:0,y:0};
          }
          var Nodes=data.Node;
          var Nodesarr=[];
          for(var i=0; i< Nodes.length; i++){
            var node=Nodes[i];
            var config=node.styles||{};
            config.text=node.name||'';
            config.centerText=node.title||'';
            config.id=node.id||'';
            var itemNode=new drawTop.Node(config);
            itemNode.x=node.location.x;
            itemNode.y=node.location.y;
            itemNode.dataValue=node.dataValue;
            var linkTo=node.linkTo;
            for(var j=0; j< linkTo.length; j++){
              var iLinkTo=linkTo[j];
              var link=new drawTop.Link(itemNode,iLinkTo.toNodeid,iLinkTo.styles);
              Nodesarr.push(link);
            }
            Nodesarr.push(itemNode);
          }
          this.childs=[];
          this.add(Nodesarr);
        }
        return this;
      },
    };

    function addEvent(event, obj, fn) {
      obj.addEventListener(event, fn, true);
    }

    function removeEvent(event, obj, fn) {
      obj.removeEventListener(event, fn);
    }
    return typeof(id) == 'string' ?this.initialize(id,config): (toString.apply(id) == '[object Object]'?this.initialize(id.id,id):Error('\u53c2\u6570\u9519\u8bef\uff1a\u0053\u0074\u0061\u0067\u0065\u0020\u53c2\u6570\u5fc5\u987b\u4e3a\u5b57\u7b26\u4e32'));
  };
})(drawTop);
(function(drawTop) {
  drawTop.Node = function(text, config) {
    this.config = config || {};
    if (typeof(text) == 'string') {
      this.config.text = text;
    }else if(toString.apply(text)==='[object Object]'){
      this.config=text;
    }
    Object.defineProperty(this, 'id', { value: ((typeof(this.config.id)=='string'||typeof(this.config.id)=='number')?this.config.id:Math.floor((new Date).getTime() + '' + Math.floor(Math.random() * 10000))) });
    // 对节点的配置初始化
    var EventArr = ['click'];
    for (var j = 0; j < EventArr.length; j++) {
      var item = EventArr[j];
      this[item] = this.config[item] || null;
    }
    this.parentStages = [];
    this.type = this.config.type || drawTop.theme.type;
    this.width = this.config.width || drawTop.theme.width;
    this.height = this.config.height || drawTop.theme.height;
    this.strokeStyle = this.config.strokeStyle || drawTop.theme.strokeStyle;
    this.lineWidth = this.config.lineWidth || drawTop.theme.lineWidth;
    this.fillStyle = this.config.fillStyle || drawTop.theme.fillStyle;
    this.fillArcStyle = this.config.fillArcStyle || drawTop.theme.fillArcStyle;
    this.strokeArcStyle = this.config.strokeArcStyle || drawTop.theme.strokeArcStyle;
    this.text = this.config.text || 'Node' + this.id;
    this.textColor = this.config.textColor || drawTop.theme.textColor;
    this.x = this.config.x || drawTop.theme.x;
    this.y = this.config.y || drawTop.theme.y;
    this.arcWidth = this.config.arcWidth || drawTop.theme.arcWidth;
    this.arclineWidth = this.config.arclineWidth || drawTop.theme.arclineWidth;
    this.centerText = this.config.centerText || drawTop.theme.centerText || null;
    this.centerTextColor = this.config.centerTextColor || drawTop.theme.centerTextColor || null;
    this.LinePoint=this.config.LinePoint||{};
    this.LinePoint.place=this.LinePoint.place||{};
    this.LinePoint.place.right=typeof(this.LinePoint.place.right)=='undefined'?false:this.LinePoint.place.right;
    this.LinePoint.place.left=typeof(this.LinePoint.place.left)=='undefined'?false:this.LinePoint.place.left;
    this.LinePoint.place.bottom=typeof(this.LinePoint.place.bottom)=='undefined'?true:this.LinePoint.place.bottom;
    this.LinePoint.place.top=typeof(this.LinePoint.place.top)=='undefined'?false:this.LinePoint.place.top;
    this.LinePoint.PointTo=this.LinePoint.PointTo||{};
    this.LinePoint.PointTo.right=this.LinePoint.PointTo.right||'top';
    this.LinePoint.PointTo.left=this.LinePoint.PointTo.left||'top';
    this.LinePoint.PointTo.bottom=this.LinePoint.PointTo.bottom||'top';
    this.LinePoint.PointTo.top=this.LinePoint.PointTo.top||'top';
    this.LinePoint.link=this.LinePoint.link||{};
    this.LinePoint.link.arrows=this.LinePoint.link.arrows||{};
    this.LinePoint.link.arrows.show=(typeof(this.LinePoint.link.arrows.show)!='undefined'&&typeof(this.LinePoint.link.arrows.show)=='boolean')?this.LinePoint.link.arrows.show:true;
    this.LinePoint.RLinkPoint=this.LinePoint.RLinkPoint||{};
    this.rPath2d=[];
    // 路径连接点样式
    this.PathStyle={
      bottom:{},
      top:{},
      left:{},
      right:{}
    };
    // 自定义属性
    this.dataValue={};
    // 链接线属性
    this.arcPath2d=[];
    this.linkFrom = [];
    this.linkTo = [];
    // hover属性
    this.hoverArcWidth = this.config.hoverArcWidth || drawTop.theme.hoverArcWidth || this.arcWidth;
    this.hoverFillArcStyle = this.config.hoverFillArcStyle || drawTop.theme.hoverFillArcStyle || this.fillArcStyle;
    this.hoverArclineWidth = this.config.hoverArclineWidth || drawTop.theme.hoverArclineWidth || this.arclineWidth;
    this.hoverStrokeArcStyle = this.config.hoverStrokeArcStyle || drawTop.theme.hoverStrokeArcStyle || this.strokeArcStyle;
    var changeWatch = ['width', 'height', 'text'];
    for (var i = 0; i < changeWatch.length; i++) { this['_' + changeWatch[i]] = this[changeWatch[i]]; }
    var WatchJson = {
      'width': {
        configurable: true,
        enumerable: true,
        get: function() {
          return this._width;
        },
        set: function(val) {
          this._width = val;
          this.reload();
          return this._width;
        }
      },
      'height': {
        configurable: true,
        enumerable: true,
        get: function() {
          return this._height;
        },
        set: function(val) {
          this._height = val;
          this.reload();
          return this._height;
        }
      },
      'text': {
        configurable: true,
        enumerable: true,
        get: function() {
          return this._text;
        },
        set: function(val) {
          this._text = val;
          this.reload();
          return this._text;
        }
      },
    };
    Object.defineProperties(this, WatchJson);
  };
  drawTop.Node.prototype.reload = function() {
    var parents = this.parentStages;
    if (parents) {
      for (var i = 0; i < parents.length; i++) {
        parents[i].reloadsize();
      }
    }
    return this;
  }
  drawTop.Node.prototype.addEvent = function(event,fn){
    this[event]=fn;
    return this;
  }
  drawTop.Node.prototype.setLocation = function(x, y) {
    this.x = x;
    this.y = y;
    var parents = this.parentStages;
    if (parents) {
      for (var i = 0; i < parents.length; i++) {
        var parent = parents[i];
        parent.drawChild();
      }
    }
    return this;
  };

  drawTop.Node.prototype.setDateValue=function(json){
    if(toString.apply(json)==='[object Object]'){
      for(var i in json){
        this.dataValue[i]=json[i];
      }
    }else{
      drawTop.error&&drawTop.error('请传入Json对象');
    }
    return this;
  };
  drawTop.Node.prototype.getDateValue=function(){
    return this.dataValue;
  };
})(drawTop);
(function(drawTop) {
  drawTop.Link = function(from, to, config) {
    if (!(from && to)){
      drawTop.error&&drawTop.error('缺少节点参数');
      return { error: '缺少节点参数' };
    }
    if((typeof(from)=='number'&&typeof(to)=='number'&&from==to)||from==to) {
      drawTop.error&&drawTop.error('id相同，请不要自己连接自己');
      return { error: 'id相同，请不要自己连接自己' };
    }
    this.config = config || {};
    Object.defineProperty(this, 'id', { value: (this.config.id || Math.floor((new Date).getTime() + '' + Math.floor(Math.random() * 10000))) });
    Object.defineProperty(this, 'type', { value: 'line' });
    // 初始化设置
    this.parentStages = [];
    this.strokeStyle = this.config.lineStrokeStyle || drawTop.theme.lineStrokeStyle;
    this.lineWidth = this.config.lineLineWidth || drawTop.theme.lineLineWidth;
    this.hoverLineStrokeStyle = this.config.hoverLineStrokeStyle || drawTop.theme.hoverLineStrokeStyle;
    this.hoverLineWidth = this.config.hoverLineLineWidth || drawTop.theme.hoverLineLineWidth;
    this.lineStartPlace=this.config.lineStartPlace||'bottom';
    this.from = from;
    this.to = to;
    this.arrows=this.config.arrows||{};
    this.arrows.show=(typeof(this.arrows.show)!='undefined'&&typeof(this.arrows.show)=='boolean')?this.arrows.show:true;
  }
})(drawTop)