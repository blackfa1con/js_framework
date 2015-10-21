/*
obigoApp - v0.1.16
release date : 2015-10-21 

Copyright (C) OBIGO Ltd., 2015.
All rights reserved.

This software is covered by the license agreement between
the end user and OBIGO Ltd., and may be
used and copied only in accordance with the terms of the
said agreement.

OBIGO Ltd. assumes no responsibility or
liability for any errors or inaccuracies in this software,
or any consequential, incidental or indirect damage arising
out of the use of the software
*/
 ////////////topological sort for dependency relation/////////////////////
function toposort(nodes, edges) {
	var cursor = nodes.length
		, sorted = new Array(cursor)
		, visited = {}
		, i = cursor

		while (i--) {
			if (!visited[i]) visit(nodes[i], i, [])
		}

		return sorted

		function visit(node, i, predecessors) {
			if(predecessors.indexOf(node) >= 0) {
				throw new Error('Cyclic dependency: '+JSON.stringify(node))
			}

			if (visited[i]) return;
			visited[i] = true

				// outgoing edges
				var outgoing = edges.filter(function(edge){
					return edge[0] === node
				})
			if (i = outgoing.length) {
				var preds = predecessors.concat(node)
					do {
						var child = outgoing[--i][1]
							visit(child, nodes.indexOf(child), preds)
					} while (i)
			}

			sorted[--cursor] = node
		}
}

function uniqueNodes(arr){
	var res = []
	for (var i = 0, len = arr.length; i < len; i++) {
		var edge = arr[i]
			if (res.indexOf(edge[0]) < 0) res.push(edge[0])
				if (res.indexOf(edge[1]) < 0) res.push(edge[1])
	}
	return res
}
//////////////////////////////////////////////////////

function isFunction(o){
	return typeof o === 'function';
}



/*
 * bind events in elements
 *
 */
function bind(ctrlObj, targetElem){
	clickBinder(ctrlObj, targetElem);
	
}

function clickBinder(ctrlObj, targetElem){
	var clickElem = targetElem.querySelectorAll("*["+ATTR.CLICK+"]");
	var i = clickElem.length - 1;
	while(0<=i){
		if(!isFunction(ctrlObj.$ctrl[clickElem[i].attributes[ATTR.CLICK].value])){
			throw new Error(clickElem[i].attributes[ATTR.CLICK].value + " is not a defined function");
		}
		(function(idx){
			new ButtonHelper({
				evtTarget : clickElem[idx], 
				cssName :"active",
				callback : function(evt, target){
					(ctrlObj.$ctrl[clickElem[idx].attributes[ATTR.CLICK].value])(evt, target);
				}
			});
		})(i);
		i--;
	}
}

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

obigoApp.createProvider ("$elem", [function(){
	var elemObj= {};
	var css = {
		disable : "dis"
	}
	var i =0;
	var elems = document.querySelectorAll("*["+ATTR.ELEM+"]");
	var ElemProto = function(elem){
		var elemObj = {};
		elemObj.o = elem;
		elemObj.hide = function(){
			this.o.style.display = "none";
		};
		elemObj.show = function(){
			this.o.style.display = "block";
		};
		elemObj.setText = function(str){
			this.o.textContent = str;
		};
		elemObj.setWidth = function(val){
			this.o.style.width = val;
		};
		elemObj.setHeight = function(val){
			this.o.style.height= val;
		};
		elemObj.setDisable = function(){
			this.o.classList.add(css.disable);
			this.o.style.pointerEvents = "none";

		};
		elemObj.setEnable = function(){
			this.o.classList.remove(css.disable);
			this.o.style.pointerEvents = "auto";
		};
		return elemObj;
	};
	i = elems.length-1;
	while( 0 <= i){
		//elems[i].prototype = proto;
		elemObj[elems[i].attributes[ATTR.ELEM].value] = ElemProto(elems[i]);
		i--;
	}




	return{
		prop: {
			e:elemObj,
			wrap : ElemProto,
			css : css
		},
		$run:function(){
			return {
				e : elemObj,
				wrap : ElemProto

			};
		}
	}
}]);

obigoApp.createProvider ("$list", ["$templateProvider", function($tp){
	var listObj = {};
	var i =0;

	var listProto = function(listElem){
		var listObj = {};
		listObj.o = listElem;
		listObj.update = function(opt){

			var existItemLen = this.o.children.length;

			if(existItemLen == 0){
				for(var i = 0;i<opt.listItem.length;i++){
					var tmpl = $tp.get(this.id);
					opt.callback(i, opt.listItem[i], tmpl.firstElementChild);
					this.o.appendChild(tmpl);
				}
			}else{
				var existIdx = 0;
				var newIdx = 0;
				for(newIdx =0;newIdx<opt.listItem.length && existIdx < existItemLen; newIdx++, existIdx++){
					var oldE = this.o.children[existIdx];
					var newE = $tp.get(this.id).firstElementChild;
					//opt.callback(newIdx, opt.listItem[newIdx], this.o.children[existIdx]);	
					opt.callback(newIdx, opt.listItem[newIdx], newE);	
					oldE.parentNode.replaceChild(newE, oldE);
				}
				if(newIdx == opt.listItem.length){		//new list <= exist list
						//remove remain items
					while(this.o.children[newIdx-1].nextElementSibling){
						this.o.removeChild(this.o.children[newIdx-1].nextElementSibling);
					}
				}else{					//new list > exist list
					for(var i=newIdx ; i<opt.listItem.length;i++){
						var tmpl = $tp.get(this.id);
						opt.callback(i, opt.listItem[i], tmpl.firstElementChild);
						this.o.appendChild(tmpl);
					}
				}
			}

		}
		return listObj;

	}

	var lists = document.querySelectorAll("*["+ATTR.LIST+"]");
	i = lists.length-1;
	while( 0 <= i){
		var tmpl = undefined;
		var key = lists[i].attributes[ATTR.LIST].value;
		listObj[key] = listProto(lists[i]);
		tmpl = lists[i].querySelector("template");
		if(tmpl){
			var id = "list_"+key+"_"+((new Date()).getTime());
			$tp.set(id, tmpl);
			listObj[key].template = tmpl;
			listObj[key].id = id;
			lists[i].innerHTML = "";
			
		}else{
			throw new Error("'ob-list' must have a template element.");
		}
		i--;
	}


	return{
		/*
		prop: {
			l:listObj,
		},
		*/
		$run:function(){
			return {
				l:listObj,
			};
		}
	}
}]);

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
		console[level](setPrefix(level, file)+msg);
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


