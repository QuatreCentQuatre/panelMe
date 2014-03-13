/* http://jsfiddle.net/nicooprat/Aahqh/ pour fiare le css3 qui bug pas */
(function($, window, document, undefined){
    var elStyles = document.createElement('div').style;
    var tweeProps, scope;
    var PanelMe = function($el, $toggler, options){
        this.__construct($el, $toggler, options);
    };

    var proto = PanelMe.prototype;

    proto.debug 			= false;

    proto.$el 	   		    = null;
    proto.$toggler 		    = null;
    proto.$contentCtn		= null;

    proto.options  		    = null;

    proto.is_animating      = false;
    proto.is_opened         = false;

    proto.transform_enabled = false;

    proto.defaults			= {
        side : 'left', // left, right
        closeBtnClass : "close-panel-btn",
        contentCtn	  : "",

        swipeEnabled : true,
        css3Enabled : true,

        openDelay : 0.6,
        openEasing : "Quad.easeInOut",
        onBeforeOpen : function() {
            this.$el.css({zIndex:99999, display:'block'});
        },
        onOpen : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$el.addClass('panel-animation-open');
                scope = this;
                setTimeout(function(){
                    scope.$el.css(scope.positions.open);
                }, 50);
            } else {
                tweeProps = $.extend({}, this.positions.open);
                TweenLite.to(this.$el, this.options.openDelay, tweeProps);
            }
        },
        onAfterOpen : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$el.removeClass('panel-animation-open');
            }
        },

        closeDelay : 0.6,
        closeEasing : "Quad.easeInOut",
        onBeforeClose : function() {
        },
        onClose : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$el.addClass('panel-animation-close');
                scope = this;
                setTimeout(function(){
                    scope.$el.css(scope.positions.close);
                }, 50);
            } else {
                tweeProps = $.extend({}, this.positions.close);
                TweenLite.to(this.$el, this.options.closeDelay, tweeProps);
            }
        },
        onAfterClose : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$el.removeClass('panel-animation-close');
            }
            this.$el.css({zIndex:'', display:'none'});
        }
    };

    //--------Methods--------//
    proto.__construct = function($el, $toggler, options){
        if(!$el) {
            return;
        }

        this.options     = $.extend({}, this.defaults, options);
        delete proto.defaults;

        this.$el	  	 = $el;
        this.$toggler 	 = $toggler;
        this.$contentCtn = $(this.options.contentCtn);

        this.detectFeature.call(this);
        this.addEvent.call(this);

        if(this.debug){
            console.log("__construct :: PanelMe", this);
        }

        this.position.call(this);
        this.resize.call(this);
    };

    proto.detectFeature = function() {
        if (this.options.css3Enabled) {
            if(this.testProps.call(this, ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'])) {
                this.transform_enabled = true;
                this.addCSS.call(this);
            }
        }
    };

    proto.addEvent = function() {
        scope = this;
        this.$toggler.on('click', function(e){
            scope.toggle.call(scope, e);
        });

        this.$el.on('click', '.' + this.options.closeBtnClass, function(e){
            scope.close.call(scope, e);
        });

        $(window).on('resize', function(e){
            scope.resize.call(scope, e);
        });


    };

    proto.handleSwipeEvent = function(bool){
        if (this.options.swipeEnabled) {
            // need to implement swiping detect
            if (bool) {
                $(window).on('movestart.panelme', function(e) {
                    if ((e.distX > e.distY && e.distX < -e.distY) ||
                        (e.distX < e.distY && e.distX > -e.distY)) {
                        e.preventDefault();
                    }
                });
                $(window).on('swipeleft.panelme', function(e){
                    scope.swipe.call(scope, e);
                });
                $(window).on('swiperight.panelme', function(e){
                    scope.swipe.call(scope, e);
                });
            } else {
                $(window).off('movestart.panelme');
                $(window).off('swipeleft.panelme');
                $(window).off('swiperight.panelme');
            }
        }
    };

    proto.swipe = function(e){
        if (this.is_opened && e.type == "swipeleft") {
            this.close.call(this);
        } else if (!this.is_opened && e.type == "swiperight") {
            this.open.call(this);
        }
    };

    proto.position = function(){
        this.positions = {};
        this.positions.open  = {};
        this.positions.close = {};
        this.positions.open.position  = "fixed";
        this.positions.close.position = "fixed";

        if (this.options.side == "left") {
            this.positions.close.left = -(this.$el.width() + 17);
            this.positions.open.left  = 0;
        } else if (this.options.side == "right") {
            this.positions.close.right = -($(window).width() + 17);
            this.positions.open.right  = 0;
        }

        this.positions.open.ease  = this.options.openEasing;
        this.positions.close.ease = this.options.closeEasing;

        if (this.is_opened) {
            this.$el.css(this.positions.open);
        } else {
            this.$el.css(this.positions.close);
            this.$el.css({display:'none'});
        }
    };

    proto.addCSS = function() {
        var type;
        var style = document.createElement('style');
        style.type 	 	 = 'text/css';
        style.innerHTML  = '';

        type = "open";
        style.innerHTML += '.panel-animation-' + type + ' { \n';
        style.innerHTML += this.createCSSBlock(type);
        style.innerHTML += '}\n';

        type = "close";
        style.innerHTML += '.panel-animation-' + type + ' { \n';
        style.innerHTML += this.createCSSBlock(type);
        style.innerHTML += '}\n';

        document.getElementsByTagName('head')[0].appendChild(style);
    };

    proto.toggle = function(e) {
        e.preventDefault();
        if (this.is_opened) {
            this.close.call(this);
        } else {
            this.open.call(this);
        }
    };

    proto.show = function() {
        this.is_opened = true;
        this.options.onBeforeOpen.call(this);
        this.position.call(this);
        this.options.onAfterOpen.call(this);
    };

    proto.open = function(){
        if(this.is_animating || this.is_opened) {
            return;
        }

        this.is_animating = true;
        this.options.onBeforeOpen.call(this);
        this.options.onOpen.call(this);

        scope = this;
        setTimeout(function(){
            scope.options.onAfterOpen.call(scope);
            scope.is_animating = false;
            scope.is_opened    = true;
        }, this.options.openDelay * 1000);
    };

    proto.hide = function() {
        this.is_opened = false;
        this.options.onBeforeClose.call(this);
        this.position.call(this);
        this.options.onAfterClose.call(this);
    };

    proto.close = function(){
        if(this.is_animating || !this.is_opened) {
            return;
        }

        this.is_animating = true;
        this.options.onBeforeClose.call(this);
        this.options.onClose.call(this);

        scope = this;
        setTimeout(function(){
            scope.options.onAfterClose.call(scope);
            scope.is_animating = false;
            scope.is_opened    = false;
        }, this.options.closeDelay * 1000);
    };


    proto.resize = function(e){
        var viewPortSize = this.getSize();
        if (viewPortSize.w < 768) {
            this.handleSwipeEvent.call(this, true);
        } else {
            this.handleSwipeEvent.call(this, false);
        }
        this.position.call(this);
    };

    proto.testProps = function(props, prefixed) {
        if(!prefixed) {
            prefixed = null;
        }
        for (var index in props) {
            if (elStyles[props[index]] !== undefined) {
                return (prefixed == 'pfx') ? props[index] : true;
            }
        }
        return false;
    };

    proto.createCSSBlock = function(type) {
        var delay = this.options[type + 'Delay'];
        var ease  = this.options[type + 'Easing'].split('.');
        var css   = "";
        css += 'transition-property:top, left, right, bottom;' + "\n";
        css += 'transition-duration:' + delay + 's;' + "\n";
        css += 'transition-timing-function:' + ease[1] + ease[0] + ';' + "\n";
        return css;
    };

    proto.toString = function() {
        return "[PanelMe]";
    };

    proto.getSize = function(){
        var isIE = this.isOldIE();
        if(isIE && isIE.version < 9) {
            var d = $(document).height(), w = $(window).height();
            return [
                window.innerWidth || 						// ie7+
                    document.documentElement.clientWidth || 	// ie6
                    document.body.clientWidth, 					// ie6 quirks mode
                d - w < 20 ? w : d
            ];
        }
        return {w:$(window).width(), h:$(window).height()};
    };

    proto.isOldIE = function(){
        var ieData = {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        };

        var browserInfo = {};

        if(this.searchString(ieData)){
            browserInfo.id = this.searchString(ieData);
            browserInfo.version = this.searchVersion(ieData);
        } else {
            browserInfo = null;
        }

        return browserInfo;
    };

    proto.searchString = function(data) {
        var dataString = data.string;
        var dataProp = data.prop;
        if (dataString && dataString.indexOf(data.subString) != -1) {
            return data.identity;
        } else if (dataProp) {
            return data.identity;
        }

        return null;
    };

    proto.searchVersion = function(data) {
        var dataString = data.string;
        var versionSearchString = data.versionSearch || data.identity;
        var index = dataString.indexOf(versionSearchString);
        if (index == -1) return null;
        return parseFloat(dataString.substring(index + versionSearchString.length + 1));
    };

    if(!window.Me) {
        window.Me = {};
    }
    Me.panel = PanelMe;
}(jQuery, window, document));