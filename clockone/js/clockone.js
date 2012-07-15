(function (global) {

	if (!Object.prototype.create) {
		Object.prototype.create = function (o) {
			var F = function () {};
			F.prototype = o;
			return new F();
		};
	}

	if (!global.addEvent || ! global.removeEvent) {
		var addEvent = (function () {
			if (global.addEventListener) {
				return function (elem, type, handler, capture) {
					return elem.addEventListener(type, handler, capture);
				}
			} else {
				return function (elem, type, handler) {
					return elem.attachEvent('on' + type, function (event) {
						handler.call(elem, event);
					});
				}
			}
		} ()),
		removeEvent = (function () {
			if (global.removeEventListener) {
				return function (elem, type, handler) {
					return elem.removeEventListener('on' + type, handler);
				};
			} else {
				return function (elem, type, handler) {
					return elem.detachEvent('on' + type, handler);
				};
			}
		} ());

		global.addEvent = addEvent;
		global.removeEvent = removeEvent;
	}

	if (!global.triggerEvent) {

		var triggerEvent = (function () {
			if (global.dispatchEvent) {
				return function (elem, event) {
					elem.dispatchEvent(event);
				};
			} else {
				return function (elem, event) {
					if (event.type.charAt(0) + event.type.charAt(1) !== 'on') {
						event.type = 'on' + event.type;
					}
					//console.log(event.type);
					elem.fireEvent(event.type, event);
				};
			}
		} ());
		global.triggerEvent = triggerEvent;
	}

	var timeupdate = (function () {
		var ev;
		if (global.document.createEvent) {
			ev = global.document.createEvent('HTMLEvents');
			ev.initEvent('propertychange', true, false);
		} else {
			ev = global.document.createEventObject('onpropertychange');
			ev.type = 'onpropertychange';
		}
		return ev;
	} ());

	// superclass
	var Clock = function () {
		function setSeconds(seconds, callback) {
			if (this === global) {
				throw new Error('privat function setSeconds was called with wrong context');
			}++seconds;

			if (seconds > 59) {
				seconds = 0;
			}
			if (callback) {
				callback.call(this, seconds);
			}
			return seconds;
		}

		var that = Object.create({
			init: function (name) {
				this.name = name;
			},
			getTime: function () {
				var currentTime = new Date();
				return {
					seconds: currentTime.getSeconds(),
					minutes: currentTime.getMinutes(),
					hours: currentTime.getHours()
				};
			},
			runInterval: function (seconds, callback) {
				var that = this;
				this.interval = global.setInterval(function () {
					seconds = setSeconds.apply(that, [seconds, callback]);
				},
				1000);
			}
		});
		return function () {
			return that;
		};
	} ();
	// subclass
	var ClockOne = (function () {
		function getSecondsWidth(total) {
			return (total / 59) * (100 / total);
		}
		function getMinutesWidth(total) {
			return (total / 59) * (100 / total);
		}

		function getHoursWidth(total) {
			return (total / 23) * (100 / total);
		}

		function createView(parent) {
			if (typeof parent === 'string' && parent.charAt(0) === '#') {
				parent = document.getElementById(parent.split('#')[1]);
			} else if (typeof parent === 'object') {
				parent = parent;
			} else {
				throw new Error('createView expects argument to be a ID string or a DOM element but saw ' + parent);
			}
			this.clockContainer = global.document.createElement('div');
			this.clockContainer.className = this.name + '-Container';
			this.secondsHandle = global.document.createElement('div');
			this.secondsHandle.className = this.name + '-Seconds';
			this.minutesHandle = global.document.createElement('div');
			this.minutesHandle.className = this.name + '-Minutes';
			this.hoursHandle = global.document.createElement('div');
			this.hoursHandle.className = this.name + '-Hours';

			this.clockContainer.appendChild(this.hoursHandle);
			this.clockContainer.appendChild(this.minutesHandle);
			this.clockContainer.appendChild(this.secondsHandle);

			parent.appendChild(this.clockContainer);
			return this;
		}
		function updateSeconds(sec) {
			var total = this.clockContainer.clientWidth;
			this.secondsHandle.setAttribute('data-time', sec);
			this.secondsHandle.style.width = (sec * getSecondsWidth(total)) + '%';
			triggerEvent(this.secondsHandle, timeupdate);
			if (sec === 0) {
				this.setTime();
			}
		}

		var that = Clock();
		that.name = 'ClockOne';
		that.setTime = function () {
			var time = this.getTime(),
			total = this.clockContainer.clientWidth;
			global.clearInterval(this.interval);
			this.runInterval(time.seconds, updateSeconds);
			if (this.secondsHandle.getAttribute('data-time') !== time.seconds) {
				this.secondsHandle.setAttribute('data-time', time.seconds);
				this.secondsHandle.style.width = Math.round(time.seconds * getSecondsWidth(total)) + '%';
			}
			if (this.minutesHandle.getAttribute('data-time') !== time.minutes) {
				this.minutesHandle.setAttribute('data-time', time.minutes);
				this.minutesHandle.style.width = Math.round(time.minutes * getMinutesWidth(total)) + '%';
				triggerEvent(this.minutesHandle, timeupdate);
			}
			if (this.hoursHandle.getAttribute('data-time') !== time.hours) {
				this.hoursHandle.setAttribute('data-time', time.hours);
				this.hoursHandle.style.width = Math.round(time.hours * getHoursWidth(total)) + '%';
				triggerEvent(this.hoursHandle, timeupdate);
			}
		};

		return function (element) {
			var _this = Object.create(that);
			createView.call(_this, element);

			_this.setTime();
			_this.runInterval(that.getTime().seconds, updateSeconds);

			return _this;
		};
	} ());
	var TA = global.TA || {};
	TA.ClockOne = ClockOne;
	if (!global.TA) {
		global.TA = TA;
	}

} (this));

