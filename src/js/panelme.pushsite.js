(function($, window, document, undefined){
    var tweeProps, scope;
    var PanelMeSitePush = function($el, $toggler, options){
        this.__construct($el, $toggler, options);
    };
    var proto = PanelMeSitePush.prototype = new Me.Panel();

    proto.$siteCtn 			= null;

    proto.overwrite_default = {
        siteCtn	   : "",
        siteOffset : 50,
        onBeforeOpen : function() {

            this.$el.css({display:'block'});
            this.$siteCtn.css({position:'fixed', width:'100%'});
        },
        onOpen : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$siteCtn.addClass('panel-animation-open');
                scope = this;
                setTimeout(function(){
                    scope.$siteCtn.css(scope.positions.site_open);
                }, 50);
            } else {
                tweeProps = $.extend({}, this.positions.site_open);
                TweenLite.to(this.$siteCtn, this.options.openDelay, tweeProps);
            }
        },
        onAfterOpen : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$siteCtn.removeClass('panel-animation-open');
            }
            this.$el.css({zIndex:99999});
        },
        onBeforeClose : function() {
            this.$el.css({zIndex:''});
        },
        onClose : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$siteCtn.addClass('panel-animation-close');
                scope = this;
                setTimeout(function(){
                    scope.$siteCtn.css(scope.positions.site_close);
                }, 50);
            } else {
                tweeProps = $.extend({}, this.positions.site_close);
                TweenLite.to(this.$siteCtn, this.options.closeDelay, tweeProps);
            }
        },
        onAfterClose : function() {
            if (this.options.css3Enabled && this.transform_enabled) {
                this.$siteCtn.removeClass('panel-animation-close');
            }
            this.$el.css({display:''});
            this.$siteCtn.css({position:'', width:''});
        }
    };

    //--------Methods--------//
    proto.core__construct = proto.__construct;
    proto.__construct = function($el, $toggler, options){
        options       = (options) ? options : {};
        options	      = $.extend({}, this.defaults, this.overwrite_default, options);
        delete proto.overwrite_default;

        this.$siteCtn = $(options.siteCtn);

        this.core__construct.call(this, $el, $toggler, options);
    };

    proto.position = function(){
        this.positions = {};
        this.positions.open  = {};
        this.positions.close = {};
        this.positions.site_open  = {};
        this.positions.site_close = {};

        if (this.options.side == "left") {
            this.positions.close.left       = 0;
            this.positions.open.left        = 0;
            this.positions.site_close.left  = 0;
            this.positions.site_open.left   = $(window).width() - this.options.siteOffset;
        } else if (this.options.side == "right") {
            this.positions.close.right 	    = 0;
            this.positions.open.right	    = 0;
            this.positions.site_close.right = 0;
            this.positions.site_open.right  = (-$(window).width()) + this.options.siteOffset;
        }

        this.positions.site_open.ease  = this.options.openEasing;
        this.positions.site_close.ease = this.options.closeEasing;

        if (this.is_opened) {
            this.$el.css(this.positions.open);
            this.$siteCtn.css(this.positions.site_open);
        } else {
            this.$el.css({display:'none'});
            this.$el.css(this.positions.close);
            this.$siteCtn.css(this.positions.site_close);
        }
    };

    proto.toString = function() {
        return "[PanelMe.PushSite]";
    };

    if(window.Me && window.Me.panel) {
        Me.panel.push = PanelMeSitePush;
    }

}(jQuery, window, document));