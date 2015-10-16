obigoApp.createProvider("$template", [function(){
	var T_PREFIX = "$$obigo_";
	var templateInfo = {};
	function set (id, tmplParam){
		id = T_PREFIX + id;

		var tmpl=undefined;
		if(typeof tmplParam === "string"){
			tmpl = document.createElement("template");
			tmpl.setAttribute("id", id);
			tmpl.innerHTML = tmplParam;
			document.body.appendChild(tmpl);
		}else{
			tmpl = tmplParam;
		}
		templateInfo[id] = tmpl;
		

	}
	function get(id){
		id = T_PREFIX + id;
		return templateInfo[id].content.cloneNode(true);
		
	}
	return {
		set:set,
		get:get,
		$run : function(){
			return {
				get:get
			};
		}
	}
}]);
