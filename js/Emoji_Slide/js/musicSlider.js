(function ($) {
    $.fn.rotatingSlider = function (options) {
        var rotatingSlider = {
            init: function (el) {
                this.$slider = $(el);
                this.$slidesContainer = this.$slider.children('ul.slides');
                this.$slides = this.$slidesContainer.children('li');
                this.$clipPath;
                this.$directionControls;
                this.$currentSlide;
                this.$secondSlide;
                this.$thirdSlide;

                this.settings = $.extend({
                    autoRotate: true,
                    autoRotateInterval: 2000,
                    draggable: true,
                    directionControls: true,
                    directionLeftText: '&lsaquo;',
                    directionRightText: '&rsaquo;',
                    rotationSpeed: 750,
                    slideHeight: 360,
                    slideWidth: 480,
                    /* Callback Functions */
                    beforeRotationStart: function () { },
                    afterRotationStart: function () { },
                    beforeRotationEnd: function () { },
                    afterRotationEnd: function () { }
                }, options);

                this.slideAngle = 360 / this.$slides.length;
                this.currentRotationAngle = 0;
                this.autoRotateIntervalId = false;
                this.rotateTimoutId = false;
                this.currentlyRotating = false;
                this.readyToDrag = false;
                this.dragStartPoint;
                this.dragStartAngle;
                this.currentlyDragging = false;
                this.markupIsValid = false;

                this.validateMarkup();
                if (this.markupIsValid) {
                    this.renderSlider();
                    this.setCurrentSlide();
                    this.bindEvents();
                    if (this.settings.autoRotate) {
                        this.startAutoRotate();
                    }
                }
            },
            bindEvents: function () {
                if (this.settings.draggable) {
                    this.$slidesContainer.on('mousedown touchstart', this.handleDragStart.bind(this));
                    this.$slidesContainer.on('mousemove touchmove', this.handleDragMove.bind(this));
                    this.$slidesContainer.on('mouseup mouseleave touchend', this.handleDragEnd.bind(this));
                }
                if (this.settings.directionControls) {
                    this.$slider.find('ul.direction-controls .left-arrow button').click(this.handleLeftDirectionClick.bind(this));
                    this.$slider.find('ul.direction-controls .right-arrow button').click(this.handleRightDirectionClick.bind(this));
                }
            },
            handleDragStart: function (e) {
                this.readyToDrag = true;
                this.dragStartPoint = (e.type === 'mousedown') ? e.pageX : e.originalEvent.touches[0].pageX;
            },
            handleDragMove: function (e) {
                if (this.readyToDrag) {
                    var pageX = (e.type === 'mousemove') ? e.pageX : e.originalEvent.touches[0].pageX;
                    if (
                        this.currentlyDragging === false &&
                        this.currentlyRotating === false &&
                        (this.dragStartPoint - pageX > 10 || this.dragStartPoint - pageX < -10)
                    ) {
                        this.stopAutoRotate();
                        if (this.settings.directionControls) {
                            this.$directionControls.css('pointer-events', 'none');
                        }
                        window.getSelection().removeAllRanges();
                        this.currentlyDragging = true;
                        this.dragStartAngle = this.currentRotationAngle;
                    }
                    if (this.currentlyDragging) {
                        this.currentRotationAngle = this.dragStartAngle - ((this.dragStartPoint - pageX) / this.settings.slideWidth * this.slideAngle);
                        this.$slidesContainer.css('transform', 'translateX(-50%) rotate(' + this.currentRotationAngle + 'deg)');
                    }
                }
            },
            handleDragEnd: function (e) {
                this.readyToDrag = false;
                if (this.currentlyDragging) {
                    this.currentlyDragging = false;
                    this.currentRotationAngle = Math.round(this.currentRotationAngle / this.slideAngle) * this.slideAngle;
                    this.rotate();
                    if (this.settings.directionControls) {
                        this.$directionControls.css('pointer-events', '');
                    }
                }
            },
            handleLeftDirectionClick: function (e) {
                e.preventDefault();
                this.stopAutoRotate();
                this.rotateClockwise();
            },
            handleRightDirectionClick: function (e) {
                e.preventDefault();
                this.stopAutoRotate();
                this.rotateCounterClockwise();
            },
            renderSlider: function () {
                var halfAngleRadian = this.slideAngle / 2 * Math.PI / 180;
                var innerRadius = 1 / Math.tan(halfAngleRadian) * this.settings.slideWidth / 2;
                var outerRadius = Math.sqrt(Math.pow(innerRadius + this.settings.slideHeight, 2) + (Math.pow((this.settings.slideWidth / 2), 2)));
                upperArcHeight = outerRadius - (innerRadius + this.settings.slideHeight);
                lowerArcHeight = innerRadius - (innerRadius * (Math.cos(halfAngleRadian)));
                var slideFullWidth = (Math.sin(halfAngleRadian) * outerRadius) * 2;
                var slideFullHeight = upperArcHeight + this.settings.slideHeight + lowerArcHeight
                var fullArcHeight = outerRadius - (outerRadius * (Math.cos(halfAngleRadian)));
                var lowerArcOffset = (slideFullWidth - (Math.sin(halfAngleRadian) * innerRadius * 2)) / 2;

                this.$slidesContainer.css('height', outerRadius * 2 + 'px');
                this.$slidesContainer.css('width', outerRadius * 2 + 'px');

                /* Offset width and arc height */
                this.$slidesContainer.css('transform', 'translateX(-50%)');
                this.$slidesContainer.css('top', '-' + upperArcHeight + 'px');

                /* Generate path for slide clipping */
                var pathCoords = 'M 0 ' + fullArcHeight;
                pathCoords += ' A ' + outerRadius + ' ' + outerRadius + ' 0 0 1 ' + slideFullWidth + ' ' + fullArcHeight;
                pathCoords += ' L ' + (slideFullWidth - lowerArcOffset) + ' ' + slideFullHeight;
                pathCoords += ' A ' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + lowerArcOffset + ' ' + slideFullHeight + ' Z';
                this.$slider.find('#slideClipPath>path').attr('d', pathCoords);

                /* Apply styles to each slide */
                this.$slides.each(function (i, el) {
                    var $slide = $(el);
                    /* Set distance from point of rotation */
                    $slide.css('transform-origin', 'center ' + (innerRadius + this.settings.slideHeight) + 'px');

                    /* Offset container Arc Height */
                    $slide.css('top', upperArcHeight + 'px');

                    /* Offset Width, then Rotate Slide, then offset individual Top Arcs  */
                    $slide.css('transform', 'translateX(-50%) rotate(' + this.slideAngle * i + 'deg) translateY(-' + upperArcHeight + 'px)');

                    /* Add clipping path  */
                    $slide.css('-webkit-clip-path', 'url(#slideClipPath)');
                    $slide.css('clip-path', 'url(#slideClipPath)');
                }.bind(this));

                /* Render Arrow Controls */
                if (this.settings.directionControls) {
                    var directionArrowsHTML = '<ul class="direction-controls">';
                    directionArrowsHTML += '<li class="left-arrow"><button>' + this.settings.directionLeftText + '</button></li>';
                    directionArrowsHTML += '<li class="right-arrow"><button>' + this.settings.directionRightText + '</button></li>';
                    directionArrowsHTML += '</ul>';
                    this.$slider.append(directionArrowsHTML);
                    this.$directionControls = this.$slider.find('ul.direction-controls');
                }

            },
            rotateClockwise: function () {
                this.currentRotationAngle = this.currentRotationAngle + this.slideAngle;
                this.rotate();
            },
            rotateCounterClockwise: function () {
                this.currentRotationAngle = this.currentRotationAngle - this.slideAngle;
                this.rotate();
            },
            rotate: function () {
                this.beforeRotationStart();
                this.currentlyRotating = true;
                this.$slider.addClass('currently-rotating');
                this.setCurrentSlide();

                if (this.rotateTimeoutId) {
                    clearTimeout(this.rotateTimeoutId);
                    this.rotateTimeoutId = false;
                }

                this.$slidesContainer.css('transition', 'transform ' + (this.settings.rotationSpeed / 1000) + 's ease-in-out');
                this.$slidesContainer.css('transform', 'translateX(-50%) rotate(' + this.currentRotationAngle + 'deg)');

                this.afterRotationStart();

                this.rotateTimeoutId = setTimeout(function () {
                    this.beforeRotationEnd();
                    this.currentlyRotating = false;
                    this.$slider.removeClass('currently-rotating');
                    this.$slidesContainer.css('transition', 'none');

                    /* keep currentRotationAngle between -360 and 360 */
                    if (this.currentRotationAngle >= 360 || this.currentRotationAngle <= -360) {
                        this.currentRotationAngle = this.currentRotationAngle >= 360 ? this.currentRotationAngle - 360 : this.currentRotationAngle + 360;
                        this.$slidesContainer.css('transform', 'translateX(-50%) rotate(' + this.currentRotationAngle + 'deg)');
                    }
                    this.afterRotationEnd();
                }.bind(this), this.settings.rotationSpeed);
            },
            setCurrentSlide: function () {
                var currAngle = this.currentRotationAngle;
                if (this.currentRotationAngle >= 360 || this.currentRotationAngle <= -360) {
                    currAngle = currAngle >= 360 ? currAngle - 360 : currAngle + 360;
                }
                this.$currentSlide = this.$slides.eq(-currAngle / this.slideAngle);
                this.$secondSlide = (this.$currentSlide.is(':last-child') ? this.$slides.first() : this.$currentSlide.next());
                this.$thirdSlide = (this.$secondSlide.is(':last-child') ? this.$slides.first() : this.$secondSlide.next());

                this.$slides.removeClass('active-slide');
                this.$slides.removeClass('second-slide');
                this.$slides.removeClass('third-slide');

                this.$currentSlide.addClass('active-slide');
                this.$secondSlide.addClass('second-slide');
                this.$thirdSlide.addClass('third-slide');
            },
            startAutoRotate: function () {
                this.autoRotateIntervalId = setInterval(function () {
                    this.rotateCounterClockwise();
                }.bind(this), this.settings.autoRotateInterval);
            },
            stopAutoRotate: function () {
                if (this.autoRotateIntervalId) {
                    clearInterval(this.autoRotateIntervalId);
                    this.autoRotateIntervalId = false;
                }
            },
            validateMarkup: function () {
                if (
                    this.$slider.hasClass('rotating-slider') &&
                    this.$slidesContainer.length === 1 &&
                    this.$slides.length >= 2
                ) {
                    this.markupIsValid = true;
                } else {
                    this.$slider.css('display', 'none');
                    console.log('Markup for Rotating Slider is invalid.');
                }
            },

            /* Callbacks */
            beforeRotationStart: function () {
                this.settings.beforeRotationStart();
            },
            afterRotationStart: function () {
                this.settings.afterRotationStart();
            },
            beforeRotationEnd: function () {
                this.settings.beforeRotationEnd();
            },
            afterRotationEnd: function () {
                this.settings.afterRotationEnd();
            },
        };

        return this.each(function () {
            rotatingSlider.init(this);
        });
    };
}(jQuery));

$(function () {
    $('.rotating-slider').rotatingSlider({
        slideHeight: Math.min(360, window.innerWidth - 80),
        slideWidth: Math.min(480, window.innerWidth - 80),
    });
}); 
// active-slide를 가지고 있으면 .speechBubble에 css로 보이고 스케일 늘어나게