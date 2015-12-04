	/*
		使用要求：1，图片命名以1,2,3。。。数字命名。
				  2.多个产品切换，每个产品图片张数要相等。
	*/	
	//初始化，传入图片路径，图片名称，原素id
	
function ImgThreeSixty(){

	var ImgThreeSixty = {
		root: '.',
		pro_name: '',
		imgsTotal: 48,
		imgsLoaded: 0,

		container: null,
		scene: null,
		imgcache: null,

		autoRotate: true,

		rotateTimeid: 0,
		inited: false,

		imgIndex: 0,

		init: function(pro_name, dom){
			if(this.inited){
				return;
			}
			this.inited = true;

			var scope = this;

			this.pro_name = pro_name;
			this.container = dom;

			var scene = document.createElement("div");
			scene.className = 'imgthreesixty-scene';
			scene.setAttribute('style','width:100%;height:100%;background-size: contain; background-repeat: no-repeat;');
			this.scene = scene;

			var imgcache = document.createElement("div");
			imgcache.className = 'imgthreesixty-imgcache';
			imgcache.setAttribute('style','display:none');
			this.imgcache = imgcache;

			this._execEvent('beforeLoad');

			this.loadImgs(pro_name, imgcache);


			var loadTimeid = 0;
			loadTimeid = setInterval(function(){
				if(this.imgsLoaded == this.imgsTotal){
					clearInterval(loadTimeid);

					dom.appendChild(scene);
					dom.appendChild(imgcache);

					scope._execEvent('afterLoad');

					scope._initRotate(scene, pro_name);

					scope.changeImg(1);
				}
			},100);
		},

		loadImgs: function(pro_name, imgcache){
			var scope = this;

			for(var i = 0; i < this.imgsTotal; i++){
				var img = document.createElement("img");

				img.onload = function(){
					img = null;
					scope.imgsLoaded++;
					scope._execEvent('progress', {total: scope.imgsTotal, loaded: scope.imgsLoaded});
				};

				img.src = this.root + '/' + pro_name + '/0_' + i + '.jpg';
				imgcache.appendChild(img);
			}
		},

		on: function(etype, func){
			this._events[etype].push(func);
            return this;
		},
        off: function(etype, func){
            var funclist = this._events[etype];
            funclist.forEach(function(f){
                if(f===func){
                    var findex = funclist.indexOf(f);
                    funclist = funclist.splice(findex,1);
                }
            });
            return this;
        },

		stop:function(){
			this._rotateR();
		},
		left:function(){
			this._rotateL();
		},
		right:function(){
			this._rotateS()
		},

		_initRotate: function(scene, pro_name){
			var scope = this;

			//触摸开始事件
			var x1,x3;
			scene.addEventListener('touchstart',function(e){
				if(e.changedTouches.length==1){
					scope._rotateS();
					x1=e.changedTouches[0].pageX;
				}
			 });
			
			//触摸结束事件
			scene.addEventListener('touchend',function(e){
				// e.preventDefault();
				// return false;
				if(e.changedTouches.length==1){
					x3=e.changedTouches[0].pageX;
					if((x1-x3)>0){//判断手指左滑还是右滑
						scope._rotateS();
						scope._rotateL();
					}else{
						scope._rotateS();
						scope._rotateR();
					}
				}
			});
			//滑动事件		
			scene.addEventListener('touchmove',touchMove);
			var x2b=400;
			function touchMove(e){
				if(e.changedTouches.length==1){
					var x2a= e.changedTouches[0].pageX;
					if((x2b-x2a)>5){//手指移到距离要大于5才触发事件
						scope.changeImg(-1);
					}
					if((x2b-x2a)<-5){
						scope.changeImg(1);
					}
					x2b=e.changedTouches[0].pageX;
				}
			}

		},
			//切换图片
		changeImg : function (pos){
			this.imgIndex += pos+48;
			this.imgIndex %= 48;
			this.scene.style.backgroundImage = 'url('+this.root + '/' + this.pro_name + '/0_' + this.imgIndex + '.jpg';+')';
		},

		_rotateR: function(){
			var scope = this;
			this.rotateTimeid=setInterval(function(){
				scope.changeImg(1);
			},100);
		},
		_rotateL: function(){
			var scope = this;
			this.rotateTimeid=setInterval(function(){
				scope.changeImg(-1);
			},100);
		},
		_rotateS: function(){
			clearInterval(this.rotateTimeid);
		},

		_execEvent: function(){
            var args = arguments;
            etype = Array.prototype.shift.call(args);
            this._events[etype].forEach(function(func){
                try{
                    setTimeout(function(){
                        func.apply(null, args);
                    },0);
                }catch(e){}
            });
		},

		_events: {
			'beforeLoad':[],
			'progress': [],
			'afterLoad':[]
		}


	};

	return ImgThreeSixty;
}

	
	// function imgRotatoInit(path,name,dom){
	// 	var photo=document.createElement("div");
	// 	photo.setAttribute('style','width:100%;height:100%;background-size: contain; background-repeat: no-repeat;');
	// 	dom.appendChild(photo);
		
	// 	//触摸开始事件
	// 	var x1,x3;
	// 	photo.addEventListener('touchstart',function(e){	
	// 		if(e.targetTouches.length==1){
	// 			rotatoS();
	// 			x1=e.targetTouches[0].pageX;
	// 		}
	// 	 });
		
	// 	//触摸结束事件
	// 	photo.addEventListener('touchend',function(e){
	// 		if(e.changedTouches.length==1){
	// 			x3=e.changedTouches[0].pageX;
	// 			if((x1-x3)>0){//判断手指左滑还是右滑
	// 				rotatoS();
	// 				rotatoL();
	// 			}else{
	// 				rotatoS();
	// 				rotatoR();
	// 			}
	// 		}
	// 	});
		
	// 	//滑动事件		
	// 	photo.addEventListener('touchmove',touchMove);
	// 	var x2b=400;
	// 	function touchMove(e){
	// 		if(e.targetTouches.length==1){
	// 			var x2a= e.changedTouches[0].pageX;
	// 			if((x2b-x2a)>5){//手指移到距离要大于5才触发事件
	// 				var change=changeImg(false);
	// 				change();
	// 			}
	// 			if((x2b-x2a)<-5){
	// 				var change=changeImg(true);
	// 				change();
	// 			}
	// 			x2b=e.changedTouches[0].pageX;
	// 		}
	// 	}

	// 	//预加载图片到浏览器缓存
	// 	(function(){
	// 		var imgcache = document.createElement("div");
	// 		imgcache.className='img-cache';
	// 		imgcache.style.display = 'none';

	// 		for(var i=0;i<47;i++){//<--------------------------------------------------注意：视图片的张数决定循环次数
	// 			var url=path+name+'_'+i+'.jpg';
	// 			var img=document.createElement("img");
	// 			img.src=url;
	// 			imgcache.appendChild(img);
	// 		}

	// 		document.body.appendChild(imgcache);
	// 	})();

	// 	//切换图片
	// 	var cursor=0;
	// 	function changeImg(flag){
	// 		return function(){
	// 			if(flag){
	// 				cursor++;
	// 				if(cursor>47) cursor=0;//<--------------------------------------注意：视图片的张数而定，cursor>图片张数
	// 			}else{
	// 				cursor--;
	// 				if(cursor<0) cursor=47;
	// 			}
	// 			var url=path+name+'_'+cursor+'.jpg';
	// 			photo.style.backgroundImage = 'url('+url+')';
	// 		}
	// 	}
		
	// 	//计时器id
	// 	var intervalId;
	// 	//右转
	// 	function rotatoR(){
	// 		intervalId=setInterval(changeImg(true),100);
	// 	}
	// 	//左转
	// 	function rotatoL(){
	// 		intervalId=setInterval(changeImg(false),100);
	// 	}
	// 	//停转
	// 	function rotatoS(){
	// 		clearInterval(intervalId);
	// 	}

	// 	return {
	// 		stop:function(){
	// 			rotatoS();
	// 		},
	// 		left:function(){
	// 			rotatoL();
	// 		},
	// 		right:function(){
	// 			rotatoR()
	// 		}
	// 	}
	// }