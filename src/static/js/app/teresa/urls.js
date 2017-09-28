'use strict';
/*
	teresa相关数据请求配置
	author Liangqifei
	time 20170509
*/
var teresaUrls = {
	// serverUrl:'http://118.190.1.71:8088/',//window.location.protocol +'//'+ window.location.host +'/',//当前路由
	serverUrl: window.location.protocol +'//'+ window.location.host ,//当前路由
    //获取tiket
    // voucher:'Teresa/replay/voucher/',
    voucher:'/teresa/voucher/',
    //获取转运中心列表
    // replayStations:'teresa/replay-stations/',
    replayStations:'/teresa/stations/',
    //获取运单详情
    // waybill:'Teresa/replay/waybill/',
    waybill:'/teresa/waybill/',
    //获取转运中心
    replayStationsCar:'Teresa/replay/stations/char',
    //获取密钥Bingo
    ticket:'',
	/**
     * Jquery AJAX GET
     *
     * @param {string} url 请求url
     * @param {object} params 请求参数
     * @param {function} success 请求成功回调函数
     * @param {function} before 请求前函数
     * @param {function} fail 请求失败回调函数
     * @param {function} complete 请求完成回调函数
     */
    get: function (url, params, success, before, fail, complete) {
        if (before) {
            before();
        }
        fail = fail || function () { };
        complete = complete || function () { };
        $.ajax({
            url: this.serverUrl + url,
            type: 'GET',
            dataType: 'json',
            data: params
        })
        .done(success)
        .fail(fail)
        .always(complete);
    },
    getTicket:function(){
        // alert(window.location.protocol +'/'+ window.location.host +'/');
        $.ajax({
            url: this.serverUrl + this.voucher,
            type: 'GET',
            dataType: 'json',
            async:true,
            data: {username:'liangqifeiNO1',password:'3154'}
        })
        .done(function(data){
            if(data.status == 0){
                localStorage.ticket = data.result
                this.ticket = data.result;
                rhinoSearch.initRhino();
                rhinoSearch.addCartable(0);
            }else{
                alert("当前访问被拒绝，可能你是非法用户");
            }
        });
    }
};