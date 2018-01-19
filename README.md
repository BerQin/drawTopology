## 使用

<p>Canvas 原生开发 简单上手</p>
<p>Node 的id是Node的唯一标识 必须唯一并且创建后不可被修改，需要在最开始的时候进行设置</p>
<h3>其他操作</h3>
<p>画布中鼠标滚轮放大缩小，点击空白处拖拽画布，菜单编辑，菜单回调函数编辑，可设置箭头是否显示，连线点方向和目标点方向等</p>
<p>并预留了一些图的编辑方法</p>
<p></p>
<p>请查看DOM页面：<a href="https://berqin.github.io/drawTopology/" target="_blank" >https://berqin.github.io/drawTopology/</a></p>

## 快速上手

```html
<link rel="stylesheet" type="text/css" href="css/drawTopology.css" >
<script type="text/javascript" src="js/drawTopology.js" ></script>
<div id="canvasbox" class="canvasbox" style="height: 100%; width: 100%;"></div>
```

```js
var Stage = new drawTop.Stage({
  id:'canvasbox', //实例化一个舞台 传入ID字符串
  Menu:{          //对舞台中菜单进行配置
      btn:{          //菜单按钮
          line:[{           //线型菜单按钮
              name:'删除直线',                  //文字
              className:'No_line',              //css样式
              click:function(e){                 //事件
                e.Stage.clear(e.triggerDrawNode);
              }
          }],
          rect:[{
              name:'删除标签',
              className:'No_node',
              click:function(e){
                e.Stage.clear(e.triggerDrawNode);
              }
          },{
              name:'查看详情',
              className:'showInfo',
              click:function(e){
                console.log(e);
              }
          }],
        }
  },
  doLink:{
      doLinkJudge:function(e){        //链接前的验证必须返回true才能完成链接
          console.log(e);
          return true;
      }
  }
});
var node_arr = [];
for (var i = 0; i < 6; i++) {
var node_s = new drawTop.Node()      //实例化一个节点 （第一个参数是String类型 下标题文字 可不传 默认是Node+id;
node_s.setLocation(parseInt(Math.random() * 600), parseInt(Math.random() * 400));  //设置节点位置
node_arr.push(node_s);                    //插入数组
}
Stage.add(node_arr);                        //添加到舞台里（可以一个一个添加  建议添加多个时用数组 效率高）
```

## 简单的配置

### 全局主题配置

通过一下代码可以，配置全插件的主题样式，有关节点的配置等

```js
  var json={
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
    arcWidth: 2,
    arclineWidth: 6,
    hoverArcWidth: 4,
    hoverArclineWidth: 8,
    centerText: '[绘图]',
    centerTextColor: '#333',
    lineStrokeStyle: '#0099cc',
    lineLineWidth: 1,
    hoverLineStrokeStyle: '#21baed',
    hoverLineLineWidth: 2,
  }
drawTop.setTheme(json);
```
配置的详细介绍
```js
var json={
  type: 'rect',               //默认图形类型
  width: 150,                 //默认图形宽度
  height: 30,                 //默认图形高度
  strokeStyle: '#0099cc',     //边线颜色
  lineWidth: 1,               //边线大小
  fillStyle: '#fff',          //填充颜色
  fillArcStyle: '#fff',       //连接组件填充颜色
  hoverFillArcStyle: '#fff',  //连接组件Hover颜色
  strokeArcStyle: '#ccc',     //连接组件边框颜色
  hoverStrokeArcStyle: '#81e874',//连接组件边框Hover颜色
  textColor: '#333',          //图块下标题颜色
  x: 0,                       //图块默认X坐标
  y: 0,                       //图块默认Y坐标
  arcWidth: 2,                //连接组件大小
  arclineWidth: 6,            //连接组件线宽
  hoverArcWidth: 4,           //连接组件Hover大小
  hoverArclineWidth: 8,       //连接组件Hover线宽
  centerText: '[绘图]',       //图块中心文字
  centerTextColor: '#333',    //图块中心文字颜色
  lineStrokeStyle: '#0099cc', //连接线颜色
  lineLineWidth: 1,           //连接线线宽
  hoverLineStrokeStyle: '#21baed',//连接线线颜色
  hoverLineLineWidth: 2        //连接线Hover线宽
}
```

### 节点配置

通过一下代码可以，配置Node节点样式，可以不填写默认先读取主题配置在读取默认配置

```js
var json={
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
  arcWidth: 2,
  arclineWidth: 6,
  hoverArcWidth: 4,
  hoverArclineWidth: 8,
  centerText: '[绘图]',
  centerTextColor: '#333',
  lineStrokeStyle: '#0099cc',
  lineLineWidth: 1,
  hoverLineStrokeStyle: '#21baed',
  hoverLineLineWidth: 2,
}
var Node = new drawTop.Node('text',json);
Stage.add(Node);
```