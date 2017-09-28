'use strict';

/*
*   trhino交互
*   author liangqifei 20170508
*/

var rhinoSearch = {
	//默认选择车牌号查询,0为车牌号，1为转运中心
    device_type:0,
    //
    rect:'',
    //初始化
    initRhino:function(){
        this.removeOver();
        this.loadAllVehilces();
        this.carStatistics();
    },
    //获取地图上标注的
    removeOver:function(){
        var markers_gis = map.getOverlays();
        if(markers_gis.length > 0){
            for (var i = 0; i < markers_gis.length; i++) {
                if(markers_gis[i]._div !== undefined && markers_gis[i]._div.className == 'infoBox'){
                    continue;
                }else{
                    map.removeOverlay(markers_gis[i]);
                }

            }
        }
    },
	//模糊搜索车辆
    carNames:function(){
        var that = this;
    	$('.search-key').autocomplete({
            //request获取用户输入的字符，response是一个函数
            source:function(request,response){
                rhionUrls.get(rhionUrls.vehiclesName,{name:request.term,limit:50},function(data){
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
        加载车辆数据
        如果缩放级别小于10显示热区
        否则显示多车
    */
    loadAllVehilces:function(val){
        var that = this;
        var scale = map.getZoom();
    	this.rect = that.currentView();
        if(scale<4){
            rhionUrls.get(rhionUrls.hotspots,{rect:this.rect,scale:scale,limit:1},function(data){
                that.render(data);
            });
        }else if(scale<5 && scale >= 4){
            rhionUrls.get(rhionUrls.hotspots,{rect:this.rect,scale:scale,limit:3},function(data){
                that.render(data);
            });
        }else if(scale < 9 && scale >= 5){
            rhionUrls.get(rhionUrls.hotspots,{rect:this.rect,scale:scale,limit:10},function(data){
                that.render(data);
            });
        }else{
            rhionUrls.get(rhionUrls.geometry,{rect:this.rect,scale:scale,limit:200},function(data){
                var result = data.result;
                var list = '';
                for(var i=0;i<result.length;i++){
                    list+= result[i].id;
                    if (i != result.length - 1) {
                        list+= ",";
                    }
                }
                if(!list.length){
                    return ;
                }
                teresaSearch.addWaybill(list,result,val);
            });
        }
    },
    //统计在线车辆
    carStatistics:function(){
        rhionUrls.get(rhionUrls.statistics,{},function(data){
            $('.all-cars .all').html(data.result.all);
            $('.all-cars .running').html(data.result.running);
            $('.all-cars .stopped').html(data.result.stopped);
            $('.all-cars .offline').html(data.result.offline);
        })
    },
    //获取可视区域坐标点
    currentView:function(){
        //地图当前中心点
        var cp = map.getCenter();
        //地图可视区域
        var bs = map.getBounds();
        //地图可视区域左下角
        var bssw = bs.getSouthWest();
        //地图可视区右上角
        var bsne = bs.getNorthEast();
        return bssw.lng+','+bssw.lat+','+(bsne.lng-bssw.lng)+','+(bsne.lat-bssw.lat);
    },
    //获取指定车辆
    vehicles:function(val){
        rhionUrls.get(rhionUrls.vehicles,{ids:val},function(data){
            var result = data.result;
            var plate = {
                carPlate:result.id,
                obj:result

            }
            teresaSearch.addWaybill(result[0].id,result,'1');
        })
    },
    //列表数据
    addCartable:function(num){
        var that = this;
        var rect = that.currentView();
        var scale = map.getZoom();
        var str = '';
        rhionUrls.get(rhionUrls.geometry,{rect:rect,scale:scale,limit:200},function(data){
            if(data.status != 0){return ;}
            var result = [];
            var resultLength = data.result.length;
            var resultNum = '';
            var list="";
            //0全部，1行驶中，2禁止，3离线,4转运中心
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
            $('.all-cars .car-table tbody').empty().append('<tr style="border:0"><td colspan="10" style="border:0"><div style="text-align: center; margin: 62px auto;"><img src="/static/images/loading.gif">数据正在加载中...</div></td></tr>');
        })
    },
    //当前位置
    currentLocation:function(that){
        this.vehicles($(that).attr('name'));
    },
    //查询历史轨迹
    trackPlayback:function(that){
        var start = $(that).data('time');
        var plate = $(that).attr('name');
        // window.location.href = 'http://118.190.1.71:8088/Teresa/replay/index?start='+ start +'&plate='+escape(plate);
        window.location.href = '/teresa/replay?start='+ start +'&plate='+escape(plate);
    },
    //根据车牌获取响应运单
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
            $('.all-cars .car-table tbody').empty().append('<tr><td colspan="10">当前区域无车辆</td></tr>')
        }else{
            $('.all-cars .car-table tbody').empty().append(str);
        }
    },
    //聚合图
    render:function(data){
        var markers = [];
        for (var i =0; i< data.result.length; i++){
            var obj = data.result[i];
            var point = new BMap.Point(obj.lon ,obj.lat);
            if(obj.all<10){
                mapControl.addVehicleHotspots(point, 'vehicleHotspotsBlue', obj.all);
            }else if(obj.all>=10 && obj.all<50){
                mapControl.addVehicleHotspots(point, 'vehicleHotspotsGreen', obj.all);
            }else if(obj.all>=50 && obj.all<100){
                mapControl.addVehicleHotspots(point, 'vehicleHotspotsOrange', obj.all);
            }else if(obj.all>=100){
                mapControl.addVehicleHotspots(point, 'vehicleHotspotsRed', obj.all);
            }
        }
    }
}