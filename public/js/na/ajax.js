obigoApp.createProvider("$ajax", [function(){
	var prop = {
		timeout : 25000
	};
	return {
		prop : prop,
		$run : ["$promise", function($promise){
			function req(option){

				var opt = {
					success: undefined,
					error: undefined,
					method : "GET",
					url: "",
					header : {},
					timeout : prop.timeout
				}
				for (var key in option){
					opt[key] = option[key];
				}

				return $promise.p(function(resolve, reject){
					obigo.ajax({
						url : opt.url,
						type : opt.method,
						timeout : opt.timeout,
						requestHeader : opt.header,
						success : function(){
							var arg = {
								response : arguments[0],
								status : arguments[1],
								xhr: arguments[2]
							};
							if(isFunction(opt.success)){
								opt.success(arg);
							}else{
								resolve(arg);
							}
						},
						error : function(){
							var arg = {
								xhr: arguments[0],
								response: arguments[1],
								status: arguments[2]
							};
							if(isFunction(opt.error)){
								opt.error(arg);
							}else{
								reject(arg);
							}
						}
						
					});
				});
			}
			return {
				req :req 
			};
		}]
	}
}]);
