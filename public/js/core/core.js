//obigoApp init//////////////////////////////
var PROVIDER_SUFFIX="Provider";
var RUN_MODULE_NAME="$$commonM";
var ATTR = {
	ELEM : "ob-elem",
	TITLE : "ob-title",
	CTRL : "ob-ctrl",
	CLICK : "ob-click",
	LIST : "ob-list",
}
var reservedName = {
	"$$initM" : "$$initM",
	"$$commonM" : "$$commonM"
}
var obigoApp={};


obigoApp.$$initPhase = {
	$$m:{},
	$$injectable:{}
};
obigoApp.$$runPhase = {
	$$m:{},
	$$injectable:{}
};
function chkDupModule(name, type){
	if(reservedName[name] != undefined ){
		throw new Error("Cannot use '"+name+"' name. it is reserved.");
		return
	}
	if(obigoApp.$$initPhase.$$m[name] || obigoApp.$$runPhase.$$m[name]){
		throw new Error('Already exist module : '+name);
		return;
	}
}
function makeModule (construct){
	var obj = {};
	if(typeof construct === "function"){
		obj.$$con = construct;
		obj.$$inject = [];
	}else if(construct.constructor === Array){
		if(construct.length == 1){
			obj.$$con = construct[0];
			obj.$$inject = [];
		}else{
			obj.$$con = construct[construct.length -1];
			obj.$$inject = construct.slice(0, construct.length-1);
		}
	}
	return obj;
}
obigoApp.createController = function(name, construct){
	var type="controller";
	chkDupModule(name, type);
	obigoApp.$$runPhase.$$m[name] = makeModule(construct);
	obigoApp.$$runPhase.$$m[name].type=type;
	return this;
};
obigoApp.createFactory = function(name, construct){
	var type="factory";
	chkDupModule(name, type);
	obigoApp.$$runPhase.$$m[name] = makeModule(construct);
	obigoApp.$$runPhase.$$m[name].type=type;
	obigoApp.$$runPhase.$$injectable[name] = obigoApp.$$runPhase.$$m[name].$$con;
	return this;
};
obigoApp.createProvider= function(name, construct){
	var type="provider";
	chkDupModule(name, type);
	name += PROVIDER_SUFFIX;
	obigoApp.$$initPhase.$$m[name] = makeModule(construct);
	obigoApp.$$initPhase.$$m[name].type=type;
	obigoApp.$$initPhase.$$injectable[name] = obigoApp.$$initPhase.$$m[name].$$con;
	return this;
};

obigoApp.init = function(construct){
	var name = reservedName["$$initM"];
	var type = "init";
	if(obigoApp.$$initPhase.$$m[name]){
		throw new Error('Already exist : init');
	}
	obigoApp.$$initPhase.$$m[name] = makeModule(construct);
	obigoApp.$$initPhase.$$m[name].type=type;
	return this;
};
obigoApp.common = function(construct){
	var name = reservedName["$$commonM"];
	var type = "common";
	if(obigoApp.$$runPhase.$$m[name]){
		throw new Error('Already exist : common');
	}
	obigoApp.$$runPhase.$$m[name] = makeModule(construct);
	obigoApp.$$runPhase.$$m[name].type=type;
	return this;
};
function makePhase(phase){
	var initOrder = [];
	for(var name in phase.$$m){
		var module = phase.$$m[name];
		if(module.$$inject.length == 0){
			var arr = [];
			arr.push(name);
			arr.push(undefined);		//dummy inject
			initOrder.push(arr);
		}else{
			for(var i=0;i<module.$$inject.length;i++){
				var arr = [];
				arr.push(name);
				arr.push(module.$$inject[i]);
				initOrder.push(arr);
			}
		}
		
	}
	var moduleTopos = toposort(uniqueNodes(initOrder), initOrder);
	var mIdx = moduleTopos.length-1

	for(;mIdx>=0;mIdx--){
		var name = moduleTopos[mIdx];
		if(!phase.$$m[name]){
			continue;
		}
		var injectLen = phase.$$m[name].$$inject.length;
		var params = [];
	
		for(var i=0;i<injectLen;i++){
			var moduleName = phase.$$m[name].$$inject[i];
			if( moduleName == "$ctrl"){
				phase.$$m[name].$ctrl={};
				params.push(phase.$$m[name].$ctrl);
			}else {
				if(phase.$$injectable[moduleName]){
					params.push(phase.$$injectable[moduleName]);

				}else{
					throw new Error('there is no module : '+moduleName);
				}
			}
		}
		
		if(phase.$$m[name].type=="provider"){
			phase.$$injectable[name]=phase.$$m[name].$$con=(phase.$$m[name].$$con).apply(phase.$$m[name], params);

			if(phase.$$m[name].$$con.$run){
				obigoApp.createFactory(name.substring(0, name.length-PROVIDER_SUFFIX.length), phase.$$m[name].$$con.$run);
			}else{
				throw new Error("Provider have to define '$run' property : "+name);
			}

		}else if(phase.$$m[name].type=="factory"){
			phase.$$injectable[name]=phase.$$m[name].$$con=(phase.$$m[name].$$con).apply(phase.$$m[name], params);
		}else if(phase.$$m[name].type=="controller"){
			(phase.$$m[name].$$con).apply(phase.$$m[name], params);

			bind(phase.$$m[name], document.querySelector("*["+ATTR.CTRL+"="+name+"]"));
		}else{
			(phase.$$m[name].$$con).apply(phase.$$m[name], params);
		}
	}
}

