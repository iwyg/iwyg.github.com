define(['libs/core'], function (core) {
	var construct = core.oo.newConstructor,
	Observer = core.events.Observer,
	oldMin = {}, oldHours = {};


	function setSeconds(seconds, callback) {
		++seconds;

		if (seconds > 59) {
			seconds = 0;
		}

		if (callback) {
			callback.call(this, seconds);
		}
		return seconds;
	}

	function runInterval() {
		var that = this, time,
		id = this.id;

		this.interval = window.setInterval(function () {
			time = that.getTime();
			that.publish('seconds', time.seconds, 'seconds');

			if (time.seconds === 0 || oldMin[id] !== time.minutes) {
				that.publish('minutes', time.minutes, 'minutes');
				oldMin[id] = time.minutes;
			}

			if (time.minutes === 0 || oldHours[id] !== time.hours) {
				that.publish('hours', time.hours, 'hours');
				oldHours[id] = time.hours;
			}

		}, 1000);
	}

	return construct(Observer, function () {
		this.id = core.lib.UUID();
		runInterval.call(this);
	}, {
		setTime: function () {
			var time = this.getTime();
			window.clearInterval(this.interval);
		},

		getTime: function () {
			var currentTime = new Date();
			return {
				seconds: currentTime.getSeconds(),
				minutes: currentTime.getMinutes(),
				hours: currentTime.getHours()
			};
		},

	});
});
