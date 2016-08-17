// Trabalho de IA
// Problema: Labirinto
// Eguipe 4: Felipe Gustavo de Souza Gomes e Rafael Sandes Silva
//
// Canvas, onde o jogo será desenhado
var canvas = null;

// Contexto do canvas, será usado para efetuar o desenho no canvas
var ctx = null;

// Sprite usado no jogo
var sprites = null;

// Tamanho do labirinto
var mazeW = 16;
var mazeH = 16;

// Tamanho de cada um dos tiles do sprite
var tileW = 32;
var tileH = 32;

// Define o espaço em que podemos andar
var walkableSpace = 0;

// Define o tamnaho máximo do labirinto
var mazeSize =	mazeW * mazeH;

// Define o inicio e fim do labirinto
var pathStart = [0,0];
var pathEnd = [15,15];
var currentPath = [];

// Matriz bidimensional que representa o labirinto
var maze = [[]];

// Setada para falsa quando o DFS encontrar a solução
var continueDFS = true;

// Reseta o labirinto
function resetMaze()
{
	maze[0] = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	maze[1] = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
	maze[2] = [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1];
	maze[3] = [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1];
	maze[4] = [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1];
	maze[5] = [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1];
	maze[6] = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1];
	maze[7] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1];
	maze[8] = [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1];
	maze[9] = [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
	maze[10] = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1];
	maze[11] = [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1];
	maze[12] = [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1];
	maze[13] = [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1];
	maze[14] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0];
	maze[15] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0];	
}


// Quando a pagina for carregada essa função é chamada
function onload()
{
	canvas = document.getElementById('canvas');

	// Define o tamanho do canvas onde o labirinto será desenhado
	canvas.width = mazeW * tileW;
	canvas.height = mazeH * tileH;

	// Define o contexto do canvas, 2d pois o jogo é em 2d
	ctx = canvas.getContext("2d");

	// Carrega os sprites
	sprites = new Image();
	sprites.src = 'sprites.png';
	sprites.onload = loadSprite;
}

// Responde ao botão na pagina html e faz a busca DFS
function searchDFS()
{
	resetMaze();
	continueDFS = true;
	dfs(0, 0);
	drawMaze();
}

// Responde ao botão na pagina html e faz a busca A*
function searchAStar() 
{
	resetMaze();
	var result = calculateAStar();

	for(var i = 0; i < result.length; i++) 
	{
		var x = result[i][0];
		var y = result[i][1];
		maze[x][y] = 4;
	}

	drawMaze();	

}

// Limpa o labirinto e desenha novamente
function resetAll()
{
	resetMaze();
	drawMaze();
}

// Quando o sprite for carregado desenhe o labirinto
function loadSprite()
{
	resetMaze();
	drawMaze();
}


// Desenha o labirinto no canvas
function drawMaze()
{
	// Define qual sprite será desenhado
	var spriteNum = 0;

	// Apaga o contéudo do canvas, para que seja possivél desenhar novamente
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Passa por cada posição da matriz maze e desenha um sprite de acordo com o valor inteiro na posição i,j
	for (var x=0; x < mazeW; x++)
	{
		for (var y=0; y < mazeH; y++)
		{	
			if (x == 0 && y == 0)
			{
				ctx.drawImage(sprites, 0 * tileW, 0, tileW, tileH, x * tileW, y * tileH, tileW, tileH);
				ctx.drawImage(sprites, 2 * tileW, 0, tileW, tileH, x * tileW, y * tileH, tileW, tileH);
			} else if (x == 15 && y == 15) {
				ctx.drawImage(sprites, 0 * tileW, 0, tileW, tileH, x * tileW, y * tileH, tileW, tileH);
				ctx.drawImage(sprites, 3 * tileW, 0, tileW, tileH, x * tileW, y * tileH, tileW, tileH);
			} else if (maze[x][y] == 4) {
				ctx.drawImage(sprites, 0 * tileW, 0, tileW, tileH, x * tileW, y * tileH, tileW, tileH);
				ctx.drawImage(sprites, 4 * tileW, 0, tileW, tileH, x * tileW, y * tileH, tileW, tileH);
			} else {
				ctx.drawImage(sprites, maze[x][y] * tileW, 0, tileW, tileH, x * tileW, y * tileH, tileW, tileH);
			}			
		}
	}		
}

