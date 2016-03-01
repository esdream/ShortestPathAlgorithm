

//使用全局变量来给不同的函数传递参数
var dataMatrix;   
var globalH;
var globalW;

//起点和终点方格下标值
var startGridX;
var startGridY;
var endGridX;
var endGridY;

var isMouseDown = false; //监听整个系统的鼠标按下状态

$(document).ready(function(){
	setInfoDiv();
	createStartPointAndEndPoint();
	
	$("#createGrid").on("click",DrawGrid);

	// $("#createPoint").on('click',createPointSAE);
	$("#clearPath").on('click',clearPathOver);
	$('#clearBlock').on('click',clearBlockOver);

	$("#createPath").on('click',executionTime);
	
})

// function printData() {
// 	console.log($(dataMatrix[1][1]).data('block')+','+globalH+','+globalW);
// }

//选择使用的算法
function selectAlgorithm() {
	if($('#algorithmOption').val() === 'Astar') {
		initAStar();
	}
	if($('#algorithmOption').val() === 'BFS') {
		BFS();
	}
}

//计算程序运行的时间
function executionTime() {
	var startTime = new Date().getTime();
	selectAlgorithm();
	//BFS();
	var endTime = new Date().getTime();
	var exetime = endTime - startTime;
	$('#executionTime').text(exetime + 'ms');
}

//设置初始窗口的一些属性
function setInfoDiv() {
	$('#info1').draggable();
	$('#info2').draggable();
	$('#result').draggable();
}

//创建起点和终点
function createStartPointAndEndPoint() {
	var startLeft = $('#startDiv').css('left');
	var startTop = $('#startDiv').css('top');
	// console.log(typeof(startLeft));

	var endLeft = $('#endDiv').css('left');
	var endTop = $('#endDiv').css('top');
	// console.log(endLeft+','+endTop);
	
	$("#startDiv").draggable();
	$("#endDiv").draggable();

	$('#startDiv').data('point','startGrid');
	$('#endDiv').data('point','endGrid');

	$('#startDiv').draggable({
		stop: function(event,ui) {
			$('#startDiv').css({
				left: startLeft,
				top: startTop
			});
		}
	});

	$('#endDiv').draggable({
		stop: function(event,ui) {
			$('#endDiv').css({
				left: endLeft,
				top: endTop
			});
		}
	});
}

//清除生成的路径
function clearPathOver() {
	$("#container").children().removeClass('pathTrace');
	// $("#container").children().removeClass('startPoint');
	// $("#container").children().removeClass('endPoint');
}

//清除所有障碍
function clearBlockOver() {
	$('#container').children('.showGrid').data('block', true);
	$('#container').children('.showGrid').removeClass('blockClass');
}

function DrawGrid() {
	$("#Grid").remove();
	$("#container").remove();
	
	// $("#canvas").children('container').remove();
	// $("#canvas").children('Grid').remove();

	var w,h;  //从输入框获得迷宫的宽与高
	w = parseInt($("#mazex").val()) + 2;
	h = parseInt($("#mazey").val()) + 2;

	//var GridLength = 50;  //网格大小
	var GridLength = 20;

	var container = '<div id="container"></div>';
	$("#canvas").append(container);

	var GridWidth = w*GridLength + "px";
	var GridHeight = h*GridLength + "px";
	var topMargin = parseInt($("#canvas").css('height'))/2-parseInt(GridHeight)/2+"px";
	var leftMargin = parseInt($("#canvas").css('width'))/2-parseInt(GridWidth)/2+"px";
	
	// alert(topMargin+","+leftMargin);

	$("#container").css({
		width: GridWidth,
		height: GridHeight
	});

	var i,j;
	var Grid = '<div class="Grid"></div>';
	for (i = 0; i < h ; i++) {
		for (j = 0; j < w ; j++) {
			//$("#container").append(Grid);
			Grid += '<div class="Grid"></div>';
			// $('#container .Grid').last().text('j='+j);
		};
	}
	$('#container').append(Grid);

	//获取container下所有类为Grid的子元素
	var GridNum = $("#container").children('.Grid');
	// console.log(GridNum[8]);

	//将GridNum对象数组映射为矩阵，方便在算法中处理
	var matrix = new Array();
	for (i = 0; i < h; i++) {
		matrix[i] = new Array();

		for (j = 0; j < w; j++) {
			matrix[i][j] = GridNum[w*i+j];

			$(matrix[i][j]).data('i', i);
			$(matrix[i][j]).data('j', j);

			if(i == 0 || j == 0 || i == (h-1) || j == (w-1)) {
				$(matrix[i][j]).data('block', false);   //false表示不能通行，为了方便现将最外一圈方格设为不能通行
				$(matrix[i][j]).addClass('hiddenGrid');

			}
			else {
				$(matrix[i][j]).data('block', true);  //true表示可以通行
				$(matrix[i][j]).data('isChange',false); //表示本次按下后是否已经改变
				$(matrix[i][j]).addClass('showGrid');

				$(matrix[i][j]).on('mousemove',BlockToggle);  //给每个格子添加障碍开关
				
				// $(matrix[i][j]).on('click',BlockToggle);

				$(matrix[i][j]).droppable();
				$(matrix[i][j]).on('drop',function(event,ui){
					if(ui.draggable.data('point') == 'startGrid') {
						$('.Grid').removeClass('startPoint');
						$(this).addClass('startPoint');

						startGridX = $(this).data('i');
						startGridY = $(this).data('j');
						// console.log($(this).data('i')+','+typeof($(this).data('i'))+','+$(this).data('j')+typeof($(this).data('i')));
					}
					else if(ui.draggable.data('point') == 'endGrid') {
						$('.Grid').removeClass('endPoint');
						$(this).addClass('endPoint');

						endGridX = $(this).data('i');
						endGridY = $(this).data('j');
					}
				});
			}

			// console.log($(matrix[i][j]).data("block"));
		}
	}
	
	// console.log(matrix);
	DrawBlock(matrix,h,w);

	// createStartAndEndPoint(matrix,h,w);
	// console.log(matrix);
	dataMatrix = matrix;
	globalH = h;
	globalW = w;
	//返回dataMatrix用来保存矩阵信息方便算法使用

}

