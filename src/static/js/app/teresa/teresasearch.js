'use strict';
/*
*   teresa交互
*   author liangqifei 20170508
*/
var teresaSearch = {
    //车辆信息
    sContent:'',
    //坐标
    coordinate:{
        lon:0,
        lat:0
    },
    //转运中心数据
    transit_center:null,
    //模糊搜索转运中心
	transitCenter:function(){
        var that = this;
    	$('.search-key').autocomplete({
            //request获取用户输入的字符，response是一个函数
            source:function(request,response){
                teresaUrls.get(teresaUrls.replayStationsCar,{location_name:request.term},function(data){
                    var dataList = data.result;
                    if(dataList == null){
                        response([{label:'未找到该转运中心',value:''}]);
                    }else{
                        if(dataList.length){
                            response($.map(dataList,function(item){
                                return {
                                    label:item.name,
                                    value:item.name,
                                    code:item.code,
                                    address:item.address,
                                    lon:item.lon,
                                    lat:item.lat
                                }
                            }))
                        }else{
                            response([{label:'未找到该转运中心',value:''}]);
                        }
                    }                    
                });
            },
            select:function(event,ui){
                that.deviceName = ui.item.value;
                that.transit_center = {
                    name:ui.item.value,
                    code:ui.item.code,
                    address:ui.item.address,
                    lon:ui.item.lon,
                    lat:ui.item.lat
                }
            }
        });
    },
    //获取车辆运单
    addWaybill:function(plate,carDate,val){
        var that = this;
        var str = '';
        teresaUrls.get(teresaUrls.waybill,{carname:plate},function(data){
            that.render(data,carDate,val);
        });
    },
    //添加转运中心
    addTransitCenter:function(val){
        var that = this;
        var point = null;
        var transit = that.transit_center;
        var label = null;
        if(that.transit_center!==null){
            addTransit();
        }else{
            teresaUrls.get(teresaUrls.replayStationsCar,{location_name:val},function(data){
                if(data.result == null){
                    return ;
                }else{
                    var result = data.result[0];
                    transit = {
                        name:result.name,
                        code:result.code,
                        address:result.address,
                        lon:result.lon,
                        lat:result.lat
                    };
                    $('.search-key').val(transit.name);
                    addTransit();
                }
            });
        }
        function addTransit(){
            point = new BMap.Point(transit.lon,transit.lat);
            label = new BMap.Label(transit.name,{offset:new BMap.Size(20,-10)});
            // point = new BMap.Point(lon,lat);
            var icon = new BMap.Icon("/static/images/Slice10.png", new BMap.Size(15,32));
            var marker = new BMap.Marker(point,{icon:icon});
            map.centerAndZoom(point, 14);
            map.clearOverlays();
            map.addOverlay(marker);
            //设置标注名称
            // var label = new BMap.Label(name,{offset:new BMap.Size(20,-10)});
            label.setStyle({
                'max-width':'none'
            });
            marker.setLabel(label);
            //创建圆对象
            var circle = new BMap.Circle(point, 1000, {
                strokeColor: "#ff4949",
                strokeWeight: 2,
                fillColor: "#ff4949",
                fillOpacity: 0.15
            });
            //画到地图上面
            map.addOverlay(circle);
            var bssw = circle.getCenter();
            var bsne = circle.getRadius();
            regSelect.bsswLng = bssw.lng;
            regSelect.bsswLat = bssw.lat;
            regSelect.bsneLng = ((1/60)/1860* bsne).toFixed(5);
            regSelect.bsneLat = 0;
            regSelect.findCars(0);
            that.transit_center = null;
        }
    },
    //注入车辆信息
    addAnnotated:function(carNor,val){
        var that = this;
        //批量添加标注信息
        if(val == '1'){
            //单车搜索添加标注信息
            var carDate = carNor.obj;
            var opts = {
                width : 200,     // 信息窗口宽度
            }
            var str = carNor.str;
            mapControl.openInfo(str,'',carDate);
        }else if(val == '2'){

        }else{
            var carDate = carNor.obj;
            var marker = carNor.marker;
            var str = carNor.str;
            mapControl.addClickHandler(str,marker);            
        }
    },
    //
    render:function(data,carDate,val){
        var that = this;
        var point = '';
        var icon = '';
        var marker = '';
        if(val == '2'){
            $('.transit-center-car').html(carDate.length);
            $('.transit-center-tab').removeClass('hidden');
        }
        for (var i =0; i< carDate.length; i++){
            var obj = carDate[i];
            var str = '';
            if(obj.status == 1){
                point = new BMap.Point(obj.lon ,obj.lat);
                icon = new BMap.Icon("/static/images/Slice8.png", new BMap.Size(28,28));
                marker = new BMap.Marker(point,{icon:icon});
                str = '<div class="car-nor">'+
                    '<div class="car-running-win">'+
                    '<i class="fa fa-truck"></i>'+
                    '<span>' + obj.id + '</span>'+
                    '</div>';
            }else if(obj.status == 2){
                point = new BMap.Point(obj.lon ,obj.lat);
                icon = new BMap.Icon("/static/images/Slice7.png", new BMap.Size(28,28));
                marker = new BMap.Marker(point,{icon:icon});
                str = '<div class="car-nor">'+
                    '<div class="car-stopped-win">'+
                    '<i class="fa fa-truck"></i>'+
                    '<span>' + obj.id + '</span>'+
                    '</div>';
            }else if(obj.status == 3){
                point = new BMap.Point(obj.lon ,obj.lat);
                icon = new BMap.Icon("/static/images/Slice9.png", new BMap.Size(28,28));
                marker = new BMap.Marker(point,{icon:icon});
                str = '<div class="car-nor">'+
                    '<div class="car-offline-win">'+
                    '<i class="fa fa-truck"></i>'+
                    '<span>' + obj.id + '</span>'+
                    '</div>';
            }
            map.addOverlay(marker);// 将标注添加到地图中
            var dateTime = new Date((obj.time) * 1000);
            str +=  '<dl class="dl-horizontal">'+
                        '<dt>发动机：</dt><dd>' + obj.text + '</dd>'+
                    '<dt>当前位置：</dt><dd>'+ obj.address +'</dd>'+
                    '<dt>定位时间：</dt><dd>' + dateTime.format('yyyy-MM-dd hh:mm:ss') + '</dd>'+
                '</dl>'+
                '<hr>';

            var result = data.result;
            if(result == null){
                //查询的所有运单没有
                str += 
                    '<div class="waybill text-center">'+
                        '当前没有进行中运单'+
                    '</div>';
            }else{
                for(var a = 0;a<result.length;a++){
                    if(obj.id == result[a].carname ){
                        obj.result = result[a];
                        break;
                    }
                }
                if(obj.result ==undefined){
                    str += 
                        '<div class="waybill text-center">'+
                            '当前没有进行中运单'+
                        '</div>';
                }else{
                    str += 
                        '<dl class="dl-horizontal">'+
                        '<dt>承运商：</dt><dd>'+ obj.result.name +'</dd>'+
                        '<dt>运单号：</dt><dd>'+ obj.result.code +'</dd>'+
                        '<dt>车签号：</dt><dd>'+ obj.result.carid +'</dd>'+                            
                        '<dt>运输线路：</dt><dd>'+ obj.result.linename +'</dd>'+
                        '</dl>'+
                        '<button type="button" style="margin: 0 0 0 111px" name="'+ obj.id +'" data-time="'+ obj.time +'" onclick="rhinoSearch.trackPlayback(this)">轨迹回放</button>'+
                        '<div>'
                }
            }
            that.sContent =str;
            var carDateList = {
                obj:obj,
                marker:marker,
                str:str
            }
            teresaSearch.addAnnotated(carDateList,val);
        }
    }
};