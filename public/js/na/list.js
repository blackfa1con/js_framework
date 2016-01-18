obigoApp.createProvider ("$list", ["$templateProvider", function($tp){
	var listObj = {};
	var i =0;

	var listProto = function(listElem){
		var listObj = {};
		listObj.o = listElem;
		listObj.update = function(opt){
			var newContainer = document.createElement(this.o.tagName);
			


			var attrs = this.o.attributes;
			for(var i = 0;i<attrs.length;i++){
				newContainer.setAttribute(attrs[i].nodeName, attrs[i].nodeValue);
			}

			var listStr = "";
			for(var i = 0;i<opt.listItem.length;i++){
				var tmpl;
				if(opt.tmplId){
					tmpl = $tp.get(opt.tmplId);
				}else{
					tmpl = $tp.get(this.id);
				}
				opt.callback(i, opt.listItem[i], tmpl.firstElementChild);
			//	listStr += tmpl.firstElementChild.outerHTML;
				newContainer.appendChild(tmpl);
			}
			var parentNode = this.o.parentNode; 
			parentNode.replaceChild(newContainer, this.o);
			parentNode.appendChild(newContainer);
			this.o = newContainer;


			/*
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
			*/

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
