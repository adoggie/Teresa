'use strict';

$(".all-cars .car-table").freezeHeader({ 'height': '180px','offset' : '0px'});
$(".seach-cars .car-table").freezeHeader({ 'height': '180px','offset' : '0px'});
/*
	导航栏下拉
*/
var horizontalMenu = {
	over:function(elm){
		elm.children('ul').addClass('hover');
	},
	out:function(elm){
		elm.children('ul').removeClass('hover');
	}
};
$('.hover-line').on('mouseover',function(ev){
	ev.preventDefault();
	var that = $(this);
	horizontalMenu.over(that);
}).on('mouseout',function(ev){
	ev.preventDefault();
	var that = $(this);
	horizontalMenu.out(that);
});

/* 
   输入框显示
*/
function delfocus(){
    if(document.getElementById("pl").value == ""){
    	document.getElementById("quickdemlete").style.visibility="hidden";
    }
}
function delva(){
	  if(document.getElementById("pl").value != ""){
    	document.getElementById("quickdemlete").style.visibility="visible";
    }
}
$('#quickdemlete').click(function(){
    document.getElementById("pl").value="";
    
});
/*
	刷新数据120s
*/
var countDown = 120;
setInterval(labourRefresh,1000);
function labourRefresh(){
	if(countDown>0){
		countDown--;
		$('.refresh i').html(countDown);
	}else{
		countDown = 120;
		rhinoSearch.initRhino();
		// map.setZoom(map.getZoom());
	}
}
$('.labour-refresh').on('click',function(){
	countDown = 120;
	$('.select-type option:eq(0)').prop("selected",true);;
	$('.search-key').val('');
    var num = $('.all-cars .car-data-list li.active').data('num');
	rhinoSearch.initRhino();
    rhinoSearch.addCartable(num);
    if($('.seach-cars .map-bottom-nor').is(':visible')){
        regSelect.findCars(num);
	}
})
/*
	查询列表的类型
	0:车辆
	1:转运中心
*/
$('.search-key').focus(function(){
	regSelect.closeWindow()
	if($('.select-type').val() == 0){
		rhinoSearch.carNames();
	}else{
		teresaSearch.transitCenter();
	}
})
$('.select-type').on('change',function(){
	// $('.transitCenter').removeClass('hasselect');
	$('.search-key').val('');
	regSelect.closeWindow();
	if($(this).val() == 0){
		$('.search-key').attr('placeholder','请输入车牌号');
		if($('.transit-center-tab').is(':visible')){
			$('.transit-center-tab').addClass('hidden');
		}
	}else{
		$('.search-key').attr('placeholder','请输入转运中心名称');
	}
});
$('.search').on('click',function(){
	if(regSelect.select_type !== 0){
    	regSelect.closeDrawingManager();
    }
	regSelect.closeWindow();
    // $('.region-select').prop('checked',false);
	var selectType = $('.select-type').val();
	var searchKey = $('.search-key').val();
	if(selectType == 0 && searchKey !== ''){
		rhinoSearch.vehicles($('.search-key').val());
	}else if(selectType == 1 && searchKey !== ''){
		teresaSearch.addTransitCenter($('.search-key').val());// && $('.transitCenter').hasClass('hasselect')
	}
});
/*
	table
*/
$('.car-list-button').on('click',function(){
    allCarTable($(this));
});
$('.all-cars .car-data-list li').on('click',function(){
	$(this).addClass('active').siblings('li').removeClass('active');
    if(!$('.car-list-button').hasClass('active')){
        $('.car-list-button').addClass('active');
        $('.car-list-button').removeClass('fa-chevron-up').addClass('fa-chevron-down');
        $('.map-bottom .all-cars').css({
            height:'220px'
        }).slideDown('slow');
        $('.all-cars .map-bottom-nor').removeClass('hidden');//.show();
	}
	rhinoSearch.addCartable($(this).data('num'));
});
//画框选车
$('.region-select').on('click',function(){
    if($('.car-list-button').hasClass('active')){
        $('.car-list-button').removeClass('active');
        $('.car-list-button').removeClass('fa-chevron-down').addClass('fa-chevron-up');
        $('.map-bottom .all-cars').css({
            height:'40px'
        });
        $('.all-cars .map-bottom-nor').addClass('hidden');//.hide();
    }
    $('.map-bottom .seach-cars').css({
        height:'0',
        zIndex:'200'
    });
    $('.seach-cars .map-bottom-nor').addClass('hidden');//.hide();
    regSelect.addSelectCar();
    if(regSelect.select_type == 0){
    	regSelect.clickSelect(1);
    }else{
    	regSelect.closeDrawingManager();
    }
});
//画框选车，转运中心列表显示
$('.seach-cars .car-data-list li').on('click',function(){
	$(this).addClass('active').siblings('li').removeClass('active')
	regSelect.findCars($(this).data('num'));
});
//是否展示车辆列表
function allCarTable(em){
    if(em.hasClass('active')){
        em.removeClass('active');
        em.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        $('.map-bottom .all-cars').css({
            height:'40px'
        });
        $('.all-cars .map-bottom-nor').addClass('hidden');//.hide();
    }else{
        em.addClass('active');
        em.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        $('.map-bottom .all-cars').css({
            height:'220px'
        }).slideDown('slow');
        $('.all-cars .map-bottom-nor').removeClass('hidden');//.show();
    }
}