
if(typeof window.requestAnimationFrame == 'undefined'){

    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] 
                                    || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if(!window.requestAnimationFrame){
        window.requestAnimationFrame = function(event){
            return setTimeout(function(){
                event();
            },1000/24);
        };
        window.cancelAnimationFrame = function(id){
            clearTimeout( id );
        }
    }
}

/**
 * 图片全景 360°
 */
function ImgThreeSixty(){
	var func = window.ImgThreeSixty;

	var ImgThreeSixty = {
		root: '.',
		pro_name: '',
		imgsTotal: 48,
		imgsLoaded: 0,

		container: null,
		scene: null,
		imgcache: null, //图片缓存dom

		autoRotate: false,// l || r || false
		autoRotateSpeed: 0.4, //自转速度 0 ~ 1 超出1就没意义了

		_rotateSpeed: 1, //在容器上滑动的距离 = 图片循环的次数，默认：1 容器的宽度 = 图片loop 1次，影响Render.range

		inited: false, //一个实例只能调用1次init

		imgIndex: 0, //当前图片索引

		/**
		 * 渲染器
		 */
		Render:{
			range:0, //移动多少距离，图片切换  scene.width/imgsTotal 
			record:0,
			frame: 24,
			pos:1,
			times:0,
			id:0,

			render: function(){}
		},

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

			this.initRender(dom);

			this.autoRotateSpeed = this.autoRotateSpeed<0? 0: Number(this.autoRotateSpeed);

			var loadTimeid = 0;
			loadTimeid = setInterval(function(){
				if(this.imgsLoaded == this.imgsTotal){
					clearInterval(loadTimeid);

					dom.appendChild(scene);
					dom.appendChild(imgcache);

					scope._execEvent('afterLoad');

					scope._initRotate(scene, pro_name);

					scope.changeImg(1);

					if(scope.autoRotate){
						scope.animate();
					}
				}
			},100);
		},

		initRender: function(dom){
			var scope = this;

			if(scope.autoRotate && typeof scope.autoRotate == 'string'){
				scope.Render.pos = scope.autoRotate.toLowerCase()=='l'?1:-1;
			}

			scope.Render.range = Math.floor( $(dom).width() / this.imgsTotal / scope._rotateSpeed );

			scope.Render.render = function(){

				if(scope.autoRotate){
					this.times += scope.autoRotateSpeed;
					scope._execEvent('autoRotate');
				}

				if(~~this.times == 0){
					return;
				}

				scope.changeImg(this.pos);
				this.times--;
			};
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

		animate: function(){
			this.stop();
			func.instance = this.Render;
			func.animate();
		},

		xAnimate: function(){
			this.stop();
			func.xAnimate();
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
			this.Render.times = 0;
		},

		_initRotate: function(scene, pro_name){
			var scope = this;

			//触摸开始事件
			var x1,x3;
			scene.addEventListener('touchstart',function(e){
				e.preventDefault();
				x1=e.changedTouches[0].pageX;
				scope.Render.record = 1;
			 });
			
			//触摸结束事件
			scene.addEventListener('touchend',function(e){
				scope.Render.record = 0;
			});
			//滑动事件		
			scene.addEventListener('touchmove',function(e){
				var x2a= e.changedTouches[0].pageX;
				var dis = ~~( x2a - x1 ),
					disAbs = Math.abs(dis);

				var pos = dis/disAbs;


				if(pos != scope.Render.pos){
					scope.Render.pos *= -1;
					scope.Render.times = 0;
				}

				if(disAbs >= scope.Render.range){
					scope.Render.times += ~~(disAbs/scope.Render.range);
					x1 = x2a;
				}

			});

		},
			//切换图片
		changeImg : function (pos){
			this.imgIndex += pos + this.imgsTotal;
			this.imgIndex %= this.imgsTotal;
			this.scene.style.backgroundImage = 'url('+this.root + '/' + this.pro_name + '/0_' + this.imgIndex + '.jpg';+')';
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
			'afterLoad':[],
			'autoRotate': []
		}


	};

	Object.defineProperties(ImgThreeSixty, {
        rotateSpeed:{
            enumerable: true,
            set: function(spd){
            	this.Render.range = Math.floor( this.scene.clientWidth / this.imgsTotal / spd );
                this._rotateSpeed = spd;
            },
            get: function(){
                return this._rotateSpeed;
            }
        }
    });

	return ImgThreeSixty;
}
ImgThreeSixty.instance = null;
ImgThreeSixty.animateId = 0;
ImgThreeSixty.animate = function(){
	if(!ImgThreeSixty.instance){
		ImgThreeSixty.xAnimate();
		return ;
	}
	ImgThreeSixty.instance.render();
	ImgThreeSixty.animateId = requestAnimationFrame(ImgThreeSixty.animate);
};
ImgThreeSixty.xAnimate = function(){
	ImgThreeSixty.instance = null;
	cancelAnimationFrame(ImgThreeSixty.animateId);
};