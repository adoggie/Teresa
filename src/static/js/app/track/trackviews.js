/*
* @file 轨迹查询搜索视图
* @time 20170316
*/
'use strict';
var TrackViews = {
	pointerTab:'pointerTabLeft',
	pointerTabIndex: 0,
	/**
     * DOM操作回调，切换标签页
     *
     * @param {object} event 事件对象 
     */
    handleToggle: function(el) {
        if (el.target.className === 'trackTab') {
            this.pointerTab = 'pointerTabRight';
            this.pointerTabIndex = 1;
            el.target.parentElement.children[2].className = this.pointerTab;
            mapControl.removeTrafficControl();
            mapControl.showSpeedControl();
            $('.monitor').addClass('hidden').removeClass('visible');
            $('.track').addClass('visible').removeClass('hidden');
            $('.timeline').addClass('visible').removeClass('hidden');
            $('.trackAnalysis').addClass('visible').removeClass('hidden');
        } else {
            this.pointerTab = 'pointerTabLeft';
            this.pointerTabIndex = 0;
            el.target.parentElement.children[2].className = this.pointerTab;
            mapControl.showTrafficControl();
            mapControl.removeSpeedControl();
            $('.track').addClass('hidden').removeClass('visible');
            $('.monitor').addClass('visible').removeClass('hidden');
            $('.timeline').addClass('hidden').removeClass('visible');
            $('.trackAnalysis').addClass('hidden').removeClass('visible');
        }
    },
}