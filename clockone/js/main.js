require(['modules/clockone'], function (Clock) {
	var clockcontainer = document.getElementById('clockone');
	var timeSeconds = document.createElement('span');
	var timeMinutes = document.createElement('span');
	var timeHours = document.createElement('span');
	var timecontainer = document.getElementById('time');
	var clock = new Clock('foo', clockcontainer);
	var footer;
	var webappCache = window.applicationCache;

	if (webappCache) {
		function updateCache () {
			webappCache.swapCache();
		}
		webappCache.addEventListener("updateready", updateCache, false);
	}

	footer = document.getElementById('footer');
	footer.style.display = 'none';

	timecontainer.appendChild(timeHours);
	timecontainer.appendChild(timeMinutes);
	timecontainer.appendChild(timeSeconds);


	clock.subscribe(clock, 'seconds minutes hours', function (val, type) {
		switch (type) {
		case 'seconds':
			timeSeconds.innerHTML = val < 10 ? '0' + val : val;
			break;
		case 'minutes':
			timeMinutes.innerHTML = val < 10 ? '0' + val : val;
			timeMinutes.innerHTML += '/';
			break;
		case 'hours':
			timeHours.innerHTML = val < 10 ? '0' + val : val;
			timeHours.innerHTML += '/';
			break;
		default:
			break;
		}
	});
	if (!navigator.standalone) {
		footer.style.display = '';
	}
});
