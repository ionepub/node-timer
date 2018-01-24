/*!
 * timer.js v1.0.0
 * https://github.com/ionepub/js-timer
 *
 * Licensed MIT © ionepub
 */
'use strict';
var Timer;
(function(owner){
	/**
	 * 默认配置对象
	 * @type {Object}
	 */
	var defaultSettings = {
		time: 60,
		format: 'string', // string(09) or int(9)
		withHour: true,
		withDay: true
	};

	/**
	 * 合并配置信息
	 * @param  {object} obj  默认配置对象
	 * @param  {object} obj2 自定义配置对象
	 * @return {object}      合并的配置对象
	 */
	var _mergeObject = function(obj, obj2){
		if(typeof Object.assign === 'function'){
			// 支持ES6
			return Object.assign({}, obj, obj2);
		}else{
			// 不支持ES6
			return _mergeObjectES5(obj, obj2);
		}
	};

	/**
	 * 当浏览器不支持ES6的时候使用此方法合并配置对象
	 * @param  {object} obj  默认配置对象
	 * @param  {object} obj2 自定义配置对象
	 * @return {object}      合并的配置对象
	 */
	var _mergeObjectES5 = function(obj, obj2){
		var target = {};
		for (var tmp in obj) {
			target[tmp] = obj[tmp];
		}
		for (var tmp in obj2) {
			target[tmp] = obj2[tmp];
		}
		return target;
	};

	/**
	 * 把settings中不合法的过滤掉
	 * @param  {object} settings 传进来的参数
	 * @return {object}          过滤之后的参数
	 */
	var _parseSettings = function(settings){
		if(typeof settings !== 'object'){
			return defaultSettings;
		}
		for (var key in settings) {
			if (settings.hasOwnProperty(key) && !defaultSettings.hasOwnProperty(key)) {
				delete settings[key];
				continue;
			}
			if(key === 'time'){
				// 确保这是一个int数
				if(typeof settings[key] !== 'number' || settings[key] !== parseInt(settings[key])){
					delete settings[key];
					continue;
				}
			}
		}
		return settings;
	};

	/**
	 * 倒计时处理函数
	 * @param  {int}   time        倒计时时间
	 * @param  {object}   settings 配置对象
	 * @param  {Function} callback 回调函数
	 * @return {null}              无返回值
	 */
	var _run = function(time, settings, callback){
		var day=0, hour=0, minute=0, second=0;

		var t = setTimeout(function(){
			time--;
			if(time <= 0){
				clearTimeout(t);
				if(settings.format === 'string'){
					day = hour = minute = second = '00';
				}else{
					day = hour = minute = second = 0;
				}
				typeof callback === 'function' && callback(day, hour, minute, second, true);
			}else{
				_run(time, settings, callback);
			}
		}, 1000);

		var tmp = _calcTime(time, settings);
		day = tmp[0];
		hour = tmp[1];
		minute = tmp[2];
		second = tmp[3];

		typeof callback === 'function' && callback(day, hour, minute, second, false);

	};

	/**
	 * 根据int倒计时计算获取对应的day,hour,minute,second数
	 * @param  {int} time        倒计时时间
	 * @param  {object} settings 配置对象
	 * @return {array}           数组[day, hour, minute, second]
	 */
	var _calcTime = function(time, settings){
		var day=0, hour=0, minute=0, second=0;

		if(settings.withDay){
			day = Math.floor(time / (60 * 60 * 24));
		}
		if(settings.withHour){
			hour = Math.floor(time / (60 * 60)) - (day * 24);
		}
		minute = Math.floor(time / 60) - (day * 24 * 60) - (hour * 60);
		second = Math.floor(time) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);

		if(settings.format === 'string'){
			if (hour <= 9) (hour = '0' + hour);
			if (minute <= 9) (minute = '0' + minute);
			if (second <= 9) (second = '0' + second);
			day = day+"";
			hour = hour+"";
			minute = minute+"";
			second = second+"";
		}

		return [day, hour, minute, second];
	};

	/**
	 * 外界可访问的配置参数
	 * @type {Object}
	 */
	owner.settings = {};

	/**
	 * 初始化函数 合并默认配置和自定义配置
	 * @param  {object}   settings 配置对象
	 * @return {object}            Timer对象
	 */
	owner.init = function(settings){
		if(typeof settings === 'undefined'){
			settings = defaultSettings;
		}else{
			// 把settings中不合法的过滤掉
			settings = _parseSettings(settings);
		}
		if(typeof settings === 'object'){
			// 合并settings和defaultSettings到owner.settings
			owner.settings = _mergeObject(defaultSettings, settings); // 必须defaultSettings在前
		}
		return owner;
	};

	/**
	 * 倒计时主函数
	 * @param  {object}   settings 配置对象
	 * @param  {Function} callback 回调函数
	 * @return {object}            Timer对象
	 */
	owner.run = function(settings, callback){
		if(typeof settings === 'function'){
			// 仅传递了一个回调函数参数
			callback = settings;
			settings = '';
		}

		// 如果是跳过init直接run的 或 新设置配置的
		if(typeof owner.settings.time === 'undefined' || typeof settings === 'object'){
			owner.init(settings);
		}

		_run(owner.settings.time, owner.settings, callback);

		return owner;
	};

	/**
	 * 将两个时间戳减法结果作为time参数
	 * @param  {int} startTime  开始时间，秒
	 * @param  {int} endTime    结束时间，秒
	 * @return {object}         Timer对象
	 */
	owner.diff = function(startTime, endTime){
		if(typeof startTime === 'number' && startTime === parseInt(startTime) && typeof endTime === 'number' && endTime === parseInt(endTime) && startTime < endTime){
			owner.settings.time = endTime - startTime;
		}
		return owner;
	};
})(Timer = {});

module.exports = Timer;
