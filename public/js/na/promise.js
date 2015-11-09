obigoApp.createProvider("$promise", [function(){
	var prop = {
	};
	return {
		prop : prop,
		$run : function(){
			function all(pArr){
				return Promise.all(pArr);
			}
			function p(work){
				return new Promise(function(resolve, reject){
					work(resolve, reject);
				});
			}
			return {
				p: p,
				all : all
				
			};
		}
	}
}]);
