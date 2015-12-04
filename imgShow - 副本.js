	/*
		使用要求：1，图片命名以1,2,3。。。数字命名。
				  2.多个产品切换，每个产品图片张数要相等。
	*/	
	//初始化，传入图片路径，图片名称，原素id
	function imgRotatoInit(path,name,id){
		var photo=document.createElement("div");		
		photo.setAttribute('style','width:100%;height:100%;background-size: contain; background-repeat: no-repeat;');
		var parent=document.getElementById(id);
		parent.appendChild(photo);
		
		//触摸开始事件
		var x1,x3;
		photo.addEventListener('touchstart',function(e){	
			if(e.targetTouches.length==1){
				rotatoS();
				x1=e.targetTouches[0].pageX;
			}
		 });
		
		//触摸结束事件
		photo.addEventListener('touchend',function(e){
			if(e.changedTouches.length==1){
				x3=e.changedTouches[0].pageX;
				if((x1-x3)>0){//判断手指左滑还是右滑
					rotatoS();
					rotatoL();
				}else{
					rotatoS();
					rotatoR();
				}
			}
		});
		
		//滑动事件		
		photo.addEventListener('touchmove',touchMove);
		var x2b=400;
		function touchMove(e){
			if(e.targetTouches.length==1){
				var x2a= e.changedTouches[0].pageX;
				if((x2b-x2a)>5){//手指移到距离要大于5才触发事件
					var change=changeImg(false);
					change();
				}
				if((x2b-x2a)<-5){
					var change=changeImg(true);
					change();
				}
				x2b=e.changedTouches[0].pageX;
			}
		}

		//预加载图片到浏览器缓存
		(function(){
			var imgcache = document.createElement("div");
			imgcache.className='img-cache';
			imgcache.style.display = 'none';

			for(var i=0;i<47;i++){//<--------------------------------------------------注意：视图片的张数决定循环次数
				var url=path+name+'_'+i+'.jpg';
				var img=document.createElement("img");
				img.src=url;
				imgcache.appendChild(img);
			}

			document.body.appendChild(imgcache);
		})();

		//切换图片
		var cursor=0;
		function changeImg(flag){
			return function(){
				if(flag){
					cursor++;
					if(cursor>47) cursor=0;//<--------------------------------------注意：视图片的张数而定，cursor>图片张数
				}else{
					cursor--;
					if(cursor<0) cursor=47;
				}
				var url=path+name+'_'+cursor+'.jpg';
				photo.style.backgroundImage = 'url('+url+')';
			}
		}
		
		//计时器id
		var intervalId;
		//右转
		function rotatoR(){
			intervalId=setInterval(changeImg(true),100);
		}
		//左转
		function rotatoL(){
			intervalId=setInterval(changeImg(false),100);
		}
		//停转
		function rotatoS(){
			clearInterval(intervalId);
		}

		return {
			stop:function(){
				rotatoS();
			},
			left:function(){
				rotatoL();
			},
			right:function(){
				rotatoR()
			}
		}
	}