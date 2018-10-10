$(function(){
    var defaults = {
        beginner: {
            size: 8,
            mines: 10
        },
        intermediate: {
            size: 16,
            mines: 40
        },
        expert: {
            size: 24,
            mines: 99
        }
    };
    var difficulty, width, height, numMines, 
        firstClick, gameOver, flipped, flagged,
        time, timeInterval;
    var mines = [];
    // set up images
    var flagImg = new Image(15, 15);
    flagImg.src = "images/flag.png";
    flagImg.className = "flag";
    var mineImg = new Image(20, 20);
    mineImg.src = "images/explosion.png";
    mineImg.className = "mine-img";
    setDifficulty("beginner");
    initialize();
    
    $("#game-contianer").contextmenu(function(e) {
        e.preventDefault();
    });
    
    $(".preset").click(function() {
        $(".dif-optn").removeClass("active");
        $(this).addClass("active");
        setDifficulty($(this).attr("id"));
        initialize();
    });
    
    function updateMineBar(newWidth, newHeight){
        var newMax = Math.floor(newHeight*newWidth*.8);
        if ($("#mine-select").val() > newMax){
            $("#mine-select").val(newMax)
            $("#mval").html(newMax)
        }
        $("#mine-select").attr("max", newHeight*newWidth*.8);
    }
    
    $("#width-select").on("input", function(){
        var newWidth = $(this).val();
        $("#wval").html(newWidth);
        updateMineBar(newWidth, $("#height-select").val());
    });
    
    $("#height-select").on("input", function(){
        var newHeight = $(this).val();
        $("#hval").html(newHeight);
        updateMineBar($("#width-select").val(), newHeight);
    });
    
    $("#mine-select").on("input", function(){
        var newMines = $(this).val();
        $("#mval").html(newMines);
    });
    
    $("#start-btn").click(function() {
        $(".dif-optn").removeClass("active");
        $("#custom").addClass("active");
        difficulty = "custom"
        width = $("#width-select").val();
        height = $("#height-select").val();
        numMines = parseInt($("#mine-select").val());
        $("#mine-count").html(numMines);
        initialize();
        
    });
    
    $("#smiley").click(initialize);
    
    function incTime(){
        time += .01;
        $("#timer").html(time.toFixed(2));
    }
    
    function setDifficulty(newDifficulty){
        difficulty = newDifficulty
        width = defaults[newDifficulty].size;
        height = defaults[newDifficulty].size;
        numMines = defaults[newDifficulty].mines;
        $("#mine-count").html(numMines);
    }
    
    function initMines(clickRow, clickCol){
        for (var i=0; i<numMines; i++){
            do{
                var r = Math.floor(Math.random()*height);
                var c = Math.floor(Math.random()*width);
            }while (mines[r][c].isMine || Math.abs(r-clickRow) < 2 && Math.abs(c-clickCol) < 2)
            mines[r][c].isMine = true;
            $("#"+r+"_"+c).addClass("mine no-flag");
        }
        
    }
    
    function countAdj(r, c, property){
        var count = 0;
        for(var i = Math.max(0, r-1); i<=Math.min(r+1, height-1); i++){
            for(var j = Math.max(0, c-1); j<=Math.min(c+1, width-1); j++){
                if(mines[i][j][property]){ count++; }
            }
        }
        return count;
    }
    
    function flipSquare(r, c){
        var square = $("#"+r+"_"+c);
        var mineCount = countAdj(r, c, "isMine");
        
        flipped++;
        mines[r][c].flipped = true;
        square.addClass("flipped");
        if (mineCount > 0){
            square.append("<p class='m m"+mineCount+"'><b>"+mineCount+"</b></p>")
        }else{
            for(var i = Math.max(0, r-1); i<=Math.min(r+1, height-1); i++){
                for(var j = Math.max(0, c-1); j<=Math.min(c+1, width-1); j++){
                    if(!mines[i][j].flipped){flipSquare(i, j);}
                }
            }
        }
    }
    
    function squareClick(r, c){
        if (gameOver){
            return;
        }
        if (firstClick){
            initMines(r, c);
            firstClick = false;
            time = 0;
            flipSquare(r, c);
            timeInterval = setInterval(incTime, 10);
        }else{
            if(mines[r][c].flagged){
                return;
            }else if(mines[r][c].isMine){
                gameOver = true;
                $("#"+r+"_"+c).addClass("flipped");
                $(".mine.no-flag").append(mineImg.cloneNode());
                $("#smiley > img").css({
                    "margin-left": -4.45+"rem",
                    "margin-top": -2.25+"rem"
                });
            }else{
                flipSquare(r, c);
                console.log(flipped, numMines, width*height);
                                             
            }
        }
        if (flipped+numMines === width*height){
            gameOver = true;
            $("#smiley > img").css({
                "margin-left": -8.95+"rem",
                "margin-top": 0+"rem"
            });
        } 
        if(gameOver){
            clearInterval(timeInterval);
        } 
    }
    
    function squareDblClick(r, c){
        if(countAdj(r, c, "isMine") === countAdj(r, c, "flagged")){
            for(var i = Math.max(0, r-1); i<=Math.min(r+1, height-1); i++){
                for(var j = Math.max(0, c-1); j<=Math.min(c+1, width-1); j++){
                    if(!mines[i][j].flipped){
                        squareClick(i, j);
                    }
                }
            }
        }
    }
    
    function squareRightClick(r, c){
        if(gameOver || firstClick || mines[r][c].flipped){
            return;
        }
        var square =$("#"+r+"_"+c);
        mines[r][c].flagged = !mines[r][c].flagged;
        if (mines[r][c].flagged){
            square.append(flagImg.cloneNode());
            square.removeClass("no-flag");
            flagged++;
        }else{
            flagged--;
            square.empty();
            square.addClass("no-flag");
        }
        $("#mine-count").html(numMines-flagged);
    }
    
    // start game code
    function initialize(){
        mines = [];
        flipped = 0;
        flagged = 0;
        firstClick = true;
        gameOver = false;
        clearInterval(timeInterval);
        $("#smiley > img").css({
            "margin-left": 0+"rem",
            "margin-top": 0+"rem"
        });
        $("#timer").html("0.00");
        $("#mine-count").html(numMines);
        $(".square").remove();
        $("#game-container").css({
            width: width*1.5+"rem",
            height: height*1.5+"rem"
        });
        for (var r=0; r < height; r++){
            mines[r] = [];
            for (var c=0; c < width; c++){
                mines[r].push({
                    isMine: false, 
                    flipped: false, 
                    flagged: false
                });
                $("#game-container").append("<div id = '"+r+"_"+c+"'"+
                                            "class='square'</div>");
            }
        }
        $(".square").click(function(e){
            var id = $(this).attr("id").split("_");
            var r = parseInt(id[0]);
            var c = parseInt(id[1]);
            if (!mines[r][c].flipped){
                squareClick(r, c);
            }
        });
        $(".square").dblclick(function(e){
            var id = $(this).attr("id").split("_");
            var r = parseInt(id[0]);
            var c = parseInt(id[1]);
            if(mines[r][c].flipped){
                squareDblClick(r, c);
            }
        });
        $(".square").contextmenu(function(e){
            var id = $(this).attr("id").split("_");
            var r = parseInt(id[0]);
            var c = parseInt(id[1]);
            e.preventDefault();
            squareRightClick(r, c);
        });
    }
    
});