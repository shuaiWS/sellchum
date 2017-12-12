/**
 * <carousel-view item-data-source="{{list}}" interval="2" layout="virtical" auto-slide="false" forward="false">
 *      <img drunk-attr="{src: $item}">
 * </carousel-view>
 */
var drunk;
(function (drunk) {
    var dom = drunk.dom;
    var util = drunk.util;
    var HORIZENTAL = 'horizental';
    var VIRTICAL = 'virtical';
    var isInitialized = false;
    var CarouselView = CarouselView_1 = (function (_super) {
        __extends(CarouselView, _super);
        function CarouselView() {
            var _this = _super.apply(this, arguments) || this;
            _this.template = "<div class=\"carousel-view\" " + drunk.config.prefix + "on=\"touchstart:touchBegin($event);touchmove:touchMove($event);touchend:touchEnd($event)\">\n                      <div class=\"scroller\">\n                        <div class=\"container\"\n                             style=\"{{layout == 'virtical' ? 'top' : 'left'}}:{{(itemDataSource.length == 1 ? 0 : ($index - 1)) * 100}}%;\n                             -webkit-transform:translate({{$x}}%,{{$y}}%);\n                             transform:translate({{$x}}%,{{$y}}%);\"\n                             " + drunk.config.prefix + "repeat=\"$item,$index in $renderList\"\n                             " + drunk.config.prefix + "on=\"transitionend:transitionEnd($el); webkitTransitionEnd:transitionEnd($el)\">\n                        </div>\n                      </div>\n                    </div>";
            _this.$x = 0;
            _this.$y = 0;
            _this.interval = 3;
            _this.index = 0;
            _this.layout = HORIZENTAL;
            _this.autoSlide = true;
            _this.forward = true;
            _this._slideIndex = 0;
            return _this;
        }
        CarouselView.initStyle = function () {
            if (isInitialized) {
                return;
            }
            dom.addCSSRule({
                '.carousel-view .scroller': {
                    'position': 'relative',
                    'width': '100%',
                    'height': '100%'
                },
                '.carousel-view .container': {
                    'position': 'absolute',
                    'width': '100%',
                    'height': '100%'
                },
                '.carousel-view .container.transition': {
                    'transition': 'all 0.4s cubic-bezier(0, 0.99, 0.58, 1)'
                }
            });
            isInitialized = true;
        };
        CarouselView.prototype.init = function () {
            var _this = this;
            this.$watch('itemDataSource', function (list) {
                list = list || [];
                if (list && list.length > 1) {
                    _this.$renderList = [list[list.length - 1]].concat(list, [list[0]]);
                    _this._maxTranslatePercent = 100;
                    _this._minTranslatePerncet = list.length * -100;
                }
                else {
                    _this.$renderList = list.slice();
                    _this._maxTranslatePercent = _this._minTranslatePerncet = 0;
                }
                if (!_this._initialized) {
                    _this._translate(_this.index, false);
                }
            });
            this.$watch('index', function (newIndex, oldIndex) {
                if (newIndex == null) {
                    return;
                }
                if (_this._minTranslatePerncet != null && _this._maxTranslatePercent != null && !_this._isLocked && !_this._isTranslating) {
                    _this._slideIndex = newIndex;
                    _this._translate(newIndex);
                }
                else {
                    _this._isTranslating = false;
                }
            });
            CarouselView_1.initStyle();
            var onResize = function () {
                var element = _this.element;
                _this._size = {
                    width: element.offsetWidth,
                    height: element.offsetHeight
                };
            };
            window.addEventListener('resize', onResize);
            this.$on(drunk.Component.Event.release, function () {
                window.removeEventListener('resize', onResize);
                _this._stopTimer();
            });
            this._startTimer();
        };
        CarouselView.prototype.$mount = function (element, viewModel, placehodler) {
            var itemTemplate = placehodler.firstElementChild;
            if (!itemTemplate) {
                return console.error('carousel-view: 缺少item模板');
            }
            var container = element.querySelector('.container');
            itemTemplate = itemTemplate.cloneNode(true);
            container.appendChild(itemTemplate);
            this._size = { width: element.offsetWidth, height: element.offsetHeight };
            _super.prototype.$mount.call(this, element, viewModel, placehodler);
        };
        CarouselView.prototype.touchBegin = function (event) {
            if (!this.$renderList || !this.$renderList.length) {
                return;
            }
            var touch = event.touches[0];
            this._startPoint = { x: touch.clientX, y: touch.clientY };
            this._startTranslateX = this.$x;
            this._startTranslateY = this.$y;
            this._isLocked = true;
            this._stopTimer();
        };
        CarouselView.prototype.touchMove = function (event) {
            if (!this._startPoint) {
                return;
            }
            var touch = event.touches[0];
            if (this.layout === HORIZENTAL) {
                var x = this._moveOffset = touch.clientX - this._startPoint.x;
                var value = this._startTranslateX + (x / this._size.width * 100);
                this.$x = this._clamp(value);
            }
            else if (this.layout === VIRTICAL) {
                var y = this._moveOffset = touch.clientY - this._startPoint.y;
                var value = this._startTranslateY + (y / this._size.height * 100);
                this.$y = this._clamp(value);
            }
            event.preventDefault();
        };
        CarouselView.prototype.touchEnd = function (event) {
            if (this._moveOffset != null) {
                var abs = Math.abs(this._moveOffset);
                if (abs >= this._size.width * 0.3) {
                    this._translateNext(this._moveOffset < 0);
                }
                else {
                    this._translate(this.index);
                }
                event.preventDefault();
            }
            this._startPoint = this._startTranslateX = this._startTranslateY = this._moveOffset = null;
            this._isLocked = false;
            this._startTimer();
        };
        CarouselView.prototype.transitionEnd = function (element) {
            dom.removeClass(element, 'transition');
            if (this._slideIndex !== this.index) {
                this._slideIndex = this.index;
                this._translate(this.index, false);
            }
        };
        CarouselView.prototype._translate = function (index, transition) {
            if (transition === void 0) { transition = true; }
            this._initialized = true;
            if (this.layout === HORIZENTAL) {
                this.$y = 0;
                this.$x = this._clamp(index * -100);
            }
            else if (this.layout === VIRTICAL) {
                this.$x = 0;
                this.$y = this._clamp(index * -100);
            }
            if (transition) {
                util.toArray(this.element.querySelectorAll('.container')).forEach(function (element) {
                    dom.addClass(element, 'transition');
                });
            }
        };
        CarouselView.prototype._startTimer = function () {
            var _this = this;
            if (this._autoSlideTimer) {
                return;
            }
            this._autoSlideTimer = setTimeout(function () {
                _this._autoSlideTimer = null;
                if (_this.autoSlide && !_this._isLocked) {
                    _this._translateNext(_this.forward);
                }
                _this._startTimer();
            }, this.interval * 1000);
        };
        CarouselView.prototype._stopTimer = function () {
            clearTimeout(this._autoSlideTimer);
            this._autoSlideTimer = null;
        };
        CarouselView.prototype._translateNext = function (forward) {
            if (forward) {
                this._slideIndex += 1;
                if (this.index === this.itemDataSource.length - 1) {
                    this.index = 0;
                }
                else {
                    this.index += 1;
                }
            }
            else {
                this._slideIndex -= 1;
                if (this.index === 0) {
                    this.index = this.itemDataSource.length - 1;
                }
                else {
                    this.index -= 1;
                }
            }
            this._translate(this._slideIndex);
            this._isTranslating = true;
        };
        CarouselView.prototype._clamp = function (value) {
            if (this.itemDataSource.length === 1) {
                return 0;
            }
            return Math.max(this._minTranslatePerncet, Math.min(value, this._maxTranslatePercent));
        };
        return CarouselView;
    }(drunk.Component));
    CarouselView.Layout = {
        virtical: VIRTICAL,
        horizental: HORIZENTAL
    };
    CarouselView = CarouselView_1 = __decorate([
        drunk.component('carousel-view')
    ], CarouselView);
    drunk.CarouselView = CarouselView;
    var CarouselView_1;
})(drunk || (drunk = {}));