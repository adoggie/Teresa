/**
 * @file 绘制轨迹
 * @author Phoebe 2017.1.9
 */
'use strict';
var Trackcontent = {
    /*
     * 根据速度获取对应的轨迹绘制颜色
     * @param {number} speed速度
     * @return {string} 颜色的RGB字符串
     */
    getColorBySpeed: function(speed) {
        var color = '';
        var red = 0;
        var green = 0;
        var blue = 0;
        speed = speed > 100 ? 100 : speed;
        switch (Math.floor(speed / 25)) {
            case 0:
                red = 187;
                green = 0;
                blue = 0;
                break;
            case 1:
                speed = speed - 25;
                red = 187 + Math.ceil((241 - 187) / 25 * speed);
                green = 0 + Math.ceil((48 - 0) / 25 * speed);
                blue = 0 + Math.ceil((48 - 0) / 25 * speed);
                break;
            case 2:
                speed = speed - 50;
                red = 241 + Math.ceil((255 - 241) / 25 * speed);
                green = 48 + Math.ceil((200 - 48) / 25 * speed);
                blue = 48 + Math.ceil((0 - 48) / 25 * speed);
                break;
            case 3:
                speed = speed - 75;
                red = 255 + Math.ceil((22 - 255) / 25 * speed);
                green = 200 + Math.ceil((191 - 200) / 25 * speed);
                blue = 0 + Math.ceil((43 - 0) / 25 * speed);
                break;
            case 4:
                red = 22;
                green = 191;
                blue = 43;
                break;
        }

        red = red.toString(16).length === 1 ? '0' + red.toString(16) : red.toString(16);
        green = green.toString(16).length === 1 ? '0' + green.toString(16) : green.toString(16);
        blue = blue.toString(16).length === 1 ? '0' + blue.toString(16) : blue.toString(16);
        color = '#' + red + green + blue;
        return color;
    },
    /*
     响应Store trackroute事件，绘制选中的轨迹到地图上
     @param {data} 选中的轨迹详细数据
     */
    listenTrackRoute: function(data) {
        var that = this;
        var points = [];
        var data =  data.result;
        if (data.length === 0) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            points[i] = new BMap.Point(data[i].lon, data[i].lat);//根据数据的第一条数据设置地图的中心坐标点
            points[i].speed = data[i].speed ? data[i].speed : 0;
            points[i].loc_time = data[i].time;
        }
        map.setViewport(points);//根据提供的地理区域或坐标设置地图视野，调整后的视野会保证包含提供的地理区域或坐标
        map.zoomOut();//缩小一级视图
        var update = function () {
            var nextArray = [];
            var ctx = this.canvas.getContext("2d");//绘制图像
            if (!ctx) {
                return;
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            if(points.length != 0){
                var lines = 1;
                var lineObj = {};
                var width = [4, 8];
                for (var i = 0, len = points.length; i < len - 1; i++) {
                    var pixel = map.pointToPixel(points[i]);//经纬度坐标转换为像素坐标
                    var nextPixel = map.pointToPixel(points[i + 1]);
                    ctx.beginPath();//在一个画布中开始子路径的一个新的集合
                    ctx.lineCap="round";
                    ctx.lineWidth = 6;
                    ctx.moveTo(pixel.x, pixel.y);//设置当前位置并开始一条新的子路径
                    var grd = ctx.createLinearGradient(pixel.x, pixel.y, nextPixel.x, nextPixel.y);//返回代表线性颜色渐变的一个CanvasGradient对象
                    var speed = points[i].speed;
                    var speedNext = points[i + 1].speed;
                    grd.addColorStop(0, that.getColorBySpeed(speed));//制定应该出现在渐变中各个位置的颜色
                    grd.addColorStop(1, that.getColorBySpeed(speedNext));
                    ctx.strokeStyle = grd;//设置或返回用于笔触的颜色、渐变或者模式
                    if (points[i + 1].loc_time - points[i].loc_time <= 5 * 60){
                        ctx.lineTo(nextPixel.x, nextPixel.y);//为当前的组路径添加一条直线线段
                    } else {
                        lines = lines + 1;
                        //var lineNum = lines;
                        nextArray.push([pixel, nextPixel]);
                        var partImgStart = new Image();//图片预加载
                        partImgStart.src = "/static/images/startpoint.png";
                        var next = nextPixel;
                        //partImgStart.onload = function() {
                            ctx.drawImage(partImgStart, next.x - 10, next.y - 30);//绘制一幅图像
                            ctx.font = "lighter 14px arial";
                            ctx.fillStyle = "white";
                            ctx.fillText(lines, next.x - width[lines >= 10 ? 1 : 0], next.y - 15);//在画布上绘制填写的文本
                        //};

                        var current = pixel;
                        var partImgEnd = new Image();
                        partImgEnd.src = "/static/images/endpoint.png";
                        //partImgEnd.onload = function() {
                            ctx.drawImage(partImgEnd, current.x - 10, current.y - 30);
                            ctx.font = "lighter 14px arial";
                            ctx.fillStyle = "white";
                            ctx.fillText(lines - 1, current.x - width[lines >= 10 ? 1 : 0], current.y - 15);
                        //};
                    }

                    ctx.stroke();//沿着当前路径绘制或或一条直线

                }
            }
            // 绘制第一个起点和最后一个终点

            var imgStart = new Image();
            imgStart.src = "/static/images/startpoint.png";
            imgStart.onload = function() {
                ctx.drawImage(imgStart,map.pointToPixel(points[0]).x - 10 ,map.pointToPixel(points[0]).y - 30);
                ctx.font = "lighter 14px arial";
                ctx.fillStyle = "white";
                ctx.fillText("始", map.pointToPixel(points[0]).x - width[lines >= 10 ? 1 : 0],map.pointToPixel(points[0]).y - 15);
            };
            var imgEnd = new Image();
            imgEnd.src = "/static/images/endpoint.png";
            imgEnd.onload = function() {
                ctx.drawImage(imgEnd,map.pointToPixel(points[i]).x - 10 ,map.pointToPixel(points[i]).y - 30);
                ctx.font = "lighter 14px arial";
                ctx.fillStyle = "white";
                ctx.fillText("终", map.pointToPixel(points[i]).x - width[lines >= 10 ? 1 : 0],map.pointToPixel(points[i]).y - 15);
            };


        }
        if(points.length > 0){
            if(typeof(canvasLayer) != "undefined") {
                map.removeOverlay(canvasLayer);//移除单个覆盖物时会出发此事件
            }
            window.canvasLayer =  new CanvasLayer({
                map: map,
                update: update
            });
        }
        // TrackAction.behavioranalysis();//获取驾驶分析
        // TrackAction.getstaypoint();//获取停留点
    }
};

