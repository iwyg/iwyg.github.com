(function (define, undefined) {
	define(['libs/es5shim'], function () {
		/**
		 * @exports application/core
		 */
		var arrayPrototype = Array.prototype,
		exports = {},
		slice = arrayPrototype.slice,
		push = arrayPrototype.push,
		newConstructor,
		Publisher, Subscriber, Observer, provideNamespace,
		core,
		/**
		 * creates an emty object with a given protytype (like Object.create)
		 * @param {Object} o Object to be extended
		 * @param {Object} obj protytype
		 * @memberof oo
		 * @function
		 * @return {Object}
		 */
		objectCreate = (function () {
			function F() {}
			return function (obj) {
				F.prototype = obj;
				return new F();
			};
		} ());

		String.prototype.camelToDash = function () {
			return this.replace(/([A-Z])/g, function ($1) {
				return "-" + $1.toLowerCase();
			});
		};

		/**
		 * Merge two Arrays
		 * @memberof lib
		 * @param {Array} a Array a
		 * @param {Array} b Array b
		 */
		function mergeArray(a, b) {
			return arrayPrototype.push.apply(a, b);
		}
		/**
		 * test if an object is a HTML element
		 * @memberof lib
		 * @param {Object} elem object to be tested
		 */
		function isHTMLElement(elem) {
			return typeof elem !== 'string' && !!elem.toString().toLowerCase().match(/^\[object.html.*?\]$/g);
		}

		/**
		 * extend an object
		 * @param {Object} o Object to be extended
		 * @param {Object} proto Object that provides methods an properties
		 * @memberof oo
		 */
		function augment(o, proto) {
			if (o) {
				Object.keys(o).forEach(function (key) {
					proto[key] = o[key];
					//delete o[key];
				});
			}
		}

		/**
		 * call a function in a given context
		 * @memberof lib
		 * @function
		 * @param {Function} fn function
		 * @param {Object} context Scope
		 */
		function proxy(fn, context) {
			return function () {
				fn.apply(context, arguments);
			};
		}
		/*
		function namespace(ns_string) {
			var atoms = ns_string.split('.'),
			i = 0,
			base = atoms.shift();
			base = !! window[base] ? window[base] : (window[base] = {});
			atoms.forEach(function (atom) {
				if (typeof base[atom] === 'undefined') {
					base[atom] = {};
				}
				base = base[atom];
			});
			return base;
		}
		*/

		/**
		 * @name lib
		 * @namespace
		 */
		exports.lib = {};
		/**
		 * @name events
		 * @namespace
		 */
		exports.events = {};
		/**
		 * @name oo
		 * @namespace
		 */
		exports.oo = {};
		/** @see proxy */
		exports.lib.proxy = proxy;
		/** @see isHTMLElement */
		exports.lib.isHTMLElement = isHTMLElement;
		/** @see mergeArray */
		exports.lib.mergeArrays = mergeArray;
		/**
		 * return a unique identifier
		 * @function
		 * @memberof lib
		 */
		exports.lib.UUID = (function () {
			function S4() {
			   return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			}

			return function () {
				return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
			};

		}());

		/** @see objectCreate */
		exports.oo.create = objectCreate;
		/** @see augment */
		exports.oo.augment = augment;
		/**
		 * class constructor function
		 * @function
		 * @memberof oo
		 * @param {Function} parent parent constructor
		 * @param {Function} constructor class constructor
		 * @param {Object} methods class prototype
		 * @return {Function} constructor
		 */
		exports.oo.newConstructor = (function () {
			var O = Object.prototype;
			/*
			function curry(parent) {
				return function () {
					parent.apply(this, arguments);
				};
			}
			*/
			function init(constr, __super) {
				return function () {
					__super.apply(this, arguments);
					constr.apply(this, arguments);
				};
			}

			return function (parent, constructor, methods) {
				var prototype = objectCreate(parent && parent.prototype || O),
				__super;
				augment(methods, prototype);
				prototype.constructor = init(constructor, __super = parent ? parent.prototype.constructor : prototype.constructor);
				prototype.__super = __super;
				constructor = prototype.constructor;
				constructor.prototype = prototype;
				return constructor;
			};
		} ());



		// example class publisher
		/**
		 * @class
		 * @name events.Publisher
		 */
		exports.events.Publisher = exports.oo.newConstructor(null,
			function (name) {
				this.subscribers = {};
				this.name = name;
			},
		/**
		 * @lends events.Publisher.prototype
		 */
		{
			/**
			 * cancel subscriptions
			 * @param {Object} subscriber the subscriber object
			 * @param {String} service event name
			 */
			cancelSubscription: (function () {
				function removeSubscription(service, subscribers, subscriber) {
					var index = subscribers[service].indexOf(subscriber);

					subscribers[service].forEach(function (subscription, index, array) {
						if (subscription.subscriber === subscriber) {
							array.splice(index, 1);
						}
					});
					/*
					if (index >= 0) {
						subscribers[service].splice(index, 1);
						if (!subscribers[service].length) {
							delete subscribers[service];
						}
					}
					*/
				}

				return function (subscriber, service) {
					var subscribers = this.subscribers,
					services = Object.keys(subscribers),
					_services = service ? service.split(' ') : services;

					_services.forEach(function (service) {
						if (services.indexOf(service) >= 0) {
							removeSubscription(service, subscribers, subscriber);
						}
					});
					return this;
				};
			} ()),
			/**
			 * fire an event an notify subscribers
			 * @param {String} service name of event
			 */
			publish: function (service) {
				var args = slice.call(arguments, 1),
				subscribers = this.subscribers;
				//subscribers[service].receive(data);
				if (subscribers[service]) {
					subscribers[service].forEach(function (fn) {
						fn.fn.apply(null, args);
					});
				}
				return this;
			},

			/**
			 * add a subscriber Object to the subscription pool
			 * this method gets called on 'Subscriper.prototype.subscribe'
			 * @param {String} service name(s) of event(s)
			 * @param {Function} fn handle function to be called when event is
			 * fired
			 * @param {Object} subscriber the subscriber object
			 */
			setSubscriptions: function (service, fn, subscriber) {
				var subscribers = this.subscribers,
				services = service.split(' ');

				services.forEach(function (service) {
					if (subscribers[service]) {
						subscribers[service].push({fn: fn, subscriber: subscriber});
					} else {
						subscribers[service] = [{fn: fn, subscriber: subscriber}];
					}
				});
				return this;
			}
		});

		/**
		 * @constructor
		 * @name events.Subscriber
		 */
		exports.events.Subscriber = exports.oo.newConstructor(null,
			/**
			 * @this instance of events.Subscriber
			 */
			function (name) {
				this.name = name;
			},
		/** @lends events.Subscriber.prototype */
		{
			/**
			 * Subscribe to a Publisher Object with one or more events
			 * separate even names with spaces: "evt evt2 evt3"
			 * @param {Object} pub Publisher Object
			 * @param {String} event the event(s) to subscribe to
			 * @param {Function} fn handle function. Pass fn as a string if you
			 * want to call a subscriber method
			 * @param {Boolean} prx defaults to true, set to false if you want
			 * a global context instead of the subscriber object
			 * @this Subscriber
			 */
			subscribe: function (pub, event, fn, prx) {
				var args = slice.call(arguments, 0),
				publisher = args.shift(),
				useProxy;
				args.push(this);
				//args.unshift(args[1]);
				if (args.length < 2 || typeof args[0] !== 'string') {
					throw new Error('no subsriptions supplied');
				}
				if (publisher && publisher.setSubscriptions) {
					if (typeof args[1] === 'string' && typeof this[args[1] === 'function']) {
						args[1] = proxy(this[args[1]], this);
					} else {
						useProxy = typeof args[2] === 'boolean' ? args[2] : true;
						args[1] = useProxy ? proxy(args[1], this) : args[1];
					}
					publisher.setSubscriptions.apply(publisher, args);
				} else {
					throw new Error('no publisher supplied or publisher method ´setSubscriptions´ not found');
				}
				return this;
			},
			/**
			 * cancel subscrption
			 * @param {Object} publisher Publisher Object
			 * @param {String} service the event(s) to unsubscribe to
			 * @this Subscriber
			 */
			unsubscribe: function (publisher, service) {
				publisher.cancelSubscription.call(publisher, this, service);
				return this;
			}
			/*,

			receive: function (data) {
				throw new Error('invalid call on abstract method');
			}
			*/
		});

		/**
		 * @constructor
		 * @name events.Observer
		 * @augments events.Publisher
		 * @augments events.Subscriber
		 */
		exports.events.Observer = exports.oo.newConstructor(exports.events.Publisher,
			/**
			 * @this instance of events.Observer
			 */
			function () {
				//exports.events.Publisher.prototype.constructor.apply(this, arguments);
			},
			exports.events.Subscriber.prototype);
		/*
		*
		* we donn't need this here since we are using requirejs
		*
		provideNamespace = newConstructor(null, function (ns_string) {
			this.base = namespace(ns_string);
		}, {
			use: function (mod_string, callback) {
				var module;
				if (typeof mod_string === 'string') {
					callback = callback;
					module = this.base[mod_string];
				} else {
					callback = mod_string;
					module = this.last || this.base;
				}
				if (typeof callback === 'function') {
					callback.call(module);
				}
				return module;
			},
			// install is chainable
			install: (function () {

				function install(base, key, module) {
					if (typeof base[key] === 'undefined') {
						base[key] = module;
					} else {
						throw new Error('Module "' + key + '" already exists');
					}
				}

				return function (name, module) {
					//module = typeof name === 'string' ? module : name;
					if (typeof name === 'object') {
						var keys, that = this;
						module = name;
						keys = Object.keys(module);
						keys.forEach(function (key) {
							install(that.base, key, module[key]);
						});
						this.last = this.base[keys.pop()];

					} else {
						install(this.base, name, module);
						this.last = this.base[name];
					}
					return this;
				};
			} ())
		});
		*/
		return exports;
	});
}(this.define));
