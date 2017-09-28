/**
*
*	@file 轨迹时间轴
*	@time 20160112
*
**/
'use strict';
var timeline = {
    //父容器可见性
    parentVisible:{},
    //时间轴显示的小时数量
    timeCount:[],
    //时间轴显示的时间数字标识
    timeNumber:[],
    //时间轴位置
    progress:-20,
    //当前时间轴位置
    currentProgress:-20,
    //当前时间轴位置对应的pageX
    currentPageX:0,
    //初始鼠标拖动位置
    initMouseX:0,
    //当前时间戳位置代表的时间戳
    currentTimeStamp:0,
    //当前有数据的时间段数组
    dataPart:[],
    //当天起始时间
    initTimeStamp:0,
    //所有路径点数据
    totalPointData:[],
    //播放按钮状态
    playOrPause:'timelinePlay',
    //播放速度，常规速度为0.1/frame
    //减速为0.08,0.06,0.04,0.02,0.01
    //加速为0.12,0.14,0.16,0.18,0.20
    playSpeed:[0.01,0.02,0.04,0.06,0.08,0.1,0.12,0.14,0.16,0.18,0.2],
    //当前播放速度位置
    playSpeedIndex:5,
    /*
     根据时间戳获取时间轴像素位置
     @param {number} time 时间戳
     @return {number} 像素位置
     */
    getPxByTime: function(time) {
        var px = 0;
        px = (time + 28800) % 86400 / 120;
        return px;
    },
    /*
     根据时间轴位置获取对应数据中时间点
     @param {number} px 像素位置
     @return {number} 时间戳
     */
    getTimeByPx:function(px){
        var time = 0;
        time = (px + 20) * 120 + this.initTimeStamp;
        return time;
    },
    /*
     根据时间获取数据点
     @param {number} time 时间戳
     @return {object} 数据点
     */
    getPointByTime:function(time){
        var point = {};
        var totalPoint = this.totalPointData;
        if(time < totalPoint[0].time){
            point = totalPoint[0];
            return point;
        }
        if(time > totalPoint[totalPoint.length - 1].time){
            point = totalPoint[totalPoint.length - 1];
            return point;
        }
        for(var i=0;i<totalPoint.length-1;i++){
            if(time>=totalPoint[i].time && time <= totalPoint[i+1].time){
                point = totalPoint[i];
                break;
            }
        }
        return point;
    },
    /*
     根据数据点绘制实时位置
     @param {object} data 数据点
     */
    setRunningPoint:function(data){
        var update = function(){
            var ctx = this.canvas.getContext('2d');
            if(!ctx){
                return;
            }
            ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
            var point = new BMap.Point(data.lon,data.lat);
            var pixel = map.pointToPixel(point);
            ctx.beginPath();
            ctx.strokeStyle = "#d0d4d7";
            ctx.arc(pixel.x,pixel.y,35,0,2*Math.PI);//用一个中线点和半径，为一个画布的当前子路径添加一条弧线
            ctx.stroke();//沿着当前路径绘制或画一条直线
            ctx.beginPath();//开始一个画布中的一条新路径（或者子路径的一个集合）
            ctx.fillStyle = "rgba(35,152,255,0.14)";
            ctx.arc(pixel.x,pixel.y,35,0,2*Math.PI);
            ctx.fill();//使用指定颜色渐变或模式来绘制或填充当前路径的内部
            ctx.beginPath();
            ctx.strokeStyle = "#c2c2c4"
            ctx.arc(pixel.x,pixel.y,8,0,2*Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = "#fff"
            ctx.arc(pixel.x,pixel.y,7,0,2*Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = "#1496ff"
            ctx.arc(pixel.x,pixel.y,2.6,0,2*Math.PI);
            ctx.fill();
        }
        if(typeof(canvasLayerRunning) != "undefined"){
            canvasLayerRunning.options.update = update;
            canvasLayerRunning._draw();
            return;
        }
        window.canvasLayerRunning = new CanvasLayer({
            map:map,
            update: update
        })
    },
    /*
     根据时间轴位置设置轨迹点位置
     @param {number} progress 时间戳
     */
    setRunningPointByProgress:function(progress){
        var point = this.getPointByTime(this.getTimeByPx(progress));
        if(point.time != undefined){
            this.setRunningPoint(point);
        }
    },
    /*
     * 绘制时间轴
     * @param {data} 轨迹数据*/
    listenTrackRoute:function(data){
        var that = this;
        if(data.result.length===0){
            return;
        };
        that.totalPointData = data.result;
        var data = data.result;
        var timePart = [{}];
        var pxPart = [{}];
        var j = 0;
        var date = new Date(data[0].time*1000);
        that.initTimeStamp = data[0].time - (date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds());
        timePart[j].start_time = data[0].time;
        pxPart[j].start_time = that.getPxByTime(data[0].time);
        for(var i= 0,n=data.length-1;i<n;i++){
            if(data[i + 1].time - data[i].time <= 5 *60){
                timePart[j].end_time = data[i+1].time;
                pxPart[j].end_time = that.getPxByTime(data[i+1].time);
            }else{
                j++;
                timePart[j]={};
                timePart[j].start_time = data[i+1].time;
                pxPart[j] = {};
                pxPart[j].start_time = that.getPxByTime(data[i+1].time);
            }
        }
        that.dataPart = pxPart;
        that.dataPart.map(function(item, key){
            $('.timelineMain').append('<div class="runPart" style="left:'+ item.start_time +'px;width:'+ (item.end_time - item.start_time) + 'px"></div>');
        })

        that.progress = pxPart[0].start_time - 20;
        $('.timelineProgress').css({'left':that.progress+'px'});
        that.currentProgress = pxPart[0].start_time - 20;
        that.initMouseX = $('.timelineProgress').offset().left + 20;
        that.currentPageX = $('.timelineProgress').offset().left + 20;
        if(typeof(canvasLayerRunning) != 'undefined'){
            map.removeOverlay(canvasLayerRunning);
            canvasLayerRunning = undefined;
        }
        that.playOrPause = 'timelinePlay';
        that.setRunningPointByProgress(pxPart[0].start_time - 20);
    },
    /*
     初始化时间轴
     */
    initTimeCount:function(){
        var tempA = [];
        var tempB = [];
        for(var i=0;i<24;i++){
            tempA[i] = i;
        }
        this.timeCount = tempA;
        for(var i=0;i<25;i++){
            tempB[i] = i;
        }
        this.timeNumber = tempB;
    },
    /*
     拖动事件监听
     @param {object} event 事件对象
     */
    onDrag:function(el){
        var that = this;
        var x = el.clientX - that.initMouseX;
        var newProress = x + that.currentProgress;
        if(newProress >= -20 && newProress <= 700){
            that.progress = newProress;
            $('.timelineProgress').css({'left':newProress+'px'});
        };
        that.setRunningPointByProgress(newProress);
    },
    /*
     拖动抬起鼠标
     @param {object} event 事件对象
     */
    onMouseUp:function(el){
        var that = this;
        that.handleProgressDragEnd(el);
        that.currentPageX = el.clientX;
    },
    /*
     拖动时间轴位置
     @param {object} event 事件对象
     */
    handleProgressDragEnd:function(event){
        var that = this;
        if(that.totalPointData.length === 0){
            return;
        }
        $(document).off('mousemove',that.onDrag);
        $(document).off('mouseup',that.onMouseUp);
        that.currentProgress = that.progress;
        that.setRunningPointByProgress(that.progress);
    },
    /*
     DOM操作回调，拖动时间轴位置
     @param {object} el 事件对象
     */
    handleProgressDragStart: function (el) {
        var that = this;
        if (that.totalPointData.length === 0) {
            return;
        }
        that.initMouseX = el.clientX;
    },
    /*
     DOM操作回调，播放停止轨迹
     @param {object} el 事件对象
     */
    handlePlayOrPause: function (el) {
        if (this.totalPointData.length === 0) {
            return;
        }
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        var that = this;
        var newStatus = '';
        var step = function(timestamp) {
            var speed = that.playSpeed[that.playSpeedIndex];
            that.progress = that.progress + speed;
            $('.timelineProgress').css({'left':that.progress+'px'});
            that.currentProgress = that.currentProgress + speed;
            that.currentPageX = that.currentPageX + speed;
            that.setRunningPointByProgress(that.progress + speed);
            if (that.progress + speed > 700) {
                newStatus = 'timelinePlay';
                that.playOrPause = newStatus;
                $('.timelineControl div').eq(0).removeClass('timelinePause').addClass('timelinePlay');
                return;
            }
            if (that.playOrPause === 'timelinePause') {
                requestAnimationFrame(step);
            }
        }
        if (el.target.className === 'timelinePause') {
            newStatus = 'timelinePlay';
            $('.timelineControl div').eq(0).removeClass('timelinePause').addClass('timelinePlay');
        } else {
            newStatus = 'timelinePause';
            $('.timelineControl div').eq(0).removeClass('timelinePlay').addClass('timelinePause');
            requestAnimationFrame(step);
        }
        this.playOrPause = newStatus;
    },
    /*
     DOM操作回调，加速播放
     @param {object} el 事件对象
     */
    handleQuick: function (el) {
        if (this.totalPointData.length === 0) {
            return;
        }
        if (this.playSpeedIndex === 10) {

        } else {
            this.playSpeedIndex = this.playSpeedIndex + 1;
        }
    },
    /*
     DOM操作回调，减速播放
     @param {object} el 事件对象
     */
    handleSlow: function (el) {
        if (this.totalPointData.length === 0) {
            return;
        }
        if (this.playSpeedIndex === 0) {

        } else {
            this.playSpeedIndex = this.playSpeedIndex - 1;
        }
    },
    /*
     DOM操作回调，点击时间轴跳跃时间
     @param {object} el 事件对象
     */
    handleJumpTime: function (el) {
        if (this.totalPointData.length === 0) {
            return;
        }
        if (el.target.className == 'timelineProgress') {
            return;
        }
        var that = this;
        var x = el.clientX - that.currentPageX + that.currentProgress;
        that.progress = x;
        $('.timelineProgress').css({'left':that.progress+'px'});
        that.currentProgress = x;
        that.currentPageX = el.clientX;
        that.setRunningPointByProgress(x);
    },
    //添加时间轴
    addtimeLine:function(){
        var timeCount = this.timeCount;
        var timeHourFirst_0;
        var timeHourFirst_23;
        var str='';
        timeCount.map(function(item, key){
            timeHourFirst_0 = (key === 0 ?'timeHourFirst':'');
            timeHourFirst_23 = (key === 23 ?'timeHourFinal':'');
            str += '<div class="timeHour ' + timeHourFirst_0 + timeHourFirst_23 +'"></div>';
        });
        return str;
    },
    //给时间轴画刻度
    addtimeNumber:function(){
        var timeNumber = this.timeNumber;
        var str = '';
        timeNumber.map(function(item, key){
            str += '<div class="timeNumber" style="left:'+ (key*29.6-1) +'px">'+ key +'</div>';
        });
        return str;
    },
    //添加时间进度
    addtimelineProgress:function(){
        var progress = this.progress;
        return '<div class="timelineProgress" style="left:'+ progress + 'px"></div>';
    }
};