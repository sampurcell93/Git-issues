/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-unlocked' : '&#xe000;',
			'icon-locked' : '&#xe001;',
			'icon-github' : '&#xe002;',
			'icon-arrow-right' : '&#xe003;',
			'icon-arrow-left' : '&#xe004;',
			'icon-previous' : '&#xe005;',
			'icon-next' : '&#xe006;',
			'icon-arrow-right-2' : '&#xe007;',
			'icon-arrow-left-2' : '&#xe008;',
			'icon-arrow-right-3' : '&#xe009;',
			'icon-arrow-left-3' : '&#xe00b;',
			'icon-eye' : '&#xe00a;',
			'icon-search' : '&#xe014;',
			'icon-ccw' : '&#xe00c;',
			'icon-zoom-in' : '&#xe00d;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};