function DrawBlock(m,h,w) {   //将最外圈方格元素处理为block方便算法计算
	var i,j;
	for (i = 0; i < h; i++) {
		for (j = 0; j < w; j++) {
			if($(m[i][j]).data('block') == false) {
				$(m[i][j]).addClass('blockClass');
			}
		}
	}
}

function BlockToggle() {  //交互式操作，单击使该格子状态变更成block或取消block
	mouseDownChange();
	if(isMouseDown == true && $(this).data('isChange') == false) {
		if($(this).data('block') == false) {
			$(this).data('block', true);
			$(this).removeClass('blockClass');
			$(this).data('isChange', true);

		}
		else if($(this).data('block') == true) {
			$(this).data('block', false);
			$(this).addClass('blockClass');
			$(this).data('isChange', true);
		}
	}
}

function DropToggleOfStartPoint() {
	$(this).addClass('startPoint');
}

function DropToggleOfStartPoint() {
	$(this).addClass('endPoint');
}

//监听鼠标按下状态并更新isMouseDown的函数
function mouseDownChange() {
	$(this).on('mousedown',function(){
		isMouseDown = true;
		$('.Gird').data('isChange', false);
	});
	$(this).on('mouseup',function(){
		isMouseDown = false;
		$('.Gird').data('isChange', false);
	});
}

// function createStartAndEndPoint(m,h,w) {
// 	console.log(h+','+w);
// 	var startLocationX = parseInt(w/2 - 1);
// 	var startLocationY = parseInt(h/2);//parseInt((h-1)/2);
// 	var endLocationX = startLocationX+2;//parseInt((w-1)/2 + 1);
// 	var endLocationY = startLocationY;//parseInt((h-1)/2);
		

// 	// $(m[startLocationX][startLocationY]).addClass('startPoint');
// 	// $(m[endLocationY][endLocationX]).addClass('endPoint');
// }


