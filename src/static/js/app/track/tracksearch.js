/*
* @file 轨迹查询时间车牌设备号筛选
* @time 20170213
*/
'use strict'
var tracksearch = {
    //默认选择车牌号查询0为车牌号，1位设备号
    device_type:0,
    //起始时间
    start_time :'',
    //结束时间
    end_time:'',
    //设备标识
    device_name:'',
    //是否返回纠偏后的轨迹,0关闭轨迹纠偏返回原始轨迹，1打开轨迹纠返回纠偏后的轨迹，
    is_processed:0,
    //纠偏选项
    process_option:{
        need_denoise:0,//去燥
        need_vacuate:0,//抽稀
        need_mapmatch:0//绑路
    },
    /*
    *   事件响应，驾驶分析
    *   @param {object} data 轨迹纠偏选项
    * */
    onUpdateprocess: function(data) {
        this.is_processed = data.is_processed;
        this.process_option.need_denoise = data.need_denoise;
        this.process_option.need_vacuate = data.need_vacuate;
        this.process_option.need_mapmatch = data.need_mapmatch;
    },
    /*
     初始化时间选择插件
     */
    initTrackDatetime:function(){
        var that = this;
        $('.datetimepicker').datetimepicker({
            format:'yyyy-mm-dd hh:ii:ss',
            language: 'zh-CN',
            weekStart: 1,
            todayBtn:  1,
            autoclose: true,
            todayHighlight: 1,
            startView: 2,
            forceParse: 0,
            pickerPosition: 'bottom-left'
        }).on('mousedown',function(){
            if($(this).attr('id') == 'datetimepicker_start'){
                $('#datetimepicker_end').datetimepicker('hide')
            }else if($(this).attr('id') == 'datetimepicker_end'){
                $('#datetimepicker_start').datetimepicker('hide');
            }
        });
        $('.datetimepicker').on('changeDate',function(){
            $('.time_error').html('');
        });
        $('#datetimepicker_start').on('changeDate',function(){
            $('.start_error').html('');
        });
    },
    /*
    *   dom操作，选择查找类型，设备号或者车牌号，车牌号为模糊搜索
    */
    selectPlateSim:function(){
        var that = this;
        that.divice_type = $('#plateOrSim').val();
        $('.searchInputMonitor_2').on('focus',function(){
            $('.deviceName_error').html('');
        });
        $('#plateOrSim').on('change',function(){
            $('.searchInputMonitor_2').val('');
            $('.deviceName_error').html('');
            if($(this).val()== 0){
                $('.searchInputMonitor_2').autocomplete('enable');
            }else{
                $('.searchInputMonitor_2').autocomplete('disable');
            }
            that.divice_type = $('#plateOrSim').val();
        });
        $('.searchInputMonitor_2').autocomplete({
            //request获取用户输入的字符，response是一个函数
            source:function(request,response){
                urls.gpsGet(urls.plateUrl,{name:request.term,limit:50},function(data){
                    if(data.status==0){
                        var dataList = data.result;
                        if(dataList.length){
                            response($.map(dataList,function(item){
                                return {
                                    label:item,
                                    value:item
                                }
                            }))
                        }else{
                            response([{label:'未找到该车辆',value:''}]);
                        }
                    }
                });
            },
            select:function(event,ui){
                that.deviceName = ui.item.value;
            }
        });
    },
    /*
    *   提交开始结束时间和设备号查询轨迹
    *   @param {string} startTime 开始时间
    *   @param {string} endTime 结束时间
    *   @param {string} deviceType 设备类型
    *   @param {string} deviceName 设备标识
    */
    searchTrack:function(domC){
        var that = this;
        var startTime = $('#datetimepicker_start .datetimeInput').val();
        var endTime = $('#datetimepicker_end .datetimeInput').val();
        var deviceType = $('#plateOrSim').val();
        var deviceName = $('.searchInputMonitor_2').val();
        //var trackJp = el.target.parentElement.className;
        that.device_name = deviceName;
        that.start_time = (Date.parse(new Date(startTime)))/1000;
        that.end_time = (Date.parse(new Date(endTime)))/1000;
        that.device_type = deviceType;
        var errorTime = that.end_time - that.start_time;//结束时间不能小于起始时间
        var exceedTime = errorTime>24*60*60;//查询时长不能大于三天
        if(domC == 'trackAnalysisProcess'){
            if(startTime == ''|| endTime == '' || deviceName == ''){
                return;
            }
        }
        if(startTime == ''){
            $('.start_error').html('开始时间不能为空');
            return;
        }else if(endTime == ''){
            $('.time_error').html('结束时间不能为空');
            return;
        }else if(errorTime<0){
            $('.time_error').html('结束时间不能小于开始时间');
            return;
        }else if(exceedTime){
            $('#timeErrorModal').modal('show');
            //$('.time_error').html('不能查询超过三天的数据');
            return;
        }else if(that.device_name==''){
            $('.deviceName_error').html('设备标识不能为空');
            return;
        }
        var searchData = {
            // 'device_type':that.device_type,
            'start':that.start_time,
            'end':that.end_time,
            'id':that.device_name,
            // 'is_processed':that.is_processed,
            // 'process_option':'need_denoise=' + that.process_option.need_denoise + ',' +
            //                  'need_vacuate=' + that.process_option.need_vacuate + ',' +
            //                  'need_mapmatch=' + that.process_option.need_mapmatch
        };
        mapControl.removeBehaviorOverlay();
        urls.gpsGet(urls.gethistory,searchData,function(data){
            if(data.status == 0){
                if(data.result.length == 0){
                    $('#noDataModal').modal('show');
                }
                Trackcontent.listenTrackRoute(data);
                timeline.listenTrackRoute(data);
            }else if(data.errcode == 2001){
                $('.deviceName_error').html('系统内部运行故障');
            }else if(data.errcode == 1002){
                $('.deviceName_error').html('目标对象不存在');
            }else if(data.errcode == 1004){
                $('.deviceName_error').html('令牌错误');
            }
        })
    },
    /*
    *   DOM重置搜索条件
    * */
    onReset:function(){
        $('#datetimepicker_start .datetimeInput').val('');
        $('#datetimepicker_end .datetimeInput').val('');
        $('.searchInputMonitor_2').val('');
        $('#plateOrSim option:first').prop("selected", 'selected');
        $('#plateOrSim').val(0);
        $('.searchInputMonitor_2').autocomplete('enable');
        $('.error').html('');
    }
};