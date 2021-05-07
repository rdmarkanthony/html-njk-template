'use strict';

const bp = {
	init: function() {
		// for mobile
		if(bp.isMobile()) {
			$('html').addClass('bp-touch');
		}

		// for preloader
		bp.preloader('start');

		// for general resize
		bp.resizeFn(function() {
			bp.resize();
		});

		// for ready
		$(document).ready(function() {
			bp.ready();
		});
	},
	ready: function() {
		bp.resize();

		// hide the preloader
		bp.preloader('end');
	},
	preloader: function(state) {
		// init preloader
		if(state == 'start') {
			// remove the preloader by url param
			if(bp.getUrlVars().preloader == 'true') {
				$('.bp-preloader').remove();
			}
		}

		// hide the preloader
		if(state == 'end') {
			$('.bp-preloader').addClass('fade');

			setTimeout(function() {
				$('.bp-preloader').remove();
			}, 500);
		}
	},
	width: function() {
		return window.innerWidth;
	},
	height: function() {
		return window.innerHeight;
	},
	header: {
		target: document.querySelector('header'),
		height: function() {
			return bp.header.target.offsetHeight;
		}
	},
	footer: {
		target: document.querySelector('footer'),
		height: function() {
			return bp.footer.target.offsetHeight;
		}
	},
	resize: function() {
		// sticky footer
		$(bp.footer.target).css({marginTop: -(bp.footer.height())});
		$('#main-wrapper').css({paddingBottom: bp.footer.height()});

		// for equal height
		$('.group-height').each(function() {
			bp.equalize(this.querySelectorAll('.gh1'));
			bp.equalize(this.querySelectorAll('.gh2'));
			bp.equalize(this.querySelectorAll('.gh3'));
		});
	},
	equalize: function(target) {
		for (let i = 0; i < target.length; i++) {
			target[i].style.minHeight = 0;
		}

		let _biggest = 0;
		for (let i = 0; i < target.length; i++ ){
			let element_height = target[i].offsetHeight;
			if(element_height > _biggest ) _biggest = element_height;
		}

		for (let i = 0; i < target.length; i++) {
			target[i].style.minHeight = _biggest + 'px';
		}
		
		return _biggest;
	},
	resizeFn: function(fnctn) {
		let _resizeTimer = '';

		fnctn('init');
		window.addEventListener('resize', function() {
			fnctn('resize');

			clearTimeout(_resizeTimer);
			_resizeTimer = setTimeout(function() {
				fnctn('after');
			}, 300);
		});

		$(document).ready(function() {
			fnctn('ready');
		});
	},
	isMobile: function() {
		const isMobile = {
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
			return isMobile.any();
		}
	},
	getUrlVars: function() {
		let vars = {};
		const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	},
	setUrlVars: function(key, value) {
		let url = window.location.href;
		const hash = location.hash;
			url = url.replace(hash, '');
			if (url.indexOf(key + "=") >= 0) {
				const old = ocbc.getUrlVars()[key];
				url = url.replace(key+"="+old, key+"="+value);
			} else {
				if (url.indexOf("?") < 0)
					url += "?" + key + "=" + value;
				else
					url += "&" + key + "=" + value;
			}
			window.history.pushState({ path: url + hash }, '', url + hash );
	}
}
bp.init();