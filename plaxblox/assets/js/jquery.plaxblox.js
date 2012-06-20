(function (plugin, define, window) {
	if (typeof define === 'function' && define.amd)	{
		define(['jquery'], plugin);
	} else {
		plugin(window.jQuery);
	}
}(function ($) {
		if (typeof $.fn.bullseye !== 'function') {
			console.log('bullseye not found');
		}
		var defaults = {
			context: document,
			direction: 'vertical' // 'horizontal'
		},
		ROUND = Math.round,
		ABS = Math.abs,
		MAX = Math.max,
		MIN = Math.min,
		PROP_TOP = 'top',
		PROP_BOTTOM = 'bottom',
		PROP_RIGHT = 'right',
		PROP_LEFT = 'left',
		DIR_WITH = 'with',
		DIR_AGAINST = 'against',
		SCROLL_TOP = 'scrollTop',
		SCROLL_LEFT = 'scrollLeft',
		OFFSET_REL = 'relative',
		OFFSET_ABS = 'absolute',

		PaxBlox = (function () {
			function _doAnimate() {
				var animations = [], anim;
				while (this.animations.length) {
					anim = this.animations.pop();
					animations.push(anim);
					anim();
				}
				this.animations = animations;
			}

			function _cssProp(options) {
				var acceleration = !options.acceleration ?
					(ABS(options.end - options.start) / options.block.outerHeight()) :
					options.acceleration,
				offset = options.offset === OFFSET_ABS ? 0 : options.block.offset()[this.offset],
				_val = this.context[this.direction]() - offset,
				val = options.direction === DIR_WITH ?
					ROUND((options.end - _val * acceleration)) :
					ROUND((options.end + _val * acceleration)),

				prop = !isNaN(options.max) && !isNaN(options.min) ?
					MAX(options.min, MIN(options.max, val)) :
					!isNaN(options.max) ? MIN(options.max, val) :
					!isNaN(options.min) ? MAX(options.min, val) : val;

				return prop;
			}


			function _animation(selector, options) {
				var css = {}, that = this;
				//console.log(selector.length);
				//if (selector.length > 1) {
				//	selector.each(function () {
				//		_animation.call(that, $(this), options);
				//	});
				//	return;
				//}
				if (this.inViewPort.has(selector).length) {
					css[options.prop] = $.isFunction(options.process) ? options.process(options) : _cssProp.call(this, options);
					selector.css(css);
				}
				css = null;
			}

			//function _registerUserCallback(selector, fn) {

			//}

			//function _getThreshold() {

			//}

			function _setPorperties(element, options, blocks) {
				options = options || {};
				options.block = element.parents().filter(blocks);
				options.prop = options.prop || PROP_TOP;
				options.direction = options.direction || DIR_WITH; // opposit: `against`.
				options.acceleration = options.acceleration || 0; // opposit: `against`.
				options.start = options.start || (parseInt(element.css(options.prop), 10) || 0);
				options.end = options.end || (parseInt(element.css(options.prop), 10) || 0);
				return options;
			}

			function PB(settings, block, blocks) {
				this.block = block;
				this.blocks = blocks;
				this.settings = settings;
				this.context = $(settings.context);
				this.animations = [];
				this.inViewPort = $([]);
				this.direction = this.settings.direction === 'vertical' ? SCROLL_TOP : SCROLL_LEFT;
				this.offset = this.settings.direction === 'vertical' ? PROP_TOP : PROP_LEFT;
			}

			PB.prototype = {
				animate: function (selector, options) {
					var that = this;
					selector = selector instanceof $ ? selector : $(selector);
					if (selector.length > 1) {
						selector.each(function () {
							var el = $(this);
							that.animations.push($.proxy(_animation, that, el, _setPorperties(el, $.extend({}, options), that.blocks)));
						});
					} else {
						this.animations.push($.proxy(_animation, this, selector, _setPorperties(selector, options, this.blocks)));
					}
					this.ca = this.animations.length;
					return this;
				},
				_doAnimate: function () {
					var animations = [], anim;
					while (this.animations.length) {
						anim = this.animations.pop();
						animations.push(anim);
						anim();
					}
					this.animations = animations;
				}
			};
			PB.name = 'PaxBlox';
			return PB;
		}());


		$.fn.plaxblox = function (options) {
			var settings = $.extend({}, defaults, options),
			pb = new PaxBlox(settings, this.length <= 0 ? this : $(this.get(0)), this);
			var i = 0;

			this
				.on('enterviewport', function () {
					pb.inViewPort.push(this);
				})
				.on('leaveviewport', function () {
					var arr = pb.inViewPort.get(),
					index = $.inArray(this, arr);
					pb.inViewPort = pb.inViewPort.not(this);
				})
				.bullseye();

			pb.context.scroll($.proxy(pb._doAnimate, pb));
			return pb;
		};
	}, this.define, this

));