// Define a nossa heuristica, a distância de mahathan
// Sem movimentos lineares considera apenas as direções cardinais
function ManhattanDist(Point, Goal)
{
	return Math.abs(Point.x - Goal.x) + Math.abs(Point.y - Goal.y);
}

// Usada para representar um nó no grafo
function Node(Parent, Point)
{
	var newNode = {
		// Apontador para o predecessor
		Parent:Parent,
		// Index do nó na matriz maze, acessamos maze como se fosse um array plano, isso é usado para facilitar a lógica nos outros passos
		value:Point.x + (Point.y * mazeW),
		x:Point.x,
		y:Point.y,
		// Valor da função heuristica
		f:0,
		// Valor da função custo
		g:0
	};

	return newNode;
}

// Verifica se a celula na posição x,y não é um obstaculo
function isWalkable(x, y)
{
	return ((maze[x] != null) && (maze[x][y] != null) && (maze[x][y] <= walkableSpace));
}

// Retorna os nós vizinhos nas direções Norte, Sul, Leste e Oeste
function findNeighbours(x, y)
{
	var	N = y - 1;
	var S = y + 1;
	var E = x + 1;
	var W = x - 1;

	myN = N > -1 && isWalkable(x, N);
	myS = S < mazeH && isWalkable(x, S);
	myE = E < mazeW && isWalkable(E, y);
	myW = W > -1 && isWalkable(W, y);

	var vet = [];
	if(myN) vet.push({x:x, y:N});
	if(myE) vet.push({x:E, y:y});
	if(myS) vet.push({x:x, y:S});
	if(myW) vet.push({x:W, y:y});

	return vet;
}

// Executa o A* retornando várias cordenadas
function calculateAStar()
{
	// Cria nós da posição inicial e final
	var	mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
	var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});

	// Vetor contendo todas as celulas do labirinto
	var AStar = new Array(mazeSize);

	// Vetor com os nós abertos, ou seja, os nós que ainda tiveram todos os seus vizinhos visitados e estão na pilha
	var Open = [mypathStart];

	// Vetor contendo os nós que já foram visitados e tiveram todos os seus vizinhos visitados e foram removidos da pilha
	var Closed = [];

	// Vetor contendo a solução 
	var result = [];

	// Apontador para o nó mais proxímo
	var myNeighbours;

	// O nó corrente
	var myNode;

	var myPath;

	var length, max, min, i, j;

	// Itera sobre todos os nós abertos até não haver mais nenhum
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

		// Remove o proximo nó do vetor de abertos 
		myNode = Open.splice(min, 1)[0];

		// Verifica se chegamos ao final
		if(myNode.value === mypathEnd.value)
		{
			myPath = Closed[Closed.push(myNode) - 1];
			do
			{
				result.push([myPath.x, myPath.y]);
			}
			while (myPath = myPath.Parent);
			
			// Retorna o resultado do primeiro para o ultimo
			result.reverse();
		}
		else // Não chegamos ao final
		{
			// Encontra os nós mais proxímos que podemos caminhar
			myNeighbours = findNeighbours(myNode.x, myNode.y);

			// Testamos todos os nós
			for(i = 0, j = myNeighbours.length; i < j; i++)
			{
				myPath = Node(myNode, myNeighbours[i]);
				if (!AStar[myPath.value])
				{
					// Função de custo
					// Custo estimado até o nó + a advinhação até o proxímo nó
					myPath.g = myNode.g + ManhattanDist(myNeighbours[i], myNode);

					// Função heuristica
					// Custo estimado de toda rota advinhada até o destino
					myPath.f = myPath.g + ManhattanDist(myNeighbours[i], mypathEnd);
					
					// Armazena esse novo caminho para ser testado mais tarde
					Open.push(myPath);

					// Marca o nó no grafo como visitado
					AStar[myPath.value] = true;
				}
			}

			// Quando esse nó não tiver mais vizinho "fechamos" ele
			Closed.push(myNode);
		}
	}
	return result;
}

// Faz a busca em profundidade recursivamente
function dfs(initX, initY)
{
	maze[initX][initY] = 4;

	if (initX == 15 && initY == 15) 
	{
		continueDFS = false;
		return;
	}

	var myNeighbours = findNeighbours(initX, initY);
	for (var i = 0; i < myNeighbours.length; i++) 
	{
		if (!continueDFS)
		{
			return;
		}

		var neighbour = myNeighbours[i];
		if (maze[neighbour["x"]][neighbour["y"]] != 4)
		{
			dfs(neighbour["x"], neighbour["y"]);
		}
	}
}
