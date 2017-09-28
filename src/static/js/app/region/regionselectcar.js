'use strict';
/*
*	画框选车
*	author liangqifei 20170516
*/

var regSelect = {
	//获取选择类型0未选中，1选中
	select_type:0,
	//西南角
	bsswLng:0,
	bsswLat:0,
	//东北角
	bsneLng:0,
	bsneLat:0,
    drawingManagerInfo:null,
	//选择画框选车
	clickSelect:function(num){
		var that = this;
		that.select_type = num;
	},
	//添加画框
	addSelectCar:function(){
		var that = this;
		var overlays = [];
		var overlaycomplete = function(e){
	        overlays.push(e.overlay);
	        var bssw = overlays[0].getBounds().getSouthWest();
    		var bsne = overlays[overlays.length-1].getBounds().getNorthEast();
    		that.bsswLng = bssw.lng;
    		that.bsswLat = bssw.lat;
    		that.bsneLng = bsne.lng-bssw.lng;
    		that.bsneLat = bsne.lat-bssw.lat;

	        that.findCars(0);
	        drawingManager.close();//画完框后删除画框
            that.clickSelect(0);
	        clearAll();//清除所有覆盖物
	        $('.region-select').prop('checked',false);
	    };
	    var styleOptions = {
	        strokeColor:"red",    //边线颜色。
	        fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
	        strokeWeight:1,       //边线的宽度，以像素为单位。
	        strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
	        fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
	        strokeStyle: 'solid' //边线的样式，solid或dashed。
	    }
	    //实例化鼠标绘制工具
	    var drawingManager = new BMapLib.DrawingManager(map, {
	        isOpen: true, //是否开启绘制模式
	        enableDrawingTool: false, //是否显示工具栏
	        enableCalculate:false,//是否进行测距
	        rectangleOptions: styleOptions //矩形的样式
	    });
        this.drawingManagerInfo = drawingManager;
		 //添加鼠标绘制工具监听事件，用于获取绘制结果
	    drawingManager.addEventListener('overlaycomplete', overlaycomplete);
	    drawingManager.setDrawingMode(BMAP_DRAWING_RECTANGLE);
	    function clearAll() {
			for(var i = 0; i < overlays.length; i++){
	            map.removeOverlay(overlays[i]);
	        }
	        overlays.length = 0   
	    }
	},
	//查询框选车辆
	findCars:function(num){
		var that = this;
        var scale = map.getZoom();
        var rect = '';
        var data = {
            scale:scale,
            limit:200
        };
        if(that.bsneLat == 0){
            rect = that.bsswLng+','+that.bsswLat+','+that.bsneLng;
            data.circle = rect;
            $('.map-bottom .seach-cars .car-all i').html('该中心共');
        }else{
            rect = that.bsswLng+','+that.bsswLat+','+that.bsneLng+','+that.bsneLat;
            data.rect = rect;
            $('.map-bottom .seach-cars .car-all i').html('该区域共');
        }
        var str = '';
        rhionUrls.get(rhionUrls.geometry,data,function(data){
            if(data.status != 0){return ;}
            var result = [];
            var resultLength = data.result.length;
            var resultNum = '';
            var list="";
            //0全部，1行驶中，2禁止，3离线,4转运中心
            var all=0,run=0,stop=0,offLine=0;
            for(var j=0;j<resultLength;j++){
            	if(data.result[j].status==1){
            		run++;
            	}else if(data.result[j].status == 2){
            		stop++;
            	}else if(data.result[j].status == 3){
            		offLine++;
            	}
            }
            $('.seach-cars .all').html(resultLength);
            $('.seach-cars .running').html(run);
            $('.seach-cars .stopped').html(stop);
            $('.seach-cars .offline').html(offLine);

            if(num == 0){
                for(var i=0;i<resultLength;i++){
                    list+= data.result[i].id;
                    if (i != resultLength - 1) {
                        list+= ",";
                    }
                }
                result = data.result;
            }else{
                for(var i=0;i<resultLength;i++){
                    if(data.result[i].status == num){
                        list+= data.result[i].id;
                        if (i != resultLength - 1) {
                            list+= ",";
                        }
                        result.push(data.result[i]);
                    }
                }                
            }
            teresaUrls.get(teresaUrls.waybill,{carname:list},function(data){
                that.waybillList(data,result);
            });           
        },function(){
            $('.seach-cars .car-table tbody').empty().append('<tr style="border:0"><td colspan="10" style="border:0"><div style="text-align: center; margin: 62px auto;"><img src="/static/images/loading.gif">数据正在加载中...</div></td></tr>');
        })
    },
    waybillList:function(waybill,car){
        var str = '';
        var waybill = waybill.result;
        for(var i = 0;i<car.length;i++){
            var plate = car[i].id;
            var dataTime = new Date((car[i].time) * 1000);
            if(waybill == null){
                str += '<tr>'+
                    '<td>'+ (i+1) +'</td>'+
                    '<td>'+
                    '<button type="button" name="'+ plate +'" onclick="rhinoSearch.currentLocation(this)">当前位置</button>'+
                    '<button type="button" name="'+ plate +'" data-time="'+ car[i].time +'" onclick="rhinoSearch.trackPlayback(this)">轨迹回放</button>'+
                    '</td>'+
                    '<td>'+ plate +'</td>'+
                    '<td>无</td>'+
                    '<td>'+ car[i].text +'</td>'+
                    '<td>'+ car[i].address +'</td>'+
                    '<td>'+ dataTime.format('yyyy-MM-dd hh:mm:ss') +'</td>'+
                    '<td>无</td>'+
                    '<td>无</td>'+
                    '<td>无</td>'+
                    '</tr>';
            }else{

                for(var a = 0; a<waybill.length;a++){
                    if(car[i].id == waybill[a].carname){
                        car[i].waybill = waybill[a];
                        break;
                    }
                }
                var name = car[i].waybill !==undefined?car[i].waybill.name:'无';
                var code = car[i].waybill !==undefined?car[i].waybill.code:'无';
                var carid = car[i].waybill !==undefined?car[i].waybill.carid:'无';
                var linename = car[i].waybill !==undefined?car[i].waybill.linename:'无';
                str += '<tr>'+
                        '<td>'+ (i+1) +'</td>'+
                        '<td>'+
                        '<button type="button" name="'+ plate +'" onclick="rhinoSearch.currentLocation(this)">当前位置</button>'+
                        '<button type="button" name="'+ plate +'" data-time="'+ car[i].time +'" onclick="rhinoSearch.trackPlayback(this)">轨迹回放</button>'+
                        '</td>'+
                        '<td>'+ plate +'</td>'+
                        '<td>'+ name +'</td>'+
                        '<td>'+ car[i].text +'</td>'+
                        '<td>'+ car[i].address +'</td>'+
                        '<td>'+ dataTime.format('yyyy-MM-dd hh:mm:ss') +'</td>'+
                        '<td>'+ code +'</td>'+
                        '<td>'+ carid +'</td>'+
                        '<td>'+ linename +'</td>'+
                        '</tr>';
            }
            
        }
        if(car.length == 0){
            $('.seach-cars .car-table tbody').empty().append('<tr><td colspan="10">当前区域无车辆</td></tr>');
        }else{
            $('.seach-cars .car-table tbody').empty().append(str);
        }
        $('.map-bottom .seach-cars').css({
			height:'220px',
			zIndex:'200'
		});
		$('.seach-cars .map-bottom-nor').removeClass('hidden');//.show();
		$('.seach-cars-button').on('click',function(){
			$('.map-bottom .seach-cars').css({
				height:'0',
				zIndex:'200'
			});
			$('.seach-cars .map-bottom-nor').addClass('hidden');//.hide();
		})
    },
    closeWindow:function(){
        $('.map-bottom .seach-cars').css({
            height:'0',
            zIndex:'200'
        });
        $('.seach-cars .map-bottom-nor').addClass('hidden');//.hide();
        $('.region-select').prop('checked',false);
    },
    closeDrawingManager:function(){
        this.drawingManagerInfo.close();
        this.clickSelect(0);
    }
}