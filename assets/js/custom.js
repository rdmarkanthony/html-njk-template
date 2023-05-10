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
		projName.animate.init();

		// for general resize
		projName.event.resize(function(event) {
			projName.resize(event);
		});

		// for ready
		$(document).ready(function() {
			projName.ready();
		});
	},
	ready: function() {
		// show animate
		projName.animate.run();

		// for auto-scroll
		projName.scroll.init();

		console.log( projName );
	},
	debug: {
		active: false,
		init: function() {
			if(projName.url.getVars().debug == 'true') projName.debug.active = true;

			if(projName.url.getVars().outline == 'true') {
				$('div').each(function() {
					$(this).css({outline: '1px dashed #ff0000'});
				});
			}
		}
	},
	header: {
		target: document.querySelector('.header-content'),
		height: function() {
			if(!projName.header.target) return 0;
			return projName.header.target.offsetHeight;
		},
		init: function() {
		}
	},
	footer: {
		target: document.querySelector('.footer-content'),
		height: function() {
			if(!projName.footer.target) return 0;
			return projName.footer.target.offsetHeight;
		},
		init: function() {
		}
	},
	resize: function(event) {
		// sticky footer
		$(projName.footer.target).css({marginTop: -(projName.footer.height())});
		$('#main-wrapper').css({paddingBottom: projName.footer.height()});

		if(event == 'resize') return;
		// for equal height
		$('[data-group-height]').each(function() {
			let _groups = [];

			$('[gh-item]', this).each(function() {
				const _item = this.getAttribute('gh-item').split(',');

				if(_item[0].length <= 0) _item[0] = 1;

				const _groupNum = parseInt(_item[0]) - 1;
				if(_item[1]) this.within = parseInt(_item[1]);
				
				if(!_groups[_groupNum]) _groups.push([]);

				_groups[_groupNum].push(this);
			});

			if(_groups.length > 0) {
				for (let i = 0; i < _groups.length; i++) {
					projName.equalHeight(_groups[i]);
				}
			}
		});
		$('[data-row-group-height]').each(function() {
			let _parentWidth = this.offsetWidth;
			let _items = this.querySelectorAll('[rgh-item]');
			let _itemsPerRow = Math.floor(_parentWidth / _items[0].offsetWidth);

			let _groups = [];

			let _itemCounter = 0;
			for (let i = 0; i < _items.length; i++) {
				if(_itemCounter == 0) _groups.push([]);

				_groups[_groups.length - 1].push(_items[i]);

				_itemCounter++;
				if(_itemCounter >= _itemsPerRow) _itemCounter = 0;
			}

			if(_groups.length > 0) {
				for (let i = 0; i < _groups.length; i++) {
					projName.equalHeight(_groups[i]);
				}
			}
		});
		
	},
	scroll: {
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
						const _targetOffset = projName.scroll.top() - $(_target).offset().top;

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
		},
		top: function() { return window.pageYOffset || document.documentElement.scrollTop },
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
			if($(target).offset().top <= projName.scroll.top()) {
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
		}
	},
	isMobile: function() {
		return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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
	width: function() {
		return window.innerWidth - (window.innerWidth - document.documentElement.clientWidth);
	},
	height: function() {
		return window.innerHeight - (window.innerHeight - document.documentElement.clientHeight);
	},
	equalHeight: function(elements) {
		// clear the height first
		for (let i = 0; i < elements.length; i++) {
			elements[i].style.minHeight = '';
		} 
		if(elements.length <= 1) return;

		// find which has highest height
		let _biggestHeight = 0;
		for (let i = 0; i < elements.length; i++) {
			const _elHeight = elements[i].offsetHeight;
			if(_elHeight > _biggestHeight) _biggestHeight = _elHeight;
		}

		// apply the common height
		for (let i = 0; i < elements.length; i++) {
			if(elements[i].within) {
				// if has media-query
				if(projName.width() >= elements[i].within) elements[i].style.minHeight = _biggestHeight + 'px';
			} else {
				elements[i].style.minHeight = _biggestHeight + 'px';
			}
		}
	},
	animate: {
		init: function() {
			$('[data-animate]').each(function() {
				const _this = this;
				const _dataset = this.dataset.animate.split(',');

				_this.opt = {
					status: null,
					animation: 'animateFade',
					duration: null,
					delay: null
				}
				
				if(_dataset[0] != 'parent' && _dataset[0] != 'child') {
					// for single animation
					if(projName.animate.getValue(_dataset[0])) _this.opt.animation = _dataset[0];
					if(projName.animate.getValue(_dataset[1])) _this.opt.duration = _dataset[1];
					if(projName.animate.getValue(_dataset[2])) _this.opt.delay = _dataset[2];

					projName.animate.addListener(_this);
				} else {
					// for group animation
					if(_dataset[0] != 'parent') return;

					if(projName.animate.getValue(_dataset[1])) _this.opt.animation = _dataset[1];
					if(projName.animate.getValue(_dataset[2])) _this.opt.duration = _dataset[2];
					if(projName.animate.getValue(_dataset[3])) _this.opt.delay = _dataset[3];

					_this.opt.status = 'parent';

					$('[data-animate="child"]', _this).each(function() {
						$('> *', this).each(function() {
							$(this).attr('data-animate', 'sub-child');
						});
					});

					let _delay = 0.5;
					if(_this.opt.delay) _delay = parseFloat(_this.opt.delay);
					$('[data-animate]', _this).each(function() {
						if(this.dataset.animate == 'child') return;

						this.opt = Object.create(_this.opt);
						this.opt.status = 'child';

						_delay += 0.05;
						this.opt.delay = _delay;

						projName.animate.addListener(this);
					});
				}
			});
		},
		getValue: function(target) {
			if(!target) return false;
			if(target.length <= 0) return false;
			if(target == 'false') return false;
			return target;
		},
		addListener: function(target) {
			target.addEventListener('visible', function() {
				$(target).addClass(target.opt.animation);
				if(target.opt.duration) $(target).css({'animation-duration': target.opt.duration + 's'});
				if(target.opt.delay) $(target).css({'animation-delay': target.opt.delay + 's'});

				$(target).addClass('animated');

				const _duration = parseFloat($(target).css('animation-duration'));
				const _delay = parseFloat($(target).css('animation-delay'));

				setTimeout(function() {
					$(target).removeAttr('data-animate').removeClass('animated animateFade').css({'animation-duration': '', 'animation-delay': ''});
					if(target.opt.animation) $(target).removeClass(target.opt.animation);
					if(target.style.length <= 0) target.removeAttribute('style');
				}, (_duration + _delay) * 1000);
			});
		},
		run: function() {
			$('[data-animate]').each(function() {
				const _this = this;

				const _opt = this.opt;
				let _animated = false;

				if(_opt.status != 'parent' && _opt.status != 'child') {
					$(_this).on('inview', function(event, visible) {
						if(visible) {
							if(_animated) return;
							_animated = true;

							projName.event.dispatch(_this, 'visible');
						}
					});
				} else {
					if(_opt.status != 'parent') return;

					$(_this).on('inview', function(event, visible) {
						if(visible) {
							if(_animated) return;
							_animated = true;
							$(_this).addClass('visible');
							$('[data-animate="child"]', _this).removeAttr('data-animate');

							$('[data-animate]', _this).each(function() {
								projName.event.dispatch(this, 'visible');
							});
						}
					});
				}
			});
		}
	}
}
projName.init();