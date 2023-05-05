'use strict';

const projName = {
	preloader: false,
	init: function() {
		// if mobile
		if(projName.isMobile()) $('html').addClass('is-mobile');

		// for debugging
		projName.debug.init();

		// for header
		projName.header.init();

		// for footer
		projName.footer.init();

		// for animate
		projName.inview.init();

		// for general resize
		projName.event.resize(function() {
			projName.resize();
		});

		// for ready
		$(document).ready(function() {
			projName.ready();
		});
	},
	ready: function() {
		// show animate
		projName.inview.run();

		// for auto-scroll
		projName.scroll.init();

		console.log( projName );
	},
	isMobile: function() {
		return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	},
	debug: {
		active: false,
		init: function() {
			if(projName.url.getVars().debug == 'true') projName.debug.active = true;
		}
	},
	url: {
		getVars: function() {
			let vars = {};
			const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
				vars[key] = value;
			});
			return vars;
		},
		setVars: function(key, value) {
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
		},
		getHash: function() {
			if(window.location.hash) {
				return ((window.location.hash).split('?'))[0];
			} else {
				return false;
			}
		}
	},
	event: {
		resize: function(callback) {
			let _resizeTimer = '';

			callback('init');

			window.addEventListener('load', function(e) {
				callback('ready', e);
			});

			window.addEventListener('resize', function(e) {
				callback('resize', e);

				clearTimeout(_resizeTimer);
				_resizeTimer = setTimeout(function() {
					callback('after', e);
				}, 300);
			});
		},
		scroll: function(callback) {
			callback();
			window.addEventListener('scroll', function(e) {
				callback(e);
			});
		},
		dispatch: function(elem, eventName) {
			let event;
			if (typeof(Event) === 'function') {
				event = new Event(eventName);
			}
			else {
				event = document.createEvent('Event');
				event.initEvent(eventName, true, true);
			}
			elem.dispatchEvent(event);
		},
	},
	scroll: {
		auto: function(target, offset, speed, fnctn) {
			// if need to change the target
			let _diffTarget = target.getAttribute('scroll-diff');
			if(_diffTarget) {
				_diffTarget = document.querySelector('.' + _diffTarget);
	
				if(_diffTarget) target = _diffTarget;
			}
	
			let _offset = 0;
			let _gap = 0;
			if(projName.width() <= 768) _gap = 0;
			// if going to scroll up, get header height as offset
			if($(target).offset().top <= projName.st()) {
				_offset = projName.header.height() + _gap;
			} else {
				if(projName.width() > 991) {
					_offset = _gap;
				} else {
					_offset = projName.header.height() + _gap;
				}
			}
			if(parseInt(offset)) _offset = offset;
	
			let _speed = 700;
			if(parseInt(speed)) _speed = speed;
			
			if(_offset <= 0 && target.dataset.headerNav) _offset = 68;
	
			$('html').stop().animate({scrollTop: $(target).offset().top -(_offset) }, _speed, false, function() {
				if(fnctn) fnctn();
			});
		},
		init: function() {
			// for auto scroll
			$('.auto-scroll').each(function() {
				$(this).click(function(e) {
					const _target = document.querySelector(this.getAttribute('href'));

					if(_target) {
						e.preventDefault();

						projName.scroll.auto(_target);
					}
				});
			});
			if(window.location.hash) {	
				const _target = document.querySelector(projName.url.getHash());

				if(_target) {
					// for auto scroll
					setTimeout(function() {
						const _targetOffset = projName.st() - $(_target).offset().top;

						// if(!(_targetOffset <= window.innerHeight * 0.2 && _targetOffset >= 0))
						projName.scroll.auto(_target, projName.header.target.offsetHeight);
					}, 500);

					// for auto popup
					const _popupBtn = document.querySelector('a[href="'+ _hash +'"]');

					if(_popupBtn) {
						setTimeout(function() {
							_popupBtn.click();
						}, 300);
					}
				}
			}
		}
	},
	width: function() {
		return window.innerWidth - (window.innerWidth - document.documentElement.clientWidth);
	},
	height: function() {
		return window.innerHeight - (window.innerHeight - document.documentElement.clientHeight);
	},
	header: {
		target: document.querySelector('.header-content'),
		height: function() {
			return projName.header.target.offsetHeight;
		},
		init: function() {
			
		}
	},
	footer: {
		target: document.querySelector('.footer-content'),
		height: function() {
			return projName.footer.target.offsetHeight;
		},
		init: function() {

		}
	},
	resize: function() {
		// sticky footer
		$(projName.footer.target).css({marginTop: -(projName.footer.height())});
		$('#main-wrapper').css({paddingBottom: projName.footer.height()});

		// for equal height
		$('.group-height').each(function() {
			projName.equalize(this.querySelectorAll('.gh1'));
			projName.equalize(this.querySelectorAll('.gh2'));
			projName.equalize(this.querySelectorAll('.gh3'));
			projName.equalize(this.querySelectorAll('.gh4'));
			projName.equalize(this.querySelectorAll('.gh5'));
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
	inview: {
		init: function() {
			!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){function i(){var b,c,d={height:f.innerHeight,width:f.innerWidth};return d.height||(b=e.compatMode,(b||!a.support.boxModel)&&(c="CSS1Compat"===b?g:e.body,d={height:c.clientHeight,width:c.clientWidth})),d}function j(){return{top:f.pageYOffset||g.scrollTop||e.body.scrollTop,left:f.pageXOffset||g.scrollLeft||e.body.scrollLeft}}function k(){if(b.length){var e=0,f=a.map(b,function(a){var b=a.data.selector,c=a.$element;return b?c.find(b):c});for(c=c||i(),d=d||j();e<b.length;e++)if(a.contains(g,f[e][0])){var h=a(f[e]),k={height:h[0].offsetHeight,width:h[0].offsetWidth},l=h.offset(),m=h.data("inview");if(!d||!c)return;l.top+k.height>d.top&&l.top<d.top+c.height&&l.left+k.width>d.left&&l.left<d.left+c.width?m||h.data("inview",!0).trigger("inview",[!0]):m&&h.data("inview",!1).trigger("inview",[!1])}}}var c,d,h,b=[],e=document,f=window,g=e.documentElement;a.event.special.inview={add:function(c){b.push({data:c,$element:a(this),element:this}),!h&&b.length&&(h=setInterval(k,250))},remove:function(a){for(var c=0;c<b.length;c++){var d=b[c];if(d.element===this&&d.data.guid===a.guid){b.splice(c,1);break}}b.length||(clearInterval(h),h=null)}},a(f).on("scroll resize scrollstop",function(){c=d=null}),!g.addEventListener&&g.attachEvent&&g.attachEvent("onfocusin",function(){d=null})});

			// animate containers that are parents/child
			$('.animate').each(function(index) {
				const _this = this;

				const _dataset = _this.dataset.animate;
				if(_dataset) {
					const _attr = _dataset.split(',');

					// if parent, put index number
					if(_attr[0] == 'parent') {
						$(_this).attr('animate-index', index);
					}

					// if child, group them to its parent
					if(_attr[0] == 'child') {
						$(_this).removeClass('animate');
						const _parentIndex = $(_this).parent().closest('.animate').attr('animate-index');

						if(_parentIndex) {
							$('> *', _this).addClass('animate-child' + _parentIndex);
						}
					}
				}
			});
		},
		run: function() {
			$('.animate').each(function() {
				projName.inview.animate({target: this, clear: true});
			});

			$('.inview').each(function() {
				$(this).one('inview', function(event, visible) {
					if(visible) $(this).addClass('visible');
				});
			});
		},
		animate: function(opt) {
			const _animate = {
				target: null,
				custom: null,
				mobileCustom: null,
				parent: false,
				delay: null,
				index: null,
				init: function() {
					_animate.target = opt.target;

					const _dataset = _animate.target.dataset.animate;
					if(_dataset) {
						const _attr = _dataset.split(',');

						// dont animate the parent
						if(_attr[0] == 'parent') {
							$(_animate.target).removeClass('animate');
							_animate.parent = true;

							// get the parent index
							_animate.index = parseInt(_animate.target.getAttribute('animate-index'));
						}

						// custom css animation
						if(_attr[1]) {
							if(_attr[1] != 'false') _animate.custom = _attr[1];
						}

						// animation delay
						if(_attr[2]) _animate.delay = parseFloat(_attr[2]);

						// if custom css animation for mobile
						if(_attr[3]) {
							if(_attr[3] != 'false') _animate.mobileCustom = _attr[3];
						}
					}

					$(_animate.target).one('inview', function(event, visible) {
						if(visible) {
							if(window.innerWidth <= 768) _animate.custom = _animate.mobileCustom;

							if(_animate.parent) {
								// for parent
								$('.animate-child' + _animate.index).each(function(index) {
									// animate all children at once with delays
									if(index != 0) _animate.delay = _animate.delay + 0.1;

									projName.inview.validate(this, _animate.delay, _animate.custom, opt.clear, _animate.index)
								});

								if(opt.clear) $(_animate.target).removeAttr('animate-index');
							} else {
								// for single
								projName.inview.validate(_animate.target, _animate.delay, _animate.custom, opt.clear);
							}
						}
					});
				}
			}
			_animate.init();
		},
		validate: function(target, delay, custom, clear, index) {
			// add delay
			if(delay) $(target).css('animation-delay', delay + 's');

			if(custom) {
				// add custom animation
				$(target).addClass('anim-custom ' + custom);
			} else {
				// common animation
				$(target).addClass('anim-content');
			}

			// show the animation
			$(target).addClass('visible');

			// remove all animate attributes
			if(clear) {
				setTimeout(function() {
					$(target).removeClass('animate anim-content anim-custom visible');

					if(custom) $(target).removeClass(custom);
					if(index != null) $(target).removeClass('animate-child' + index);

					$(target).css('animation-delay', '');
				}, (0.8 + delay) * 1000);
			}
		}
	},
	st: function() { return window.pageYOffset || document.documentElement.scrollTop },
	
}
projName.init();