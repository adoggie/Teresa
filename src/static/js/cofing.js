'use strict';
/*
	获取本机时间
*/
var dateTime = {
	date:new Date(),
	weeks:new Array("星期一","星期二","星期三","星期四","星期五","星期六","星期日"),
	year:function(time){
		return time.getFullYear()
	},
	month:function(time){
		var str = '';
		if(time.getMonth() + 1 < 10){
			str = '0' +  (time.getMonth() + 1);
		}else{
			str = time.getMonth() + 1
		}
		return str;
	},
	day:function(time){
		var str = '';
		if(time.getDate() < 10){
			str = '0' +  time.getDate()
		}else{
			str = time.getDate()
		}
		return str;
	},
	hour:function(time){
		var str = '';
		if(time.getHours() < 10){
			str = '0' +  time.getHours()
		}else{
			str = time.getHours()
		}
		return str;
	},
	minute:function(time){
		var str = '';
		if(time.getMinutes() < 10){
			str = '0' +  time.getMinutes()
		}else{
			str = time.getMinutes()
		}
		return str
	},
	second:function(time){
		var str = '';
		if(time.getSeconds() < 10){
			str = '0' +  time.getSeconds()
		}else{
			str = time.getSeconds()
		}
		return str
	},
	render:function(time){
		var year = this.year(time);
		var month = this.month(time);
		var day = this.day(time);
		var week = this.weeks[time.getDay()-1];
		return year + '年' + month + '月' + day + '日 ' + week;
	}
};
setInterval(clock,1000);
function clock(){
	var time = new Date();
	$('.new-date').html(dateTime.render(time));
	$('.date-hour i').html(dateTime.hour(time));
	$('.date-minute i').html(dateTime.minute(time));
	$('.date-second i').html(dateTime.second(time));
}