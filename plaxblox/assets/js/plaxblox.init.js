$(function () {
	var plax = $('.block').plaxblox({container: document}),
	scrollTop = $(document).scrollTop(),
	doc = $(document),
	body = $('body');

	plax.animate('.layer-1.pos1', {prop: 'top', start: 1200, end: -200});
	plax.animate('.layer-2.pos1', {prop: 'top', start: 800, end: -200});
	plax.animate('.layer-3.pos1', {prop: 'top', start: 400, end: 200});

	plax.animate('.layer-1.pos2', {prop: 'top', start: 1400, end: 400});
	plax.animate('.layer-2.pos2', {prop: 'top', start: 1200, end: 400});
	plax.animate('.layer-3.pos2', {prop: 'top', start: 800, end: 400});

	plax.animate('.layer-1.pos3', {prop: 'top', start: 2400, end: 0});
	plax.animate('.layer-2.pos3', {prop: 'top', start: 2200, end: 0});
	plax.animate('.layer-3.pos3', {prop: 'top', start: 1800, end: 0});
});
