/**
*
*	@file 轨迹分析
*	@author phoebe 2017.1.9
*
**/
'use strict';
var TrackAnalysis = {
    //父容器看见性
    parentVisible:{},
    //轨迹纠偏开关状态及样式
    processSwitch:'processSwitchOff',
    //驾驶分析开关状态及样式
    behaviorSwitch:'behaviorSwitchOff',
    //轨迹纠偏标题文字状态及样式
    analysisHeaderTitle1:'analysisHeaderTitle1Off',
    //轨迹纠偏标题图标状态及样式
    analysisHeaderPoint1:'analysisHeaderPointOffDown',
    //轨迹纠偏标题文字状态及样式
    analysisHeaderTitle2:'analysisHeaderTitle2Off',
    //轨迹纠偏标题图标状态及样式
    analysisHeaderPoint2:'analysisHeaderPointOffDown',
    //驾驶分析数字状态及样式
    controlItemNum1:'controlItemNumOff',
    //驾驶分析数字状态及样式
    controlItemNum2:'controlItemNumOff',
    //驾驶分析数字状态及样式
    controlItemNum3:'controlItemNumOff',
    //驾驶分析数字状态及样式
    controlItemNum4:'controlItemNumOff',
    //当前显示控件：0无，1轨迹纠偏，2轨迹分析
    analysisTab:0,
    //当前轨迹纠偏对象
    trackProcess:{
        is_processed: '',//纠偏
        need_denoise: '0',//去燥
        need_vacuate: '0',//抽稀
        need_mapmatch: '0'//绑路
    },
    //当前轨迹驾驶行为分析
    behavior:{
        behaviorSpeeding:0,
        behaviorAcceleration:0,
        behaviorSteering:0,
    },
    //停留点信息
    behaviorStaypoint:0,
    //驾驶行为四个checkbox状态，0未选中，1选中
    behaviorCheck:[0,0,0,0],
    //view内部，设置checkbox样式
    setCheckboxStyle: function (id,el){
        var that = this;
        if(el.parent().hasClass('disabled')){
            return false;
        }
        if(id=='denoise'){
            if($('#denoise').prop('checked')==true){
                var temp = {};
                temp.is_processed = that.trackProcess.is_processed;
                temp.need_denoise = '1';
                temp.need_vacuate = that.trackProcess.need_vacuate;
                temp.need_mapmatch = that.trackProcess.need_mapmatch;
                that.trackProcess=temp;
                that.updateTrackProcess(temp);
                $('#denoise').parent().addClass('checked');
                $('#denoise').prop('checked',false);
            }else{
                var temp = {};
                temp.is_processed = that.trackProcess.is_processed;
                temp.need_denoise = '0';
                temp.need_vacuate = that.trackProcess.need_vacuate;
                temp.need_mapmatch = that.trackProcess.need_mapmatch;
                that.trackProcess=temp;
                that.updateTrackProcess(temp);
                $('#denoise').parent().removeClass('checked');
                $('#denoise').prop('checked',true);
            }
        }
        if(id=='vacuate'){
            if($('#vacuate').prop('checked')==true){
                var temp = {};
                temp.is_processed = that.trackProcess.is_processed;
                temp.need_denoise = that.trackProcess.need_denoise;
                temp.need_vacuate = '1';
                temp.need_mapmatch = that.trackProcess.need_mapmatch;
                that.trackProcess=temp;
                that.updateTrackProcess(temp);
                $('#vacuate').parent().addClass('checked');
                $('#vacuate').prop('checked',false);
            }else{
                var temp = {};
                temp.is_processed = that.trackProcess.is_processed;
                temp.need_denoise = that.trackProcess.need_denoise;
                temp.need_vacuate = '0';
                temp.need_mapmatch = that.trackProcess.need_mapmatch;
                that.trackProcess=temp;
                that.updateTrackProcess(temp);
                $('#vacuate').parent().removeClass('checked');
                $('#vacuate').prop('checked',true);
            }
        }
        if(id=='mapmatch'){
            if($('#mapmatch').prop('checked')==true){
                var temp = {};
                temp.is_processed = that.trackProcess.is_processed;
                temp.need_denoise = that.trackProcess.need_denoise;
                temp.need_vacuate = that.trackProcess.need_vacuate;
                temp.need_mapmatch = '1';
                that.trackProcess=temp;
                that.updateTrackProcess(temp);
                $('#mapmatch').parent().addClass('checked');
                $('#mapmatch').prop('checked',false);
            }else{
                var temp = {};
                temp.is_processed = that.trackProcess.is_processed;
                temp.need_denoise = that.trackProcess.need_denoise;
                temp.need_vacuate = that.trackProcess.need_vacuate;
                temp.need_mapmatch = '0';
                that.trackProcess=temp;
                that.updateTrackProcess(temp);
                $('#mapmatch').parent().removeClass('checked');
                $('#mapmatch').prop('checked',true);
            }
        }
        if(id=='speeding'){
            if($('#speeding').prop('checked')==true){
                that.controlItemNum1='controlItemNumOn';
                var temp = that.behaviorCheck;
                temp[0] = '1';
                that.behaviorCheck=temp;
                //that.updateAnalysisBehavior(temp);
                $('#speeding').parent().removeClass('checked');
                $('#speeding').prop('checked',false);
            }else{
                that.controlItemNum1='controlItemNumOff';
                var temp = that.behaviorCheck;
                temp[0] = '0';
                that.behaviorCheck=temp;
                // that.updateAnalysisBehavior(temp);
                $('#speeding').parent().addClass('checked');
                $('#speeding').prop('checked',true);
            }
        }
        if(id=='acceleration'){
            if($('#acceleration').prop('checked')==true){
                that.controlItemNum2='controlItemNumOn';
                var temp = that.behaviorCheck;
                temp[1] = '1';
                that.behaviorCheck=temp;
                // that.updateAnalysisBehavior(temp);
                $('#acceleration').parent().removeClass('checked');
                $('#acceleration').prop('checked',false);
            }else{
                that.controlItemNum2='controlItemNumOn';
                var temp = that.behaviorCheck;
                temp[1] = '0';
                that.behaviorCheck=temp;
                // that.updateAnalysisBehavior(temp);
                $('#acceleration').parent().addClass('checked');
                $('#acceleration').prop('checked',true);
            }
        }
        if(id=='steering'){
            if($('#steering').prop('checked')==true){
                that.controlItemNum3='controlItemNumOn';
                var temp = that.behaviorCheck;
                temp[2] = '1';
                that.behaviorCheck=temp;
                // that.updateAnalysisBehavior(temp);
                $('#steering').parent().removeClass('checked');
                $('#steering').prop('checked',false);
            }else{
                that.controlItemNum3='controlItemNumOn';
                var temp = that.behaviorCheck;
                temp[2] = '0';
                that.behaviorCheck=temp;
                // that.updateAnalysisBehavior(temp);
                $('#steering').parent().addClass('checked');
                $('#steering').prop('checked',true);
            }
        }
        if(id=='staypoint'){
            if($('#staypoint').prop('checked')==true){
                that.controlItemNum4='controlItemNumOn';
                var temp = that.behaviorCheck;
                temp[3] = '1';
                that.behaviorCheck=temp;
                // that.updateAnalysisBehavior(temp);
                $('#staypoint').parent().removeClass('checked');
                $('#staypoint').prop('checked',false);
            }else{
                that.controlItemNum4='controlItemNumOn';
                var temp = that.behaviorCheck;
                temp[3] = '0';
                that.behaviorCheck=temp;
                // that.updateAnalysisBehavior(temp);
                $('#staypoint').parent().addClass('checked');
                $('#staypoint').prop('checked',true);
            }
        }
    },
    //DOM操作回调，切换轨迹纠偏总开关
    handleProcessSwitch: function(event) {
        var that = this;
        if (that.processSwitch === 'processSwitchOn') {
            that.processSwitch='processSwitchOff';
            that.analysisHeaderTitle1='analysisHeaderTitle1Off';
            that.analysisHeaderPoint1='analysisHeaderPointOffUp';
            var temp = {};
            temp.is_processed = '0';
            temp.need_denoise = that.trackProcess.need_denoise;
            temp.need_vacuate = that.trackProcess.need_vacuate;
            temp.need_mapmatch = that.trackProcess.need_mapmatch;
            that.trackProcess=temp;
            that.updateTrackProcess(temp);
            $('.trackAnalysisProcess .icheckbox_square-blue').each(function(){
                $(this).addClass('disabled');
            });
            $('.processSwitchOn').removeClass('processSwitchOn').addClass('processSwitchOff');
            $('.trackAnalysisHeader div').eq(0).removeClass().addClass('analysisHeaderTitle1Off');
            $('.trackAnalysisHeader div').eq(1).removeClass().addClass('analysisHeaderPointOffUp');
        } else {
            that.processSwitch='processSwitchOn';
            that.analysisHeaderTitle1='analysisHeaderTitle1On';
            that.analysisHeaderPoint1='analysisHeaderPointOnUp';
            var temp = {};
            temp.is_processed = '1';
            temp.need_denoise = that.trackProcess.need_denoise;
            temp.need_vacuate = that.trackProcess.need_vacuate;
            temp.need_mapmatch = that.trackProcess.need_mapmatch;
            that.trackProcess=temp;
            that.updateTrackProcess(temp);
            $('.trackAnalysisProcess .icheckbox_square-blue').each(function(){
                $(this).removeClass('disabled');
            });
            $('.processSwitchOff').removeClass('processSwitchOff').addClass('processSwitchOn');
            $('.trackAnalysisHeader div').eq(0).removeClass().addClass('analysisHeaderTitle1On');
            $('.trackAnalysisHeader div').eq(1).removeClass().addClass('analysisHeaderPointOnUp');
        }
    },
    //DOM操作回调，切换驾驶分析总开关
    handleBehaviorSwitch: function(event) {
        var that = this;
        if (that.behaviorSwitch === 'behaviorSwitchOn') {
            that.behaviorSwitch='behaviorSwitchOff',
                that.analysisHeaderTitle2='analysisHeaderTitle2Off';
            that.analysisHeaderPoint2='analysisHeaderPointOffUp';
            that.controlItemNum1='controlItemNumOff';
            that.controlItemNum2='controlItemNumOff';
            that.controlItemNum3='controlItemNumOff';
            that.controlItemNum4='controlItemNumOff';
            // $('.behaviorControlItem input').iCheck('disable');
            // that.updateAnalysisBehavior(['0','0','0','0']);
            $('.trackAnalysisBehavior .icheckbox_square-blue').each(function(){
                $(this).addClass('disabled');
            });
            $('.behaviorSwitchOn').removeClass('behaviorSwitchOn').addClass('behaviorSwitchOff');
            $('.trackAnalysisHeader div').eq(3).removeClass().addClass('analysisHeaderTitle2Off');
            $('.trackAnalysisHeader div').eq(4).removeClass().addClass('analysisHeaderPointOffUp');
        } else {
            that.behaviorSwitch='behaviorSwitchOn';
            that.analysisHeaderTitle2='analysisHeaderTitle2On';
            that.analysisHeaderPoint2='analysisHeaderPointOnUp';
            // $('.behaviorControlItem input').iCheck('enable');
            that.behaviorCheck;
            that.controlItemNum1=that.behaviorCheck[0] === '0' ? 'controlItemNumOff' : 'controlItemNumOn';
            that.controlItemNum2=that.behaviorCheck[1] === '0' ? 'controlItemNumOff' : 'controlItemNumOn';
            that.controlItemNum3=that.behaviorCheck[2] === '0' ? 'controlItemNumOff' : 'controlItemNumOn';
            that.controlItemNum4=that.behaviorCheck[3] === '0' ? 'controlItemNumOff' : 'controlItemNumOn';
            // that.updateAnalysisBehavior(that.behaviorCheck);
            $('.trackAnalysisBehavior .icheckbox_square-blue').each(function(){
                $(this).removeClass('disabled');
            });
            $('.behaviorSwitchOff').removeClass('behaviorSwitchOff').addClass('behaviorSwitchOn');
            $('.trackAnalysisHeader div').eq(3).removeClass().addClass('analysisHeaderTitle2On');
            $('.trackAnalysisHeader div').eq(4).removeClass().addClass('analysisHeaderPointOnUp');
        }
    },
    //DOM操作回调，开关轨迹纠偏面板
    handleToggleProcess: function(el,index) {
        var that = this;
        if (that.analysisTab === 0 || that.analysisTab === 2) {
            that.analysisTab=1;
            if (that.processSwitch === 'processSwitchOn') {
                that.analysisHeaderPoint1='analysisHeaderPointOnUp';
                if(index == 0){
                    el.next().removeClass('analysisHeaderPointOnDown').addClass('analysisHeaderPointOnUp');
                }else if(index==1){
                    el.removeClass('analysisHeaderPointOnDown').addClass('analysisHeaderPointOnUp');
                }
                $('.trackAnalysisProcess').removeClass('hidden').addClass('visible');
            } else {
                that.analysisHeaderPoint1='analysisHeaderPointOffUp';
                if(index == 0){
                    el.next().removeClass('analysisHeaderPointOffDown').addClass('analysisHeaderPointOffUp');
                }else if(index==1){
                    el.removeClass('analysisHeaderPointOffDown').addClass('analysisHeaderPointOffUp');
                }
                $('.trackAnalysisProcess').removeClass('hidden').addClass('visible');
            }
            if (that.behaviorSwitch === 'behaviorSwitchOn') {
                that.analysisHeaderPoint2='analysisHeaderPointOnDown';
                el.parent().children().eq(4).removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');
                $('.trackAnalysisBehavior').removeClass('visible').addClass('hidden');
            } else {
                that.analysisHeaderPoint2='analysisHeaderPointOffDown';
                el.parent().children().eq(4).removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
                $('.trackAnalysisBehavior').removeClass('visible').addClass('hidden');
            }
        } else {
            that.analysisTab=0;
            if (that.processSwitch === 'processSwitchOn') {
                that.analysisHeaderPoint1='analysisHeaderPointOnDown';
                if(index == 0){
                    el.next().removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');
                }else if(index==1){
                    el.removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');
                }
                $('.trackAnalysisProcess').removeClass('visible').addClass('hidden');
            } else {
                that.analysisHeaderPoint1='analysisHeaderPointOffDown';
                if(index == 0){
                    el.next().removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
                }else if(index==1){
                    el.removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
                }
                $('.trackAnalysisProcess').removeClass('visible').addClass('hidden');
            }
        }
    },
    //DOM操作回调，开关驾驶行为分析面板
    handleToggleBehavior: function(el,index) {
        var that = this;
        if (that.analysisTab === 0 || that.analysisTab === 1) {
            that.analysisTab=2;
            if (that.behaviorSwitch === 'behaviorSwitchOn') {
                that.analysisHeaderPoint2='analysisHeaderPointOnUp';
                if(index == 3){
                    el.next().removeClass('analysisHeaderPointOnDown').addClass('analysisHeaderPointOnUp');
                }else if(index==4){
                    el.removeClass('analysisHeaderPointOnDown').addClass('analysisHeaderPointOnUp');
                }
                $('.trackAnalysisBehavior').removeClass('hidden').addClass('visible');
            } else {
                that.analysisHeaderPoint2='analysisHeaderPointOffUp';
                if(index == 3){
                    el.next().removeClass('analysisHeaderPointOffDown').addClass('analysisHeaderPointOffUp');
                }else if(index==4){
                    el.removeClass('analysisHeaderPointOffDown').addClass('analysisHeaderPointOffUp');
                }
                $('.trackAnalysisBehavior').removeClass('hidden').addClass('visible');
            }
            if (that.processSwitch === 'processSwitchOn') {
                that.analysisHeaderPoint1='analysisHeaderPointOnDown';
                el.parent().children().eq(1).removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');
                $('.trackAnalysisProcess').removeClass('visible').addClass('hidden');
            } else {
                that.analysisHeaderPoint1='analysisHeaderPointOffDown';
                el.parent().children().eq(1).removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
                $('.trackAnalysisProcess').removeClass('visible').addClass('hidden');
            }
        } else {
            that.analysisTab=0;
            if (that.behaviorSwitch === 'behaviorSwitchOn') {
                that.analysisHeaderPoint2='analysisHeaderPointOnDown';
                if(index == 3){
                    el.next().removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');
                }else if(index==4){
                    el.removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');
                }
                $('.trackAnalysisBehavior').removeClass('visible').addClass('hidden');
            } else {
                that.analysisHeaderPoint2='analysisHeaderPointOffDown';
                if(index == 3){
                    el.next().removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
                }else if(index==4){
                    el.removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
                }
                $('.trackAnalysisBehavior').removeClass('visible').addClass('hidden');
            }
        }
    },
    //DOM操作回调，关闭面板
    handleClose: function(el) {
        var that = this;
        if (that.analysisTab === 1){
            if (that.processSwitch === 'processSwitchOn') {
                that.analysisHeaderPoint1='analysisHeaderPointOnDown';
                $('.trackAnalysisHeader').children().eq(1).removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');
            } else {
                that.analysisHeaderPoint1='analysisHeaderPointOffDown';
                $('.trackAnalysisHeader').children().eq(1).removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
            }
            $('.trackAnalysisProcess').removeClass('visible').addClass('hidden');
        } else {
            if (that.behaviorSwitch === 'behaviorSwitchOn') {
                that.analysisHeaderPoint2='analysisHeaderPointOnDown';
                $('.trackAnalysisHeader').children().eq(4).removeClass('analysisHeaderPointOnUp').addClass('analysisHeaderPointOnDown');

            } else {
                that.analysisHeaderPoint2='analysisHeaderPointOffDown';
                $('.trackAnalysisHeader').children().eq(4).removeClass('analysisHeaderPointOffUp').addClass('analysisHeaderPointOffDown');
            }
            $('.trackAnalysisBehavior').removeClass('visible').addClass('hidden');
        }
        that.analysisTab=0;
    },
    //view内部，修改纠偏选项后重新加载路径
    updateTrackProcess: function(data) {
        var that = this;
        tracksearch.onUpdateprocess(data);
        tracksearch.searchTrack('trackAnalysisProcess');
    },
    //view内部，更新驾驶行为分析显示
    updateAnalysisBehavior: function(data) {
        var that = this;
        data = data || that.behaviorCheck;
        mapControl.updataBehaviorDisplay(data);
    }
};
