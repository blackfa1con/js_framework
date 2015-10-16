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