//广度优先搜索算法
function BFS() {
	// var maze = new Array();
	var x = 0,y = 0; //x,y用于path，表示path[n]的坐标
	var i,j; //i,j用于m和visited，表示需要操作的象元下标（也就是在二维数组中的坐标）
	
	//迷宫
	var m = dataMatrix;
	var row = globalH, col = globalW;  //迷宫大小

	// var x_start = parseInt($("#startX").val());   //起点x
	// var y_start = parseInt($("#startY").val());   //起点y
	// $(m[x_start][y_start]).addClass('startPoint');
	// var x_end = parseInt($("#endX").val());  //终点x
	// var y_end = parseInt($("#endY").val());  //终点y
	// $(m[x_end][y_end]).addClass('endPoint');

	var x_start = startGridX;
	var y_start = startGridY;
	var x_end = endGridX;
	var y_end = endGridY;

	// $("#startY").focusout(function(event) {
	// 	m[x_start][y_start].addClass('startPoint');
	// 	/* Act on the event */
	// });

	// $("#endY").focusout(function(event) {
	// 	m[x_end][y_end].addClass('endPoint');
	// 	/* Act on the event */
	// });

	var k;

	var visited = new Array();
	for (i = 0;i < row;i++) {
		visited[i] = new Array();
		for ( j = 0; j < col; j++) {
			visited[i][j] = false;
		};
	}

	//创建move对象数组，用来遍历当前点周围八个格子
	function Move(){
		// this.a = 0;
		// this.b = 0;
		// this.d = 0;
	}

	var move = new Array();

	for(var i = 0;i<8;i++) {
		move[i] = new Move();
		if(i%2 == 0) {
			move[i].d = 1;
		}
		else {
			move[i].d = 2;
		}
	}

	move[0].a = -1,move[0].b = 0;
	move[1].a = -1,move[1].b = 1;
	move[2].a = 0,move[2].b = 1;
	move[3].a = 1,move[3].b = 1;
	move[4].a = 1,move[4].b = 0;
	move[5].a = 1,move[5].b = -1;
	move[6].a = 0,move[6].b = -1;
	move[7].a = -1,move[7].b = -1;

	function Path(x,y,pre) {   //记录遍历时经过的每一个格子和该格子的上一个点
		this.x = x;
		this.y = y;
		this.pre = pre;
	}

	var path = new Array();
	var dist = new Array();

	//将起点加入path
	path[0] = new Path(x_start,y_start,-1);
	// path[0].pre = -1;
	// path[0].x = x_start;
	// path[0].y = y_start;

	visited[x_start][y_start] = true;

	var front = 0;
	var rear = 1;  
	while(front < rear) { //当队列不为空时，执行循环。查找路径并将节点加入到队列中

		//出队
		x = path[front].x;  
		y = path[front].y;

		// console.log(path[front].x+","+path[front].y);

		for(var v = 0;v < 8;v++) { 	//在八个方向上寻找可通行且未被访问的点
			i = x + move[v].a;
			j = y + move[v].b;

			//判别角对角穿墙
			var crossCorner = true;

			if(v%2 == 1) {
				var blockPrei;
				var blockPrej;
				var blockAfteri;
				var blockAfterj;
				if(v != 7) {
					blockPrei = x + move[v-1].a;
					blockPrej = y + move[v-1].b;

					blockAfteri = x + move[v+1].a;
					blockAfterj = y + move[v+1].b;
				}
				else if( v == 7) {
					blockPrei = x + move[v-1].a;
					blockPrej = y + move[v-1].b;

					blockAfteri = x + move[0].a;
					blockAfterj = y + move[0].b;
				}
				
				if($(m[blockPrei][blockPrej]).data('block') == false && $(m[blockAfteri][blockAfterj]).data('block') == false ) {
					crossCorner = false;
				}
			}

			// console.log($(m[i][j]).data('block')+','+visited[i][j]+','+crossCorner);

			//判定并加入路径
			if($(m[i][j]).data('block') == true && visited[i][j] == false  && crossCorner == true) {

				path[rear] = new Path(i,j,front);
				
				// path[rear].x = i;
				// path[rear].y = j;
				// path[rear].pre = front;
				
				// console.log(path[rear].x+','+path[rear].y+',front:'+path[rear].pre);

				visited[i][j] = 1;
				rear++;
			}
			if(i == x_end && j == y_end) {
				var k = rear - 1;
				while(path[k] != -1) {
					var u,v;
					if(k == -1) {
						return;
					}
					u = path[k].x;
					v = path[k].y;
					$(m[u][v]).addClass('pathTrace');  //显示生成的路径

					k=path[k].pre;
				}

				return;
			}
		}
		front++;
	}

	alert("没有可以通过的路径");

}



function printGrid(matrix, row, col) {
	for(var i = 0;i < row;i++) {
		console.log('\n');
		for(var j = 0;j<col;j++) {
			console.log(matrix[i][j]+',');
		}
	}
}


//A*算法
var openList = []; //开启列表，存入节点Node
var closeList = [];  //关闭列表
var COST_STRAIGHT = 10; //垂直方向或水平方向移动的路径评分
var COST_DIAGONAL = 14;
var row = globalH; //行
var column = globalW; //列
var map = dataMatrix;


function setMap() {
	map = dataMatrix;
	row = globalH;
	column = globalW;
}

