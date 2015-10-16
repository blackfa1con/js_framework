obigoApp.createProvider("$progress", function(){
	var loading = new obigo.loading(" ");
	var timer = undefined;
	var showProg = false;
	var prop = {
		timeout : 15000,
		onDefaultTimeout : function(){
			obigo.message({
				title:"No response",
				button:["Close"]
			});
		
		}
	};
	function isShow (){
		return showProg;
	}
	function show (opt){
		opt = opt || {};
		var onTimeout = opt.onTimeout || prop.onDefaultTimeout;
		var text = opt.text || " ";

		if(onTimeout != undefined){
			if(timer != undefined){
				clearTimeout(timer);
			}
			timer = setTimeout(function(){
				hide();
				onTimeout();
			}, prop.timeout);
		}
		loading.changeMsg(text);
		loading.show();
		showProg = true;

	}
	function hide(){
		clearTimeout(timer);
		loading.hide();
		showProg = false;
	}
	
	return {
		prop: prop,
		show: show,
		hide: hide,
		$run:function(){
			return {
				show: show,
				hide: hide,
				isShow : isShow
			};
		}
	}
});
