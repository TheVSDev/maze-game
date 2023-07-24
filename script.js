// Function to generate a random integer between 0 and 'max'
function rand(max) {
    return Math.floor(Math.random() * max);
  }
  
  // Function to shuffle an array
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  // Function to change the brightness of an image
  function changeBrightness(factor, sprite) {
    // Create a virtual canvas to draw the modified image
    let virtCanvas = document.createElement("canvas");
    virtCanvas.width = 500;
    virtCanvas.height = 500;
    let context = virtCanvas.getContext("2d");
    context.drawImage(sprite, 0, 0, 500, 500);
  
    // Get the image data of the virtual canvas
    let imgData = context.getImageData(0, 0, 500, 500);
  
    // Modify the brightness of each pixel in the image data
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = imgData.data[i] * factor;
      imgData.data[i + 1] = imgData.data[i + 1] * factor;
      imgData.data[i + 2] = imgData.data[i + 2] * factor;
    }
  
    // Put the modified image data back to the virtual canvas
    context.putImageData(imgData, 0, 0);
  
    // Create a new image with the modified data and return it
    let spriteOutput = new Image();
    spriteOutput.src = virtCanvas.toDataURL();
    virtCanvas.remove();
    return spriteOutput;
  }
  
  // Function to display the victory message with the number of moves
  function displayVictoryMess(moves) {
    document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps.";
    toggleVisibility("message-container");  
  }
  
  // Function to toggle visibility of an element with the given id
  function toggleVisibility(id) {
    if (document.getElementById(id).style.visibility == "visible") {
      document.getElementById(id).style.visibility = "hidden";
    } else {
      document.getElementById(id).style.visibility = "visible";
    }
  }
  
  // Constructor function to create a Maze object
  function Maze(Width, Height) {
    // Variables to store the maze map and dimensions
    let mazeMap;
    let width = Width;
    let height = Height;
    let startCoord, endCoord;
    let dirs = ["n", "s", "e", "w"];
    let modDir = {
      n: {
        y: -1,
        x: 0,
        o: "s"
      },
      s: {
        y: 1,
        x: 0,
        o: "n"
      },
      e: {
        y: 0,
        x: 1,
        o: "w"
      },
      w: {
        y: 0,
        x: -1,
        o: "e"
      }
    };
  
    // Function to get the maze map
    this.map = function() {
      return mazeMap;
    };
  
    // Function to get the start coordinate
    this.startCoord = function() {
      return startCoord;
    };
  
    // Function to get the end coordinate
    this.endCoord = function() {
      return endCoord;
    };
  
    // Function to generate the maze map
    function genMap() {
      mazeMap = new Array(height);
      for (y = 0; y < height; y++) {
        mazeMap[y] = new Array(width);
        for (x = 0; x < width; ++x) {
          mazeMap[y][x] = {
            n: false,
            s: false,
            e: false,
            w: false,
            visited: false,
            priorPos: null
          };
        }
      }
    }
  
    // Function to define the maze layout
    function defineMaze() {
      let isComp = false;
      let move = false;
      let cellsVisited = 1;
      let numLoops = 0;
      let maxLoops = 0;
      let pos = {
        x: 0,
        y: 0
      };
      let numCells = width * height;
      while (!isComp) {
        move = false;
        mazeMap[pos.x][pos.y].visited = true;
  
        if (numLoops >= maxLoops) {
          shuffle(dirs);
          maxLoops = Math.round(rand(height / 8));
          numLoops = 0;
        }
        numLoops++;
        for (index = 0; index < dirs.length; index++) {
          let direction = dirs[index];
          let nx = pos.x + modDir[direction].x;
          let ny = pos.y + modDir[direction].y;
  
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            // Check if the tile is already visited
            if (!mazeMap[nx][ny].visited) {
              // Carve through walls from this tile to next
              mazeMap[pos.x][pos.y][direction] = true;
              mazeMap[nx][ny][modDir[direction].o] = true;
  
              // Set Current cell as next cell's prior visited
              mazeMap[nx][ny].priorPos = pos;
              // Update Cell position to newly visited location
              pos = {
                x: nx,
                y: ny
              };
              cellsVisited++;
              // Recursively call this method on the next tile
              move = true;
              break;
            }
          }
        }
  
        if (!move) {
          // If it failed to find a direction,
          // move the current position back to the prior cell and recall the method.
          pos = mazeMap[pos.x][pos.y].priorPos;
        }
        if (numCells == cellsVisited) {
          isComp = true;
        }
      }
    }
  
    // Function to define the start and end coordinates of the maze
    function defineStartEnd() {
      switch (rand(4)) {
        case 0:
          startCoord = {
            x: 0,
            y: 0
          };
          endCoord = {
            x: height - 1,
            y: width - 1
          };
          break;
        case 1:
          startCoord = {
            x: 0,
            y: width - 1
          };
          endCoord = {
            x: height - 1,
            y: 0
          };
          break;
        case 2:
          startCoord = {
            x: height - 1,
            y: 0
          };
          endCoord = {
            x: 0,
            y: width - 1
          };
          break;
        case 3:
          startCoord = {
            x: height - 1,
            y: width - 1
          };
          endCoord = {
            x: 0,
            y: 0
          };
          break;
      }
    }
  
    // Generate the maze
    genMap();
    defineStartEnd();
    defineMaze();
  }
  
  // Constructor function to create a DrawMaze object
  function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
    // Variables to store the maze map and cell size
    let map = Maze.map();
    let cellSize = cellsize;
    let drawEndMethod;
  
    // Set line width for drawing walls
    ctx.lineWidth = cellSize / 40;
  
    // Redraw the maze with the given cell size
    this.redrawMaze = function(size) {
      cellSize = size;
      ctx.lineWidth = cellSize / 50;
      drawMap();
      drawEndMethod();
    };
  
    // Draw individual maze cell walls
    function drawCell(xCord, yCord, cell) {
      let x = xCord * cellSize;
      let y = yCord * cellSize;
  
      if (cell.n == false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (cell.s === false) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.e === false) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.w === false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }
  
    // Draw the entire maze
    function drawMap() {
      for (x = 0; x < map.length; x++) {
        for (y = 0; y < map[x].length; y++) {
          drawCell(x, y, map[x][y]);
        }
      }
    }
  
    // Draw the end flag
    function drawEndFlag() {
      let coord = Maze.endCoord();
      let gridSize = 4;
      let fraction = cellSize / gridSize - 2;
      let colorSwap = true;
      for (let y = 0; y < gridSize; y++) {
        if (gridSize % 2 == 0) {
          colorSwap = !colorSwap;
        }
        for (let x = 0; x < gridSize; x++) {
          ctx.beginPath();
          ctx.rect(
            coord.x * cellSize + x * fraction + 4.5,
            coord.y * cellSize + y * fraction + 4.5,
            fraction,
            fraction
          );
          if (colorSwap) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          }
          ctx.fill();
          colorSwap = !colorSwap;
        }
      }
    }
  
    // Draw the end sprite
    function drawEndSprite() {
      let offsetLeft = cellSize / 50;
      let offsetRight = cellSize / 25;
      let coord = Maze.endCoord();
      ctx.drawImage(
        endSprite,
        2,
        2,
        endSprite.width,
        endSprite.height,
        coord.x * cellSize + offsetLeft,
        coord.y * cellSize + offsetLeft,
        cellSize - offsetRight,
        cellSize - offsetRight
      );
    }
  
    // Clear the canvas
    function clear() {
      let canvasSize = cellSize * map.length;
      ctx.clearRect(0, 0, canvasSize, canvasSize);
    }
  
    // Choose the appropriate drawEndMethod based on the presence of endSprite
    if (endSprite != null) {
      drawEndMethod = drawEndSprite;
    } else {
      drawEndMethod = drawEndFlag;
    }
  
    // Clear the canvas and draw the maze and end
    clear();
    drawMap();
    drawEndMethod();
  }
  
  // Constructor function to create a Player object
  function Player(maze, c, _cellsize, onComplete, sprite = null) {
    // Variables to store the canvas context, drawSprite function, moves count, and cell coordinates
    let ctx = c.getContext("2d");
    let drawSprite;
    let moves = 0;
    drawSprite = drawSpriteCircle;
    if (sprite != null) {
      drawSprite = drawSpriteImg;
    }
    let player = this;
    let map = maze.map();
    let cellCoords = {
      x: maze.startCoord().x,
      y: maze.startCoord().y
    };
    let cellSize = _cellsize;
    let halfCellSize = cellSize / 2;
  
    // Redraw the player with the given cell size
    this.redrawPlayer = function(_cellsize) {
      cellSize = _cellsize;
      drawSpriteImg(cellCoords);
    };
  
    // Draw the player as a circle
    function drawSpriteCircle(coord) {
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(
        (coord.x + 1) * cellSize - halfCellSize,
        (coord.y + 1) * cellSize - halfCellSize,
        halfCellSize - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
        onComplete(moves);
        player.unbindKeyDown();
      }
    }
  
    // Draw the player as an image sprite
    function drawSpriteImg(coord) {
      let offsetLeft = cellSize / 50;
      let offsetRight = cellSize / 25;
      ctx.drawImage(
        sprite,
        0,
        0,
        sprite.width,
        sprite.height,
        coord.x * cellSize + offsetLeft,
        coord.y * cellSize + offsetLeft,
        cellSize - offsetRight,
        cellSize - offsetRight
      );
      if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
        onComplete(moves);
        player.unbindKeyDown();
      }
    }
  
    // Function to remove the player sprite from a cell
    function removeSprite(coord) {
      let offsetLeft = cellSize / 50;
      let offsetRight = cellSize / 25;
      ctx.clearRect(
        coord.x * cellSize + offsetLeft,
        coord.y * cellSize + offsetLeft,
        cellSize - offsetRight,
        cellSize - offsetRight
      );
    }
  
    // Function to check for player movement and update the position
    function check(e) {
      let cell = map[cellCoords.x][cellCoords.y];
      moves++;
      switch (e.keyCode) {
        case 65:
        case 37: // west
          if (cell.w == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x - 1,
              y: cellCoords.y
            };
            drawSprite(cellCoords);
          }
          break;
        case 87:
        case 38: // north
          if (cell.n == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x,
              y: cellCoords.y - 1
            };
            drawSprite(cellCoords);
          }
          break;
        case 68:
        case 39: // east
          if (cell.e == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x + 1,
              y: cellCoords.y
            };
            drawSprite(cellCoords);
          }
          break;
        case 83:
        case 40: // south
          if (cell.s == true) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x,
              y: cellCoords.y + 1
            };
            drawSprite(cellCoords);
          }
          break;
      }
    }
  
    // Bind the arrow key events and swipe events for mobile devices
    this.bindKeyDown = function() {
      window.addEventListener("keydown", check, false);
  
      $("#view").swipe({
        swipe: function(
          event,
          direction,
          distance,
          duration,
          fingerCount,
          fingerData
        ) {
          switch (direction) {
            case "up":
              check({
                keyCode: 38
              });
              break;
            case "down":
              check({
                keyCode: 40
              });
              break;
            case "left":
              check({
                keyCode: 37
              });
              break;
            case "right":
              check({
                keyCode: 39
              });
              break;
          }
        },
        threshold: 0
      });
    };
  
    // Unbind the arrow key events and swipe events
    this.unbindKeyDown = function() {
      window.removeEventListener("keydown", check, false);
      $("#view").swipe("destroy");
    };
  
    // Draw the player sprite at the start coordinate
    drawSprite(maze.startCoord());
  
    // Bind the arrow key events and swipe events for the player
    this.bindKeyDown();
  }
  
  // Main code
  let mazeCanvas = document.getElementById("mazeCanvas");
  let ctx = mazeCanvas.getContext("2d");
  let sprite;
  let finishSprite;
  let maze, draw, player;
  let cellSize;
  let difficulty;
  
  // Function to handle window load
  window.onload = function() {
    // Determine the canvas dimensions based on the view size
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
    }
  
    // Load and edit sprites
    let completeOne = false;
    let completeTwo = false;
    let isComplete = () => {
      if(completeOne === true && completeTwo === true)
      {
        setTimeout(function(){
          makeMaze();
        }, 500);         
      }
    };
  
    // Load and modify the player sprite
    sprite = new Image();
    sprite.src = "./img/player.svg" + "?" + new Date().getTime();
    sprite.setAttribute("crossOrigin", " ");
    sprite.onload = function() {
      sprite = changeBrightness(1.2, sprite);
      completeOne = true;
      isComplete();
    };
  
    // Load and modify the finish sprite
    finishSprite = new Image();
    finishSprite.src = "./img/exit.svg" + "?" + new Date().getTime();
    finishSprite.setAttribute("crossOrigin", " ");
    finishSprite.onload = function() {
      finishSprite = changeBrightness(1.1, finishSprite);
      completeTwo = true;
      isComplete();
    };
  };
  
  // Function to handle window resize
  window.onresize = function() {
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
    }
    cellSize = mazeCanvas.width / difficulty;
    if (player != null) {
      draw.redrawMaze(cellSize);
      player.redrawPlayer(cellSize);
    }
  };
  
  // Function to create the maze
  function makeMaze() {
    // Unbind previous player events if it exists
    if (player != undefined) {
      player.unbindKeyDown();
      player = null;
    }
  
    // Get the selected difficulty level
    let e = document.getElementById("diffSelect");
    difficulty = e.options[e.selectedIndex].value;
  
    // Calculate the cell size based on the canvas and difficulty
    cellSize = mazeCanvas.width / difficulty;
  
    // Generate a new maze and draw it
    maze = new Maze(difficulty, difficulty);
    draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
    player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);
  
    // Make the maze container visible
    if (document.getElementById("mazeContainer").style.opacity < "100") {
      document.getElementById("mazeContainer").style.opacity = "100";
    }
  }
  