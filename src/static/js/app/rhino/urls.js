'use strict';
/*
	rhino相关数据请求配置
	author Liangqifei
	time 20170509
*/
var rhionUrls = {
	serverUrl:'http://118.190.113.106:8088/',//window.location.protocol +'//'+ window.location.host +'/',//当前路由
	//获取搜索车辆
	vehiclesName:'rhino/vehicles/names',
    //获取全部车辆
    geometry:'rhino/vehicles/geometry',
    //获取指定车辆
    vehicles:'rhino/vehicles',
    //获取车辆在线状态统计
    statistics:'rhino/vehicles/statistics',
    //获取车辆热点数
    hotspots:'rhino/vehicles/hotspots',
	/**
     * Jquery AJAX GET
     *
     * @param {string} url 请求url
     * @param {object} params 请求参数
     * @param {function} success 请求成功回调函数
     * @param {function} before 请求前函数
     * @param {function} fail 请求失败回调函数
     * @param {function} after 请求完成回调函数
     */
    get: function (url, params, success, before, fail, complete) {
        if (before) {
            before();
        }
        params.ticket = localStorage.ticket;//"eyJzZWNyZXRfa2V5IjogIjU3YTZhMDgxMTgyOWZhZjM0YTc4Y2E2MjVjMzgzZWM5IiwgInVzZXJfaWQiOiAiYWRtaW4iLCAiYXBwX2lkIjogInRlcmVzYSIsICJ0aW1lIjogMTQ5MzgxNDc2MX0=";//localStorage.token;
        fail = fail || function () { };
        complete = complete || function () { };
        $.ajax({
            url: this.serverUrl + url,
            type: 'GET',
            dataType: 'json',
            data: params,
        })
        .done(success)
        .fail(fail)
        .always(complete);
    }
}