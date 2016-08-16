// Canvas, onde o jogo será desenhado
var canvas = null;

// Contexto do canvas, será usado para efetuar o desenho no canvas
var ctx = null;

// Sprite usados no jogo
var spritesheet = null;

// Matriz bidimensional que representa o labirinto
var maze = [[]];

// Tamanho do labirinto
var mazeWidth = 18;
var mazeHeight = 18;

// Tamanho de cada um dos tiles do sprite
var tileWidth = 32;
var tileHeight = 32;

// start and end of path
var pathStart = [mazeWidth,mazeHeight];
var pathEnd = [0,0];
var currentPath = [];

// Quando a pagina for carregada
function onload()
{
	canvas = document.getElementById('gameCanvas');

	// define o tamanho do labirinto
	canvas.width = mazeWidth * tileWidth;
	canvas.height = mazeHeight * tileHeight;

	ctx = canvas.getContext("2d");

	spritesheet = new Image();
	spritesheet.src = 'spritesheet.png';
	spritesheet.onload = loaded;
}

function loaded()
{
	createmaze();
}


// Essa função deve ser trocada pela geração randomica
// fill the maze with walls
function createmaze()
{
	// create emptiness
	for (var x=0; x < mazeWidth; x++)
	{
		maze[x] = [];

		for (var y=0; y < mazeHeight; y++)
		{
			maze[x][y] = 0;
		}
	}

	// scatter some walls
	for (var x=0; x < mazeWidth; x++)
	{
		for (var y=0; y < mazeHeight; y++)
		{
			if (Math.random() > 0.75)
			maze[x][y] = 1;
		}
	}

	maze[0][0] = 0;
	maze[17][17] = 0;

	// calculate initial possible path
	// note: unlikely but possible to never find one...
	currentPath = [];
	while (currentPath.length == 0)
	{
		//pathStart = [Math.floor(Math.random()*mazeWidth),Math.floor(Math.random()*mazeHeight)];
		pathStart = [0,0];
		pathEnd = [17,17];
		//pathEnd = [Math.floor(Math.random()*mazeWidth),Math.floor(Math.random()*mazeHeight)];
		if (maze[pathStart[0]][pathStart[1]] == 0)
		currentPath = findPath(maze,pathStart,pathEnd);
	}
	drawMaze();

}

function drawMaze()
{
	var spriteNum = 0;

	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (var x=0; x < mazeWidth; x++)
	{
		for (var y=0; y < mazeHeight; y++)
		{
			// seleciona o sprite para desenhar
			switch(maze[x][y])
			{
			case 1:
				spriteNum = 1;
				break;
			default:
				spriteNum = 0;
				break;
			}
			ctx.drawImage(spritesheet, spriteNum*tileWidth, 0, tileWidth, tileHeight, x*tileWidth, y*tileHeight, tileWidth, tileHeight);
		}
	}

	for (rp=0; rp<currentPath.length; rp++)
	{
		switch(rp)
		{
		case 0:
			spriteNum = 2; // start
			break;
		case currentPath.length-1:
			spriteNum = 3; // end
			break;
		default:
			spriteNum = 4; // path node
			break;
		}

		ctx.drawImage(spritesheet,
		spriteNum*tileWidth, 0,
		tileWidth, tileHeight,
		currentPath[rp][0]*tileWidth,
		currentPath[rp][1]*tileHeight,
		tileWidth, tileHeight);
	}		
}

