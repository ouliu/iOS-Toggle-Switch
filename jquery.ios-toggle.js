/**
 * @author Alexander Farkas
 * v. 1.22
 */
(function($) {
	if(!document.defaultView || !document.defaultView.getComputedStyle){ // IE6-IE8
		var oldCurCSS = $.curCSS;
		$.curCSS = function(elem, name, force){
			if(name === 'background-position'){
				name = 'backgroundPosition';
			}
			if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
				return oldCurCSS.apply(this, arguments);
			}
			var style = elem.style;
			if ( !force && style && style[ name ] ){
				return style[ name ];
			}
			return oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force);
		};
	}
	
	var oldAnim = $.fn.animate;
	$.fn.animate = function(prop){
		if('background-position' in prop){
			prop.backgroundPosition = prop['background-position'];
			delete prop['background-position'];
		}
		if('backgroundPosition' in prop){
			prop.backgroundPosition = '('+ prop.backgroundPosition;
		}
		return oldAnim.apply(this, arguments);
	};
	
	function toArray(strg){
		strg = strg.replace(/left|top/g,'0px');
		strg = strg.replace(/right|bottom/g,'100%');
		strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
		var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
		return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
	}
	
	$.fx.step. backgroundPosition = function(fx) {
		if (!fx.bgPosReady) {
			var start = $.curCSS(fx.elem,'backgroundPosition');
			if(!start){//FF2 no inline-style fallback
				start = '0px 0px';
			}
			
			start = toArray(start);
			fx.start = [start[0],start[2]];
			var end = toArray(fx.end);
			fx.end = [end[0],end[2]];
			
			fx.unit = [end[1],end[3]];
			fx.bgPosReady = true;
		}
		//return;
		var nowPosX = [];
		nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
		nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];           
		fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];

	};
})(jQuery);

$.fn.extend({
	toggleSwitch : function(options){

		if(typeof(options) == 'string')
		{
			var method = $.fn.toggleSwitch.fn[options];
			if(typeof(method) == 'function') return method(this);
		}
		

		var config = $.fn.toggleSwitch.configuration;
		var settings = $.extend($.fn.toggleSwitch.defaults, options);

		$(this).each(function(e){
			var self = $(this);

			var cfg = self.hasClass('small') ? config.small : config.big;

			var input = $(this).prop('rel');
			var value = $(this).hasClass('off') ? settings.off : settings.on;
			input = $('<input type="hidden" name="'+input+'" value="'+value+'" />').appendTo(self);
			var toggle = function(){ self.toggleClass('on'); };

			self.click(function(e){
				if(input.val() == 'on'){
					self.css({'background-position': cfg.fakeOn});
					self.animate({ backgroundPosition : cfg.fakeOff },
						settings.speed, function(){
							toggle();
							self.css({'background-position': cfg.off});
						});
					input.val(settings.off);
					self.trigger('off');
				}
				else{
					self.css({'background-position': cfg.fakeOff});
					self.animate({ backgroundPosition : cfg.fakeOn },
						settings.speed, function(){
							toggle();
							self.css({'background-position': cfg.on});
						});
					self.css({'background-position': cfg.on});
					input.val(settings.on);
					self.trigger('on');
				}
				self.trigger('change');
			});
		});
	}
});

$.fn.toggleSwitch.defaults = { on : 'on', off : 'off', speed : 200 };
$.fn.toggleSwitch.configuration = 
{
	big : {
		on : "0px -31px", off : '0px -62px',
		fakeOn : "0px 0px", fakeOff : '-60px 0px'},
	small : {
		on : "0px -110px", off : '0px -127px',
		fakeOn : "0px -93px", fakeOff : '-30px -93px'}
};
$.fn.toggleSwitch.fn = {
	val : function(el){
	      return $(el).find('input[name='+$(el).prop('rel')+']').val();
	}
};
