
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
						}
					}
					if(nowPage.onUnload){
						var pageObj = pages[nowPage.name];
						(window.obigoApp.$$runPhase.$$m[pageObj.ctrl].$ctrl[pageObj.onUnload])();
					}
					nowPage = backPage;
					setPageTitle(nowPage.title);
					if(backPage.onShowByBack){
						(window.obigoApp.$$runPhase.$$m[backPage.ctrl].$ctrl[backPage.onShowByBack])();
					}
				}
			}
		};
	}];
	return serviceObj;

}]);
