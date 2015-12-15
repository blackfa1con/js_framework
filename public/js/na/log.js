obigoApp.createProvider("$log", [function(){
	var levels = {
		"error" : 0,
		"warn" : 1,
		"info" : 2,
		"debug" : 3
	}
	var prop = {
		level : "debug",
		show : true
	};
	function _log(level, msg){
		if(prop.show == false || levels[level] > levels[prop.level]){
			return;
		}
		var fileLineNumberRegex = new RegExp('[a-z0-9_]+\.js:[0-9]+', 'gi')
		var stack = new Error().stack;
		var fileArr = stack.match(fileLineNumberRegex);
		var file = fileArr[2];
		var str = "";
		//console.log(file);
		console[level](setPrefix(level, file), msg);
	}
	function setPrefix(level, file){
		var d = new Date();
		var time = d.toISOString();
		time = time.slice(11, 23);
		return time+"\t"+level.toUpperCase()+"\t"+file + "\t---- ";

	}
	return {
		prop : prop,
		fatal: function(msg){
			throw new Error(msg);
		},
		error : function(msg){
			_log("error", msg);
		},
		warn : function(msg){
			_log("warn", msg);
		},
		info: function(msg){
			_log("info", msg);
		},
		debug: function(msg){
			_log("debug", msg);
		},
		$run : function(){
			return {
				fatal: function(msg){
					throw new Error(msg);
				},
				error : function(msg){
					_log("error", msg);
				},
				warn : function(msg){
					_log("warn", msg);
				},
				info: function(msg){
					_log("info", msg);
				},
				debug: function(msg){
					_log("debug", msg);
				}
			}
		}
	}
}]);
