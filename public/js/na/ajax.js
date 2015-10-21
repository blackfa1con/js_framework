obigoApp.createProvider("$ajax", [function(){
	var prop = {
		timeout : 25000
	};
	return {
		prop : prop,
		$run : [function(){
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

				obigo.ajax({
					url : opt.url,
					type : opt.method,
					timeout : opt.timeout,
					requestHeader : opt.header,
					success : function(){
						if(isFunction(opt.success)){
							opt.success.apply(this, arguments);
						}
					},
					error : function(){
						if(isFunction(opt.error)){
							opt.error.apply(this, arguments);
						}
					}
					
				});
			}
			return {
				req :req 
			};
		}]
	}
}]);
