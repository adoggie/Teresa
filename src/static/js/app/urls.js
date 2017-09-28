/**
*
*	鹰眼相关数据请求配置
*	@time 20170104
*
**/
'use strict';
var urls = {
    //获取路由
    serverUrl:'http://118.190.113.106:8088/',//window.location.protocol +'//'+ window.location.host +'/',
    //获取历史轨迹
    gethistory:'rhino/vehicles/track',
    //获取当前位置
    list:'http://api.map.baidu.com/trace/v2/entity/list',
    //搜索当前位置
    searchEntity:'http://yingyan.baidu.com/api/v3/entity/search',
    // 获取驾驶行为分析信息
    getBehaviorAnalysis: '//yingyan.baidu.com/api/v2/analysis/drivingbehavior',
    // 获取停留点
    getstaypoint: '//yingyan.baidu.com/api/v2/analysis/staypoint',
    //车牌模糊搜索url
    plateUrl:'rhino/vehicles/names',
    /*
     @param {string} url 请求url
     @param {object} data 请求参数
     @param {function} success 请求成功回调函数
     */
    gpsGet:function(url,data,success){
        var that = this;
        data.ticket = "eyJzZWNyZXRfa2V5IjogIjU3YTZhMDgxMTgyOWZhZjM0YTc4Y2E2MjVjMzgzZWM5IiwgInVzZXJfaWQiOiAiYWRtaW4iLCAiYXBwX2lkIjogInRlcmVzYSIsICJ0aW1lIjogMTQ5MzgxNDc2MX0=";//localStorage.token;
        $.ajax({
            url:this.serverUrl+url,
            type:'get',
            dataType:'json',
            data:data,
            success:success
        })
    },
    bdGet:function(){
        $.ajax({
            url:this.gethistory,
            type:'get',
            dataType:'json',
            success:function(data){
                Trackcontent.listenTrackRoute(data);
                timeline.listenTrackRoute(data);
            }
        });
    }
};
