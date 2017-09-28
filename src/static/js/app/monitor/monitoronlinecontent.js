/*
* @file 车辆实时监控
* @time 20170317
*/
'use strict';
var MonitorOnLineContent = {
	handleSelectCar: function(event) {
        var realTarget = event.target;
        if (event.target.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement;
        }
        if (event.target.parentElement.parentElement.className.indexOf('monitorListItem') > -1) {
            realTarget = event.target.parentElement.parentElement;
        }
        var entity_name = realTarget.getAttribute('data-entity_name');
        var entity_status = realTarget.getAttribute('data-entity_status');
        this.currentEntityName = entity_name;
        // TrackAction.selectcar(entity_name, entity_status, 'onlineCompleteEntities');
        // var that = this;
        // if(that.data.selectCar.entity_name === undefined && entity_name === undefined) {
        //     return;
        // }
        // entity_name = entity_name || that.data.selectCar.entity_name;
        // entity_status = entity_status || that.data.selectCar.entity_status;
        // entity_type = entity_type || that.data.selectCar.entity_type;
        // that.data.selectCompleteEntities = [];
        var params = {
            'query': entity_name,
            'page_index': 1,
        };

        urls.jsonp(Urls.searchEntity, params, function(data) {
            if (data.status === 0) {
                data.entities.map(function(item) {
                    if (item.entity_name === entity_name) {
                        var point = data.entities[0].latest_location;
                        var paramsGeo = {
                            location: point.latitude + ',' + point.longitude,
                            output: 'json'
                        };
                        Urls.jsonp(Urls.getAddress, paramsGeo, function(dataGeo) {
                            var temp = [];
                            that.data.column_key.map(function(keyitem, index) {
                                if (keyitem === '_provider') {
                                    
                                } else {
                                    temp[index] = [that.data.column[index] + ':', item[keyitem] !== undefined ? item[keyitem] : '无'];
                                }
                            });
                            temp = temp.filter(function(item) {
                                return item;
                            });
                            var lnglat = item.latest_location.longitude.toFixed(2) + ',' + item.latest_location.latitude.toFixed(2);
                            that.data.selectCompleteEntities.push({
                                point: [item.latest_location.longitude, item.latest_location.latitude],
                                entity_name: item.entity_name,
                                direction:item.latest_location.direction,
                                infor: [
                                    ['状态:', Commonfun.getInfoWindowStatus(item.latest_location.speed, item.latest_location.loc_time, item.latest_location.direction)],
                                    ['地址:', dataGeo.result.formatted_address === '' ? '无' : dataGeo.result.formatted_address],
                                    ['定位:', lnglat],
                                    ['时间:', Commonfun.getLocalTime(item.latest_location.loc_time)]
                                ].concat(temp)
                            });
                            that.data.selectCompleteEntities[0].entity_status = entity_status;
                            that.data.selectCompleteEntities[0].entity_type = entity_type;
                            that.data.selectCar = that.data.selectCompleteEntities[0];
                            that.trigger('selectcardata',that.data.selectCompleteEntities[0]);
                        });
                    }  
                });
               
            } else {
                
            }
        }.bind(this));
    }
}