//SLIDER

'use strict';
var slider = (function (config) {

	const ClassName = {
		INDICATOR_ACTIVE: 'slider__indicator_active',
		ITEM: 'slider__item',
		ITEM_LEFT: 'slider__item_left',
		ITEM_RIGHT: 'slider__item_right',
		ITEM_PREV: 'slider__item_prev',
		ITEM_NEXT: 'slider__item_next',
		ITEM_ACTIVE: 'slider__item_active'
	}

	var
		_isSliding = false, //  slide change indicator
		_interval = 0, //  timer
		_transitionDuration = 700, // rate of change of values
		_slider = {}, //  DOM element slider
		_items = {}, // array
		_sliderIndicators = {}, //
		_config = {
			selector: '', // 
			isCycling: true, // automatic slide change
			direction: 'next', //  slide change direction
			interval: 5000, //   interval between automatic change of slides
			pause: true //  stop when you hover cursor to the slider
		};

	var
		// function to get the ordinal index of an element
		_getItemIndex = function (_currentItem) {
			var result;
			_items.forEach(function (item, index) {
				if (item === _currentItem) {
					result = index;
				}
			});
			return result;
		},
		// highlight active indicator function
		_setActiveIndicator = function (_activeIndex, _targetIndex) {
			if (_sliderIndicators.length !== _items.length) {
				return;
			}
			_sliderIndicators[_activeIndex].classList.remove(ClassName.INDICATOR_ACTIVE);
			_sliderIndicators[_targetIndex].classList.add(ClassName.INDICATOR_ACTIVE);
		},

		//slide change function
		_slide = function (direction, activeItemIndex, targetItemIndex) {
			var
				directionalClassName = ClassName.ITEM_RIGHT,
				orderClassName = ClassName.ITEM_PREV,
				activeItem = _items[activeItemIndex], // current item
				targetItem = _items[targetItemIndex]; // next item

			var _slideEndTransition = function () {
				activeItem.classList.remove(ClassName.ITEM_ACTIVE);
				activeItem.classList.remove(directionalClassName);
				targetItem.classList.remove(orderClassName);
				targetItem.classList.remove(directionalClassName);
				targetItem.classList.add(ClassName.ITEM_ACTIVE);
				window.setTimeout(function () {
					if (_config.isCycling) {
						clearInterval(_interval);
						_cycle();
					}
					_isSliding = false;
					activeItem.removeEventListener('transitionend', _slideEndTransition);
				}, _transitionDuration);
			};

			if (_isSliding) {
				return; // stop the function if the process of changing the slide
			}
			_isSliding = true; // There is a process of changing the slide

			if (direction === "next") { // set the value of classes depending on the direction
				directionalClassName = ClassName.ITEM_LEFT;
				orderClassName = ClassName.ITEM_NEXT;
			}

			targetItem.classList.add(orderClassName); // set the position of the element before the transformation
			_setActiveIndicator(activeItemIndex, targetItemIndex); // set the active indicator

			window.setTimeout(function () { // start the transformation
				targetItem.classList.add(directionalClassName);
				activeItem.classList.add(directionalClassName);
				activeItem.addEventListener('transitionend', _slideEndTransition);
			}, 0);

		},
		// function to go to the previous or next slide
		_slideTo = function (direction) {
			var
				activeItem = _slider.querySelector('.' + ClassName.ITEM_ACTIVE), // current item
				activeItemIndex = _getItemIndex(activeItem), // current item index
				lastItemIndex = _items.length - 1, // last item index
				targetItemIndex = activeItemIndex === 0 ? lastItemIndex : activeItemIndex - 1;
			if (direction === "next") { // determine the index of the next slide depending on the direction
				targetItemIndex = activeItemIndex == lastItemIndex ? 0 : activeItemIndex + 1;
			}
			_slide(direction, activeItemIndex, targetItemIndex);
		},
		// function to start an automatic slide change in a specified direction
		_cycle = function () {
			if (_config.isCycling) {
				_interval = window.setInterval(function () {
					_slideTo(_config.direction);
				}, _config.interval);
			}
		},
		// event handing click
		_actionClick = function (e) {
			var
				activeItem = _slider.querySelector('.' + ClassName.ITEM_ACTIVE), // current element
				activeItemIndex = _getItemIndex(activeItem), // current element index
				targetItemIndex = e.target.getAttribute('data-slide-to');

			if (!(e.target.hasAttribute('data-slide-to') || e.target.classList.contains('slider__control'))) {
				return; // complete if the click falls on the wrong elements
			}
			if (e.target.hasAttribute('data-slide-to')) { // move to the specified pass
				if (activeItemIndex === targetItemIndex) {
					return;
				}
				_slide((targetItemIndex > activeItemIndex) ? 'next' : 'prev', activeItemIndex, targetItemIndex);
			} else {
				e.preventDefault();
				_slideTo(e.target.classList.contains('slider__control_next') ? 'next' : 'prev');
			}
		},
		// installing event handlers
		_setupListeners = function () {
			// add a click event handler to the slider
			_slider.addEventListener('click', _actionClick);
			// stop the automatic slide change (when the cursor is over the slider)
			if (_config.pause && _config.isCycling) {
				_slider.addEventListener('mouseenter', function (e) {
					clearInterval(_interval);
				});
				_slider.addEventListener('mouseleave', function (e) {
					clearInterval(_interval);
					_cycle();
				});
			}
		};

	// init (slider initialization)
	for (var key in config) {
		if (key in _config) {
			_config[key] = config[key];
		}
	}
	_slider = (typeof _config.selector === 'string' ? document.querySelector(_config.selector) : _config.selector);
	_items = _slider.querySelectorAll('.' + ClassName.ITEM);
	_sliderIndicators = _slider.querySelectorAll('[data-slide-to]');
	// start up cycle
	_cycle();
	_setupListeners();

	return {
		next: function () {
			_slideTo('next');
		},
		prev: function () {
			_slideTo('prev');
		},
		stop: function () {
			clearInterval(_interval);
		},
		cycle: function () {
			clearInterval(_interval);
			_cycle();
		}
	}
}({
	selector: '.slider',
	isCycling: true,
	direction: 'next',
	interval: 5000,
	pause: true
}));
