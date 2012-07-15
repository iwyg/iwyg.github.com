define(function () {
	var evtHandlerCache = {},
	domready = false,
	DOMContentLoaded,
	exports;

	if (document.addEventListener) {
		DOMContentLoaded = function () {
			document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
			exports.ready();
		};
	}

	else if (document.attachEvent) {
		DOMContentLoaded = function () {
			if (document.readyState === 'complete');
			document.detachEvent('onreadystatechange', DOMContentLoaded);
			exports.ready();
		};
	}

	function eventNormalize(event) {

	}

	exports = {
		ready: function () {

		},
		domready: function (callback) {
			if (domready) {
				callback();
			}
			if (document.readyState === 'complete') {
				return setTimeout(exports.ready, 1);
			}


			if (document.addEventListener) {
				document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
			}

			if (document.attachEvent) {
				document.attachEvent('onreadystatechange', DOMContentLoaded, false);

			}
		}(),
		on: (function () {
			if (window.addEventListener) {
				return function (elem, type, handler) {

					elem.addEventListener(type, handler, false);
				};
			}
		   if (window.attachEvent) {
				return function (elem, type, handler) {
					elem.attachEvent(elem, 'on' + type, handler);
				}
		   }
		}()),
		off: (function () {
			if (window.removeEventListener) {
				return function (elem, type, handler) {
					elem.removeEventListener(type, handler);
				};
			}
		   if (window.detachEvent) {
				return function (elem, type, handler) {
					elem.detachEvent(elem, 'on' + type, handler);
				}
		   }

		}())
	};


});