//从起点(x1,y1)查找目标(x2,y2),(-1:错误，0:没找到; 1：找到了)
function search1(x1,y1,x2,y2) {
	setMap();

	if(x1<0||x1>=row||x2<0||x2>=row||y1<0||y1>=column||y2<0||y2>=column) {
		return -1;
	}
	if($(map[x1][y1]).data('block') == false ||$(map[x2][y2]).data('block') == false ){
		return -1;
	}
	var sNode = new Node(x1,y1,null); //起点
	var eNode = new Node(x2,y2,null); //终点

	openList.push(sNode);
	var resultList = search(sNode,eNode);
	if(resultList.length == 0){
		return 0;
	}
	for (var i = 0; i < resultList.length; i++) {
		$(map[resultList[i].getX()][resultList[i].getY()]).data('path', 'yes');
	}
	return 1;
}

//查找核心算法
function search(sNode,eNode) {
	var resultList = [];
	var isFind = false;
	var node = null;
	while(openList.length>0) {
		//取出开启列表中最低F值，即第一个存储的值的F为最低的
		node = openList[0];

		//判断是否找到目标点
		if(node.getX()==eNode.getX()&&node.getY()==eNode.getY()) {
			isFind = true;
			break;
		}

		//上
		if((node.getY()-1)>=0){  
			node.searchPos = 0;
        	checkPath(node.getX(),node.getY()-1,node, eNode, node.searchPos, COST_STRAIGHT);  
        }  
            
        //下  
        if((node.getY()+1)<column){  
        	node.searchPos = 4;
        	checkPath(node.getX(),node.getY()+1,node, eNode, node.searchPos, COST_STRAIGHT);  
        }                                   
               
        //左  
        if((node.getX()-1)>=0){  
        	node.searchPos = 6;
        	checkPath(node.getX()-1,node.getY(),node, eNode, node.searchPos, COST_STRAIGHT);  
        }  
  
        //右  
        if((node.getX()+1)<row){ 
        	node.searchPos = 2; 
        	checkPath(node.getX()+1,node.getY(),node, eNode, node.searchPos, COST_STRAIGHT);  
        }  
          
        //左上  
        if((node.getX()-1)>=0&&(node.getY()-1)>=0){  
        	node.searchPos = 7;
        	checkPath(node.getX()-1,node.getY()-1,node, eNode, node.searchPos, COST_DIAGONAL);  
        }  
        
        //右上
        if((node.getX()-1)>=0&&(node.getY()+1)<column){ 
        	node.searchPos = 1;
        	checkPath(node.getX()-1,node.getY()+1,node, eNode, node.searchPos, COST_DIAGONAL);  
        }  
              
        //左下
        if((node.getX()+1)<row&&(node.getY()-1)>=0){ 
        	node.searchPos = 5; 
        	checkPath(node.getX()+1,node.getY()-1,node, eNode, node.searchPos, COST_DIAGONAL);  
        }  
      
        //右下  
        if((node.getX()+1)<row&&(node.getY()+1)<column){  
        	node.searchPos = 3;
        	checkPath(node.getX()+1,node.getY()+1,node, eNode, node.searchPos, COST_DIAGONAL);  
        }

        //从开启列表中删除
        //添加到关闭列表中
        closeList.push(openList.shift());

        //开启列表中排序，把F值最低的放到最底端
        openList.sort(compare); 
	}
	if(isFind) {
		getPath(resultList,node);
	}
	return resultList;
}

//查询此路(x,y)是否能走通
function checkPath(x,y,parentNode,eNode,searchPos,cost) {

	setMap();
	var node = new Node(x,y,parentNode,searchPos);
	//查找地图中是否能通过
	if($(map[x][y]).data('block') === false){
		closeList.push(node);
		return false;
	}

	//查找关闭列表中是否存在
	if(isListContains(closeList, x, y)!=-1) {
		return false;
	}

	//检查是否穿墙
	switch(node.searchPos) {
		case 1:
			if($(map[(x+1)][y]).data('block') == false && $(map[x][(y-1)]).data('block') == false) {
				// console.log(map[(x+1)][y],map[x][(y-1)]);
				return false;
			}
			break;
		case 3:
			if($(map[(x-1)][y]).data('block') == false && $(map[x][(y-1)]).data('block') == false) {
				// console.log(map[(x-1)][y],map[x][(y-1)]);
				return false;
			}
			break;
		case 5:
			if($(map[(x-1)][y]).data('block') == false && $(map[x][(y+1)]).data('block') == false) {
				// console.log(map[(x-1)][y],map[x][(y+1)]);
				return false;
			}
			break;
		case 7:
			if($(map[(x+1)][y]).data('block') == false && $(map[x][(y+1)]).data('block') == false) {
				// console.log(map[(x+1)][y],map[x][(y+1)]);
				return false;
			}
			break;
	}

	//查找开启列表中是否存在
	var index = -1;
	index = isListContains(openList,x,y);
	if(index != -1) {  //如果存在，比较从父节点到这个点的G值和其本身的G值，如果从父节点经过的G值小于其本身的G值，重新计算node的G，F值，并更新这个node
		if((parentNode.getG()+cost)<openList[index].getG()){
			node.setParentNode(parentNode);
			countG(node, eNode, cost);
			countF(node);
			openList[index] = node;
		}
	}
	else {
		//如果不存在，计算node的F,G,H值，添加到开启列表中
		node.setParentNode(parentNode);
		count(node,eNode,cost);
		openList.push(node);

	}
	return true;
}