function findPath(maze, pathStart, pathEnd)
{
	// shortcuts for speed
	var	abs = Math.abs;
	var	max = Math.max;
	var	pow = Math.pow;
	var	sqrt = Math.sqrt;

	// the maze data are integers:
	// anything higher than this number is considered blocked
	// this is handy is you use numbered sprites, more than one
	// of which is walkable road, grass, mud, etc
	var maxWalkableTileNum = 0;

	// keep track of the maze dimensions
    // Note that this A-star implementation expects the maze array to be square: 
	// it must have equal height and width. If your game maze is rectangular, 
	// just fill the array with dummy values to pad the empty space.
	var mazeWidth = maze[0].length;
	var mazeHeight = maze.length;
	var mazeSize =	mazeWidth * mazeHeight;

	// which heuristic should we use?
	// default: no diagonals (Manhattan)
	var distanceFunction = ManhattanDistance;
	var findNeighbours = function(){}; // empty

	/*

	// alternate heuristics, depending on your game:

	// diagonals allowed but no sqeezing through cracks:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighbours;

	// diagonals and squeezing through cracks allowed:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighboursFree;

	// euclidean but no squeezing through cracks:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighbours;

	// euclidean and squeezing through cracks allowed:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighboursFree;

	*/

	// distanceFunction functions
	// these return how far away a point is to another

	function ManhattanDistance(Point, Goal)
	{	// linear movement - no diagonals - just cardinal directions (NSEW)
		return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
	}

	function DiagonalDistance(Point, Goal)
	{	// diagonal movement - assumes diag dist is 1, same as cardinals
		return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
	}

	function EuclideanDistance(Point, Goal)
	{	// diagonals are considered a little farther than cardinal directions
		// diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
		// where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
		return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
	}

	// Neighbours functions, used by findNeighbours function
	// to locate adjacent available cells that aren't blocked

	// Returns every available North, South, East or West
	// cell that is empty. No diagonals,
	// unless distanceFunction function is not Manhattan
	function Neighbours(x, y)
	{
		var	N = y - 1,
		S = y + 1,
		E = x + 1,
		W = x - 1,
		myN = N > -1 && canWalkHere(x, N),
		myS = S < mazeHeight && canWalkHere(x, S),
		myE = E < mazeWidth && canWalkHere(E, y),
		myW = W > -1 && canWalkHere(W, y),
		result = [];
		if(myN)
		result.push({x:x, y:N});
		if(myE)
		result.push({x:E, y:y});
		if(myS)
		result.push({x:x, y:S});
		if(myW)
		result.push({x:W, y:y});
		findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
		return result;
	}

	// returns every available North East, South East,
	// South West or North West cell - no squeezing through
	// "cracks" between two diagonals
	function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
	{
		if(myN)
		{
			if(myE && canWalkHere(E, N))
			result.push({x:E, y:N});
			if(myW && canWalkHere(W, N))
			result.push({x:W, y:N});
		}
		if(myS)
		{
			if(myE && canWalkHere(E, S))
			result.push({x:E, y:S});EuclideanDistance
			if(myW && canWalkHere(W, S))
			result.push({x:W, y:S});
		}
	}

	// returns every available North East, South East,
	// South West or North West cell including the times that
	// you would be squeezing through a "crack"
	function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result)
	{
		myN = N > -1;
		myS = S < mazeHeight;
		myE = E < mazeWidth;
		myW = W > -1;
		if(myE)
		{
			if(myN && canWalkHere(E, N))
			result.push({x:E, y:N});
			if(myS && canWalkHere(E, S))
			result.push({x:E, y:S});
		}
		if(myW)
		{
			if(myN && canWalkHere(W, N))
			result.push({x:W, y:N});
			if(myS && canWalkHere(W, S))
			result.push({x:W, y:S});
		}
	}

	// returns boolean value (maze cell is available and open)
	function canWalkHere(x, y)
	{
		return ((maze[x] != null) &&
			(maze[x][y] != null) &&
			(maze[x][y] <= maxWalkableTileNum));
	};

	// Node function, returns a new object with Node properties
	// Used in the calculatePath function to store route costs, etc.
	function Node(Parent, Point)
	{
		var newNode = {
			// pointer to another Node object
			Parent:Parent,
			// array index of this Node in the maze linear array
			value:Point.x + (Point.y * mazeWidth),
			// the location coordinates of this Node
			x:Point.x,
			y:Point.y,
			// the heuristic estimated cost
			// of an entire path using this node
			f:0,
			// the distanceFunction cost to get
			// from the starting point to this node
			g:0
		};

		return newNode;
	}

	// Path function, executes AStar algorithm operations
	function calculatePath()
	{
		// create Nodes from the Start and End x,y coordinates
		var	mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
		var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
		// create an array that will contain all maze cells
		var AStar = new Array(mazeSize);
		// list of currently open Nodes
		var Open = [mypathStart];
		// list of closed Nodes
		var Closed = [];
		// list of the final output array
		var result = [];
		// reference to a Node (that is nearby)
		var myNeighbours;
		// reference to a Node (that we are considering now)
		var myNode;
		// reference to a Node (that starts a path in question)
		var myPath;
		// temp integer variables used in the calculations
		var length, max, min, i, j;
		// iterate through the open list until none are left
		while(length = Open.length)
		{
			max = mazeSize;
			min = -1;
			for(i = 0; i < length; i++)
			{
				if(Open[i].f < max)
				{
					max = Open[i].f;
					min = i;
				}
			}
			// grab the next node and remove it from Open array
			myNode = Open.splice(min, 1)[0];
			// is it the destination node?
			if(myNode.value === mypathEnd.value)
			{
				myPath = Closed[Closed.push(myNode) - 1];
				do
				{
					result.push([myPath.x, myPath.y]);
				}
				while (myPath = myPath.Parent);
				// clear the working arrays
				AStar = Closed = Open = [];
				// we want to return start to finish
				result.reverse();
			}
			else // not the destination
			{
				// find which nearby nodes are walkable
				myNeighbours = Neighbours(myNode.x, myNode.y);
				// test each one that hasn't been tried already
				for(i = 0, j = myNeighbours.length; i < j; i++)
				{
					myPath = Node(myNode, myNeighbours[i]);
					if (!AStar[myPath.value])
					{
						// estimated cost of this particular route so far
						myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
						// estimated cost of entire guessed route to the destination
						myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
						// remember this new path for testing above
						Open.push(myPath);
						// mark this node in the maze graph as visited
						AStar[myPath.value] = true;
					}
				}
				// remember this route as having no more untested options
				Closed.push(myNode);
			}
		} // keep iterating until the Open list is empty
		return result;
	}

	// actually calculate the a-star path!
	// this returns an array of coordinates
	// that is empty if no path is possible
	return calculatePath();

}

