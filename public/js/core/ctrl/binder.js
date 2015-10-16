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
