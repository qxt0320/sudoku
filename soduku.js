function SD(){
	this.sdArr = [];//生成的数独数组	
	this.errorArr = [];//错误的格子。
	this.blankNum = [];//空白格子数量 
	this.backupSdArr = [];//数独数组备份。
}
SD.prototype={
	constructor:SD,
	init:function(blankNum){
		this.createDoms();
		var beginTime = new Date().getTime();
		this.createSdArr();
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
				this.blankNum = this.setLevel()||blankNum || this.blankNum;		
		this.drawCells();
		this.createBlank(this.blankNum);
		this.createBlankCells();
	},
	reset:function(){
		//重置程序。
		this.errorArr = [];
		$(".sdspan").removeClass('bg_red blankCell');
		var beginTime = new Date().getTime();
		this.createSdArr();
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
		this.blankNum = this.setLevel()||this.blankNum;
		$(".sdspan[contenteditable=true]").prop('contenteditable',false);
		this.drawCells();
		this.createBlank(this.blankNum);
		this.createBlankCells();
	},
	refresh:function(){
		//刷新页面。
		this.errorArr = [];
		$(".sdspan").removeClass('bg_red blankCell');
		var beginTime = new Date().getTime();
		this.createSdArr();
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
		//this.blankNum = this.setLevel()||this.blankNum;
		$(".sdspan[contenteditable=true]").prop('contenteditable',false);
		this.drawCells();
		this.createBlank(this.blankNum);
		this.createBlankCells();
	}, 
	setLevel:function(){
		//用户输入难度。
		var num = prompt("请输入难度（1-5）"); 
		if(!isNaN(num)){
			num = parseInt(num);
			num = num<1?1:num;
			num = num>5?5:num;
		}else{
			num = false;
		}
		return num;
	},
	createSdArr:function(){
		//生成数独数组。
		var that = this;
		try{
			this.sdArr = [];
			this.setThird(2,2);
			this.setThird(5,5);
			this.setThird(8,8); //先预设对角线3个区块的数字,打破数独的对称性,保证唯一解(可解性)
			var allNum = [1,2,3,4,5,6,7,8,9];
			outerfor:
			for(var i=1;i<=9;i++){
				innerfor:
				for(var j=1;j<=9;j++){
					if(this.sdArr[parseInt(i+''+j)]){
						continue innerfor;
					}
					var XArr = this.getXArr(j,this.sdArr);
					var YArr = this.getYArr(i,this.sdArr);
					var thArr = this.getThArr(i,j,this.sdArr);//填每个格子时,获取该格子所在行、列、块的现有数字,计算还能填哪些数字（可解性）
					var arr = getConnect(getConnect(XArr,YArr),thArr);
					var ableArr = arrMinus(allNum,arr);

					if(ableArr.length == 0){
						this.createSdArr();
						return;
						break outerfor;
					}//如果某个格子没有可填数字,就重新生成整个数独(可解性)

					var item;
					//如果生成的重复了就重新生成。
					do{
						item = ableArr[getRandom(ableArr.length)-1];
					}while(($.inArray(item, arr)>-1));

					this.sdArr[parseInt(i+''+j)] = item;//从能填的数字中随机选择一个填入,避免出现多解（可解性）
				}
			}
			this.backupSdArr = this.sdArr.slice();
		}catch(e){
			//如果因为超出浏览器的栈限制出错，就重新运行。
			that.createSdArr();
		}
	},
	getXArr:function(j,sdArr){
		//获取所在行的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(this.sdArr[parseInt(a+""+j)]){
				arr.push(sdArr[parseInt(a+""+j)])
			}
		}
		return arr;
	},
	getYArr:function(i,sdArr){
		//获取所在列的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(sdArr[parseInt(i+''+a)]){
				arr.push(sdArr[parseInt(i+''+a)])
			}
		}
		return arr;
	},
	getThArr:function(i,j,sdArr){
		//获取所在三宫格的值。
		var arr = [];
		var cenNum = this.getTh(i,j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a =0;a<9;a++){
			if(sdArr[thIndexArr[a]]){
				arr.push(sdArr[thIndexArr[a]]);
			}
		}
		return arr;
	},
	getTh:function(i,j){
		//获取所在三宫格的中间位坐标。
		var cenArr = [22,52,82,25,55,85,28,58,88];
		var index = (Math.ceil(j/3)-1) * 3 +Math.ceil(i/3) -1;
		var cenNum = cenArr[index];
		return cenNum;
	},
	setThird:function(i,j){
		//为对角线上的三个三宫格随机生成。
		var numArr = [1,2,3,4,5,6,7,8,9];
		var sortedNumArr= numArr.sort(function(){return Math.random()-0.5>0?-1:1});
		var cenNum = parseInt(i+''+j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a=0;a<9;a++){
			this.sdArr[thIndexArr[a]] = sortedNumArr[a];
		}
	},
	drawCells:function(){
		//将生成的数组填写到九宫格
		for(var j =1;j<=9;j++){
			for(var i =1;i<=9;i++){					
				$(".sdli").eq(j-1).find(".sdspan").eq(i-1).html(this.sdArr[parseInt(i+''+j)]);
			}
		}
	},
	createBlank:function(num){
		//生成指定数量的空白格子的坐标。
		var blankArr = [];
		var numArr = [1,2,3,4,5,6,7,8,9];
		var item;
		for(var a =0;a<20+num*10;a++){
			do{
				item = parseInt(numArr[getRandom(9) -1] +''+ numArr[getRandom(9) -1]);
			}while($.inArray(item, blankArr)>-1);
			blankArr.push(item);
		}
		this.blankArr = blankArr;
	},
	createBlankCells:function(){
		//在创建好的数独中去除一部分格子的值，给用户自己填写。把对应格子变成可编辑,并添加事件。
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom;

		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			dom.attr('contenteditable', false).html('').addClass('blankCell');		
			this.backupSdArr[blankArr[i]] = undefined;
		}

		$(".sdspan[contenteditable=flase]").keyup(function(event) {
			var val = $(this).html();			
			var reStr = /^[1-9]{1}$/;
			if(!reStr.test(val)){
				$(this).html('');
			};
		});
	},
	createDoms:function(){
		//生成九宫格。
		var html='<ul class="sd clearfix">';
		String.prototype.times = String.prototype.times || function(n) { return (new Array(n+1)).join(this);}; 
		html = html + ('<li class="sdli">'+'<span class="sdspan"></span>'.times(9) +'</li>').times(9)+'</ul>';
		$("body").prepend(html);

		for(var k=0;k<9;k++){
			$(".sdli:eq("+k+") .sdspan").eq(2).addClass('br');
			$(".sdli:eq("+k+") .sdspan").eq(5).addClass('br');
			$(".sdli:eq("+k+") .sdspan").eq(3).addClass('bl');
			$(".sdli:eq("+k+") .sdspan").eq(6).addClass('bl');
		}
		$(".sdli:eq(2) .sdspan,.sdli:eq(5) .sdspan").addClass('bb');
		$(".sdli:eq(3) .sdspan,.sdli:eq(6) .sdspan").addClass('bt');
	}
}

//生成随机正整数
function getRandom(n){
	return Math.floor(Math.random()*n+1)
}

//两个简单数组的并集。
function getConnect(arr1,arr2){
	var i,len = arr1.length,resArr = arr2.slice();
	for(i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}

//两个简单数组差集，arr1为大数组
function　arrMinus(arr1,arr2){
	var resArr = [],len = arr1.length;
	for(var i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}

let sudokus = [];
// 生成数独数组并存储到 sudokus 数组中
async function generateSudokus() {
	let promises = [];
	for (let i = 0; i < 9; i++) {
	  let sd = new SD();
	  promises.push(new Promise(resolve => {
		sd.init();
		resolve(sd);
	  }));
	}
	sudokus = await Promise.all(promises);
	return sudokus
  }
  generateSudokus().then(sudokus => {
	for (let i = 0; i < sudokus.length-1; i++) { // 循环前8个数独数组
	  console.log(sudokus[i].sdArr); // 打印生成的数独
	}
  });

  function startGame() {
	window.location.href = 'soduku.html';
}