//集合中是否包含某个元素(-1:没有找到，否则返回所在的索引)
function isListContains(list,x,y) {
	var i, node;
	for(i=0;i<list.length;i++) {
		node = list[i];
		if(node.getX()==x && node.getY()==y) {
			return i;
		}
	}
	return -1;
}

//从终点往返到起点
function getPath(resultList, node) {
	if(node.getParentNode()!=null) {
		getPath(resultList, node.getParentNode());
	}
	console.log(node.getX()+','+node.getY());
	resultList.push(node);
}

//计算G,H,F值
function count(node, eNode, cost) {
	countG(node, eNode, cost);
	countH(node, eNode);
	countF(node);
}

//计算G值
function countG(node, eNode, cost) {
	if(node.getParentNode() == null) {
		node.setG(cost);
	}
	else {
		node.setG(node.getParentNode().getG()+cost);
	}
}
//计算H值
function countH(node, eNode) {
	node.setF(Math.abs(node.getX()-eNode.getX())+Math.abs(node.getX()-eNode.getX())*10);
}
//计算F值
function countF(node) {
	node.setF(node.getG()+node.getH());
}

//节点类
function Node(x,y,parentNode,searchPos) {
	this.x = x;
	this.y = y;
	this.parentNode = parentNode; //父节点
	this.searchPos = searchPos;  //在某一次搜寻中,这个点相对于父节点所处的位置 0表示上，按顺时针0-7表示对应的点

	this.g = 0; //当前点到起点的移动耗费
	this.h = 0;	//当前点到终点的移动耗费，即曼哈顿距离
	this.f = 0; //f=g+h
}

Node.prototype.getX = function() {
	return this.x;
}
Node.prototype.setX = function(x) {
	this.x = x;
}
Node.prototype.getY = function() {
	return this.y;
}
Node.prototype.setY = function(y) {
	this.y = y;
}
Node.prototype.getParentNode = function() {
	return this.parentNode;
}
Node.prototype.setParentNode = function(parentNode) {
	this.parentNode = parentNode;
}
Node.prototype.getG = function() {
	return this.g;
}
Node.prototype.setG = function(g) {
	this.g = g;
}
Node.prototype.getH = function() {
	return this.h;
}
Node.prototype.setH = function(h) {
	this.h = h;
}
Node.prototype.getF = function() {
	return this.f;
}
Node.prototype.setF = function(f) {
	this.f = f;
}
Node.prototype.toString = function() {
	return '('+this.x+','+this.y+','+this.f+')';
}
//节点比较类
function compare(o1,o2) {
	return o1.getF()-o2.getF();
}

function initAStar() {

	setMap();

	var startX = startGridX;
	var startY= startGridY;
	var endX = endGridX;
	var endY = endGridY;
	var flag = search1(startGridX,startGridY,endGridX,endGridY);
	if(flag == -1) {
		alert('传输数据有误！');
	}
	else if(flag == 0) {
		alert('没找到');
	}
	else {
		for(var x = 0;x < row;x++) {
			for(var y = 0;y< column;y++) {
				if($(map[x][y]).data('path') === 'yes') {
					$(map[x][y]).addClass('pathTrace');
				}
			}
		}
	}
}

function showCloseList() {
	for(i=0;i<closeList.length;i++){
		// console.log(closeList[i].getX()+','+closeList[i].getY());
	}
}

function showOpenList() {
	for(i=0;i<openList.length;i++){
		console.log("O--"+openList[i].toString());
	}
}