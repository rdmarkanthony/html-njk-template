'use strict';

var bp = {
	width: 0,
	height: 0,
	isMobile: false,
	init: function() {
		bp.mobileDetect();
		// for mobile
		if (bp.isMobile) {
			document.querySelector('html').classList.add('bp-touch');
		}

		bp.loader('init');

		bp.resize();

		window.addEventListener('resize', function() {
			bp.resize();

			clearTimeout(bp.resizeTimer);
			bp.resizeTimer = setTimeout(function() {
				bp.resize();
			}, 400);
		});

		document.addEventListener('DOMContentLoaded', function() {
			bp.ready();
		});
	},
	ready: function() {
		bp.resize();
		// hide the preloader
		bp.loader('close');
	},
	loader: function(state) {
		var _loader = {
			content: '',
			init: function() {
				// '<div class="bp-preloader"><div class="spinner"><span></span><span></span></div></div>'
				_loader.content = document.createElement('div');
				_loader.content.classList.add('bp-preloader');

				var _spinner = document.createElement('div');
				_spinner.classList.add('spinner');

				for (var i = 0; i < 2; i++) {
					var _span = document.createElement('span');
					_spinner.appendChild(_span);
				}

				_loader.content.appendChild(_spinner);
				document.body.appendChild(_loader.content);
			},
			close: function() {
				document.querySelector('.bp-preloader').classList.add('fade');
				setTimeout(function() {
					document.querySelector('.bp-preloader').remove();
				}, 500);
			}
		}

		if(state == 'init') {
			_loader.init();
		} else if(state == 'close') {
			_loader.close();
		}
	},
	resizeTimer: 0,
	resize: function() {
		var _resize = {
			init: function() {
				bp.width = window.innerWidth;
				bp.height = window.innerHeight;

				// STICKY FOOTER
				var header = document.querySelector('header'),
				footer = document.querySelector('footer');

				var headerHeight = header.offsetHeight,
				footerHeight = footer.offsetHeight;

				footer.style.marginTop = -(footerHeight) + 'px';
				document.querySelector('#main-wrapper').style.paddingBottom = footerHeight + 'px';

				// for equal height
				bp.equalize(document.querySelectorAll('.fl'));
			}
		}
		_resize.init();
	},
	equalize: function(target) {
		for (var i = 0; i < target.length; i++) {
			target[i].style.minHeight = 0;
		}

		var _biggest = 0;
		for (var i = 0; i < target.length; i++ ){
			var element_height = target[i].offsetHeight;
			if(element_height > _biggest ) _biggest = element_height;
		}

		for (var i = 0; i < target.length; i++) {
			target[i].style.minHeight = _biggest + 'px';
		}
		
		return _biggest;
	},
	mobileDetect: function() {
		var isMobile = {
		    Android: function() {
		        return navigator.userAgent.match(/Android/i);
		    },
		    BlackBerry: function() {
		        return navigator.userAgent.match(/BlackBerry/i);
		    },
		    iOS: function() {
		        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		    },
		    Opera: function() {
		        return navigator.userAgent.match(/Opera Mini/i);
		    },
		    Windows: function() {
		        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
		    },
		    any: function() {
		        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		    }
		};
		if(isMobile.any) {
			bp.isMobile = isMobile.any();
		}
	}
}
bp.init();