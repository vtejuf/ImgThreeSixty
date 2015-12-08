
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
		imgPath: '.',

		imgsTotal: (typeof uri !='undefined' && uri.params.imgnum)?Number(uri.params.imgnum):24,
		imgsLoaded: 0,

		container: null,
		scene: null,
		imgcache: null, //图片缓存dom

		autoRotate: false,// l || r || false
		autoRotateSpeed: 0.1, //自转速度 0 ~ 1 超出1就没意义了

		_rotateSpeed: 1, //在容器上滑动的距离 = 图片循环的次数，默认：1 容器的宽度 = 图片loop 1次，影响Render.range

		panSpeed: 1, //平移速度 单位px

		inited: false, //一个实例只能调用1次init

		ctx: null,
		drawPos:{
			x:0,
			y:0,
			w:0,
			y:0
		},
		natruePos : {},
		imgIndex: 0, //当前图片索引
		imgCacheList: {},

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

			type: 'rotate',

			render: function(){}
		},

		init: function(){
			if(this.inited){
				return;
			}
			this.inited = true;

			var scope = this;

			var dom = this.container;

			var scene = document.createElement("canvas");
			scene.className = 'imgthreesixty-scene';
			scene.setAttribute('style','background-color: transparent;position: relative;');
			this.scene = scene;
			this.ctx = scene.getContext('2d');

			// var imgcache = document.createElement("div");
			// imgcache.className = 'imgthreesixty-imgcache';
			// imgcache.setAttribute('style','display:none');
			// this.imgcache = imgcache;

			this._execEvent('beforeLoad');

			this.loadImgs();
			// this.loadImgs( /*imgcache*/ );



			this.initRender(dom);

			this.autoRotateSpeed = this.autoRotateSpeed<0? 0: Number(this.autoRotateSpeed);

			var loadTimeid = 0;
			loadTimeid = setInterval(function(){
				if(scope.imgsLoaded == scope.imgsTotal){
					clearInterval(loadTimeid);

					scope.conutPos(dom);

					dom.appendChild(scene);
					// dom.appendChild(imgcache);

					scope._execEvent('afterLoad');

					scope._initRotate(scene);

					// scope.changeImg(0);

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

				if(this.type == 'rotate'){
					scope.changeImg(this.pos);
				}else if(this.type == 'pan'){
					scope.drawImg();
				}

				this.times--;
			};
		},

		loadImgs: function( /*imgcache*/ ){
			var scope = this;

			for(var i = 0; i < this.imgsTotal; i++){
				var img = document.createElement("img");

				img.onload = function(){
					img = null;
					scope.imgsLoaded++;
					scope._execEvent('progress', {total: scope.imgsTotal, loaded: scope.imgsLoaded});
				};

				img.src = this.imgPath + '/0_' + i + '.jpg';
				this.imgCacheList[i] = img;
				// imgcache.appendChild(img);
			}
		},

		conutPos: function(dom){

			var $container = $(dom);
			var sw = $container.width(),
				sh = $container.height();

			this.scene.setAttribute('width',sw);
			this.scene.setAttribute('height',sh);

			var img = this.imgCacheList[0];

			var hwRate = img.naturalHeight/img.naturalWidth;

			var x = y = w = h = 0;
			if(hwRate < sh/sw){
				//宽度铺满，高度居中
				x=0;
				w=sw;
				h=hwRate*w;
				y=(sh-h)/2;
			}else{
				//高度铺满，宽度居中
				y=0;
				h=sh;
				w=h/hwRate;
				x=(sw-w)/2;
			}

			this.drawPos = {
				x: x,
				y: y,
				w: w,
				h: h
			};

			for(var i in this.drawPos){
				this.natruePos[i] = this.drawPos[i];
			}

		},

		zoom: function(v){
			//v = 1 原始尺寸

			for(var i in this.drawPos){
				this.drawPos[i]
			}

		},

		animate: function(){
			this.stop();
			func.instance = this;
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

		_initRotate: function(scene){
			var scope = this;

			//触摸开始事件
			var x1,y1;

			var panRange={w:0,h:0};
			scene.addEventListener('touchstart',function(e){
				e.preventDefault();
				x1=e.changedTouches[0].pageX;
				y1=e.changedTouches[0].pageY;
				scope.Render.record = 1;
				scope.Render.times = 0;

				panRange.w = (scope.drawPos.w-scope.scene.width)>0?(scope.drawPos.w-scope.scene.width)/scope.scene.width:0;
				panRange.h = (scope.drawPos.h-scope.scene.height)>0? (scope.drawPos.h-scope.scene.height)/scope.scene.height:0;
			 });
			
			//触摸结束事件
			scene.addEventListener('touchend',function(e){
				scope.Render.record = 0;
			});
			//滑动事件		
			scene.addEventListener('touchmove',function(e){

				if(e.changedTouches.length == 1){

					if(scope.Render.type == 'rotate'){

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

					}else if(scope.Render.type=='pan'){
						var x2a= e.changedTouches[0].pageX,
							y2a= e.changedTouches[0].pageY;

						var disx = ~~( x2a - x1 ),
							disy = ~~( y2a - y1 );

							scope.drawPos.x += panRange.w * disx * scope.panSpeed;
							scope.drawPos.y += panRange.h * disy * scope.panSpeed;

							scope.Render.times = 1;

							//border
							if(scope.drawPos.x >= 0){
								scope.drawPos.x = 0;
							}else if(scope.drawPos.x <= scope.scene.width - scope.drawPos.w){
								scope.drawPos.x = scope.scene.width - scope.drawPos.w;
							}
							if(scope.drawPos.y >= 0){
								scope.drawPos.y = 0;
							}else if(scope.drawPos.y <= scope.scene.height - scope.drawPos.h){
								scope.drawPos.y = scope.scene.height - scope.drawPos.h;
							}

							x1 = x2a;
							y1 = y2a;

					}

				}

			});

		},

		zoom: function(v){
			if(v==1){
				this.drawPos.w = this.natruePos.w;
				this.drawPos.h = this.natruePos.h;
				this.drawPos.x = this.natruePos.x;
				this.drawPos.y = this.natruePos.y;
			}else{
				this._zoomCenter(v);
				this.drawPos.w = this.drawPos.w*v;
				this.drawPos.h = this.drawPos.h*v;
			}
			this.changeImg(this.Render.pos);
		},
		_zoomCenter: function(v){
			this.drawPos.x += this.natruePos.w*(1-v)/2;
			this.drawPos.y += this.natruePos.h*(1-v)/2;
		},

			//切换图片
		changeImg : function (pos){
			pos = pos || this.Render.pos;

			this.imgIndex += pos + this.imgsTotal;
			this.imgIndex %= this.imgsTotal;

			this.drawImg();

			// var url = 'url('+this.imgPath + '/0_' + this.imgIndex + '.jpg';+')';
			// this.scene.style.backgroundImage = url
		},

		drawImg: function(){
			var img = this.imgCacheList[this.imgIndex];

			this.ctx.clearRect(0, 0, this.scene.width, this.scene.height);

			this.ctx.drawImage(img, this.drawPos.x, this.drawPos.y, this.drawPos.w, this.drawPos.h);
		},

		_execEvent: function(){
            var args = arguments;
            var etype = Array.prototype.shift.call(args);
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
	ImgThreeSixty.instance.Render.render();
	ImgThreeSixty.animateId = requestAnimationFrame(ImgThreeSixty.animate);
};
ImgThreeSixty.xAnimate = function(){
	ImgThreeSixty.instance = null;
	cancelAnimationFrame(ImgThreeSixty.animateId);
};