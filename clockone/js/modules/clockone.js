define(['libs/core', 'modules/clock'], function (core, Clock) {
	var construct = core.oo.newConstructor,
	onTimeUpdate, startTime = {};

	function getSecondsWidth(total) {
		return (total / 59) * (100 / total);
	}

	function getMinutesWidth(total) {
		return (total / 59) * (100 / total);
	}

	function getHoursWidth(total) {
		return (total / 23) * (100 / total);
	}

	function getTemplate(id) {
		var templ = '<div class="clockone hours" id="hours-' + id + '"><p></p></div>';
		templ += '<div class="clockone minutes" id="minutes-' + id + '"><p></p></div>';
		templ += '<div class="clockone seconds" id="seconds-' + id + '"><p></p></div>';
		return templ;
	}
	function leadZero(num) {
		return num < 10 ? '0' + num : num;
	}

	onTimeUpdate = {

		seconds: function (s) {
			var t = this.handles.c.clientWidth; // 100%;
			this.handles.s.style.width = Math.round((s) * getSecondsWidth(t)) + '%';
			this.handles.s.childNodes[0].innerHTML = leadZero(s);
			return this;
		},

		minutes: function (m) {
			var t = this.handles.c.clientWidth; // 100%;
			this.handles.m.style.width = Math.round((m) * getMinutesWidth(t)) + '%';
			this.handles.m.childNodes[0].innerHTML = leadZero(m);
			return this;
		},

		hours : function (h) {
			var t = this.handles.c.clientWidth; // 100%;
			this.handles.h.style.width = Math.round(h * getHoursWidth(t)) + '%';
			this.handles.h.childNodes[0].innerHTML = leadZero(h);
			return this;
		}
	};

	function handleEvents(val, type) {
		onTimeUpdate[type].call(this, val);
		return this;
	}

	function build(container) {
		var handles = this.handles = {};

		container = core.lib.isHTMLElement ? container : document.getElementById(container);

		if (!container) {
			throw Error('no HTMLElement specified od element-id no found');
		}

		container.innerHTML = getTemplate(this.id);

		handles.h = document.getElementById('hours-' + this.id);
		handles.m = document.getElementById('minutes-' + this.id);
		handles.s = document.getElementById('seconds-' + this.id);
		handles.c = container;

		return this;

	}

	return construct(Clock, function (name, container) {
		build.call(this, container);
		this.subscribe(this, 'seconds minutes hours', handleEvents);
	}, {
		foo: function () {}
	});
});