obigoApp.createProvider ("$pager", ["$elemProvider", function($ep){
	var pages = {},
	pagesByCtrl = {},
	pageStack = [],
	lastPages = {},
	nowPage=undefined,
	offCallback = undefined;

	var serviceObj = {};
	var titleElem = document.querySelector("*["+ATTR.TITLE+"]");

	var setPageTitle = function(str){
		if(str == undefined){
			str = "";
		}
		try{
			titleElem.innerHTML = str;
			nowPage.title = str;
		}catch(e){
		}
	};

	//get ctrl elements///////////////////////////
	var ctrlList = document.querySelectorAll("*["+ATTR.CTRL+"]");
	var ctrlObj = {};
	var i = ctrlList.length - 1;
	while(0<=i){
		ctrlObj[ctrlList[i].attributes[ATTR.CTRL].value] = $ep.prop.wrap(ctrlList[i]);
		i--;
	}
	////////////////////////////////////////////////


	serviceObj.createPage = function(opt){

		if(opt.ctrl){
			if(ctrlObj[opt.ctrl]){
				opt.elem = ctrlObj[opt.ctrl];
				pagesByCtrl[opt.ctrl]=opt;
			}else{
				throw new Error('Controller is not defined : '+opt.ctrl);
			}
		}
		

		pages[opt.name] = opt;
		if(opt.initPage == true){
			pages[opt.name].elem.show();
			nowPage = pages[opt.name];
			setPageTitle(nowPage.title);
		}else{
			pages[opt.name].elem.hide();
		}

		if(opt.lastPage == true){
			lastPages[opt.name]=true;
		}
		return serviceObj;
	};
	serviceObj.setOffCallback = function(callback){
		offCallback = callback;
	};
	serviceObj.$run = [function(){
		return {
			getCurrentPage : function(){
				return nowPage.name;
			},
			getPageTitle : function(){
				return titleElem.innerHTML;
			},
			setPageTitle : setPageTitle,
			go : function(page, info){
				setTimeout(function(){
					var param, title;
					if(info != undefined){
						param = info.param || undefined;
						title = info.title || "";
					}
					if(nowPage != pages[page]){
						for(var key in pages){
							if(key != page){
								pages[key].elem.hide();
							}else{
								pages[key].elem.show();
							}
						}
						for(var i =0;i<pageStack.length;i++){
							if(pageStack[i].name == nowPage.name){
								pageStack.splice(i, pageStack.length);
								break;
							}
						}

						if(!nowPage.noHistory){
							pageStack.push(nowPage);
						}

						if(nowPage.onUnload){
							(window.obigoApp.$$runPhase.$$m[nowPage.ctrl].$ctrl[nowPage.onUnload])();
						}

						nowPage = pages[page];
					}
					if((title == "" || title == undefined) && pages[page].title){
						setPageTitle(pages[page].title);
					}else if(title != "" && title != undefined){
						setPageTitle(title);

					}
					
					if(pages[page].onLoad){
						(window.obigoApp.$$runPhase.$$m[pages[page].ctrl].$ctrl[pages[page].onLoad])(param);
					}
				}, 0);
			},
			back : function(){
				var backPage = pageStack.pop();
				if(lastPages[nowPage.name] == true  || backPage == undefined){
					if(offCallback != undefined){
						offCallback();
					}
					AppManager.back();
				}else{
					for(var key in pages){
						if(key != backPage.name){
							pages[key].elem.hide();
						}else{
							pages[key].elem.show();
							if(pages[key].onShowByBack){
								(window.obigoApp.$$runPhase.$$m[pages[key].ctrl].$ctrl[pages[key].onShowByBack])();
							}
						}
					}
					if(nowPage.onUnload){
						var pageObj = pages[nowPage.name];
						(window.obigoApp.$$runPhase.$$m[pageObj.ctrl].$ctrl[pageObj.onUnload])();
					}
					nowPage = backPage;
					setPageTitle(nowPage.title);
				}
			}
		};
	}];
	return serviceObj;

}]);

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

obigoApp.createProvider("$promise", [function(){
	var prop = {
	};
	return {
		prop : prop,
		$run : function(){
			return {
			};
		}
	}
}]);

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

window.addEventListener("load", function(e){
	makePhase(obigoApp.$$initPhase);
	makePhase(obigoApp.$$runPhase);
});
window.obigoApp = obigoApp;

