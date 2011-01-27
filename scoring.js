
/**
 * Code for the grid of pegs
 */
var grid;

// Tube enums
var NONE = 0;
var TRIANGLE = 1;
var CIRCLE = 2;
var SQUARE = 3;
var COLORS = ["black", "red", "white", "blue"];
var IMAGES = ["none.png", "triangle.png", "circle.png", "square.png"];

// Peg class, each peg is represented by it's own class that handles itself
function Peg(raised, parent) {
    this.raised = raised;
    this.tube = NONE;
    this.uberTube = false;
    this.html = $("<div class='peg'>");
    this.html.appendTo(parent);
    this.html.html("<img src='none.png'/>");
    if (raised) {
	this.html.css("margin-top", "-20px");
    }

    var obj = this;
    this.html.click(function() { obj.clickHandler(); });
}
Peg.prototype.clickHandler = function() {
    this.tube += 1;
    if (this.tube > SQUARE) { this.tube = NONE; }
    this.html.html("<img src='"+(this.uberTube ? "uber_" : "")+IMAGES[this.tube]+"'/>");
    updateScore();
};
Peg.prototype.toggleUberTube = function() {
    this.uberTube = !this.uberTube;
    this.html.html("<img src='"+(this.uberTube ? "uber_" : "")+IMAGES[this.tube]+"'/>");
    updateScore();
};
// Code for handling touch screens
Peg.prototype.touchStart = function(e) {
    e.preventDefault();
    this.pressStartTime = (new Date()).getTime();
    this.handledTouch = false;
    var obj = this;
    this.timerId = setTimeout(function() {obj.toggleUberTube();}, 200);
};
Peg.prototype.touchEnd = function(e) {
    e.preventDefault();
    clearTimeout(this.timerId);
    var delta = (new Date()).getTime() - this.pressStartTime;
    console.log(delta);
    if (delta <= 200) {
	this.clickHandler();
    }
};
// Detection of overlap of a point for ubertubes
Peg.prototype.contains = function(px, py) {
    var x, y, w, h;
    x = this.html.attr("offsetLeft");
    y = this.html.attr("offsetTop");
    w = this.html.attr("clientWidth");
    h = this.html.attr("clientHeight");
    return ((x <= px) && (px <= (x+w))) && ((y <= py) && (py <= (y+h)));
};

// Generates a row of pegs
function getRow(parent) {
    return [new Peg(false, parent), new Peg(true, parent), new Peg(false, parent),
	    new Peg(false, parent), new Peg(true, parent), new Peg(false, parent)];
}

/**
 * Code for dragging and dropping of UberTubes
 */
var ubertubes;
var numUBERTUBEs = 0;
function UberTube() {
    this.num = numUBERTUBEs; numUBERTUBEs += 1;
    this.html = $("<img src='uber_none.png' />");
    this.html.toggleClass("tube");
    this.html.appendTo($("#bin"));
    this.html.css("left", $("#bin").attr("offsetLeft")+(60*this.num)+45+"px");
    this.clicked = false;
    this.container = $("#bin");

    var obj = this;
    if (navigator.userAgent.toLowerCase().search("android") != -1) { // Android device
	this.html.bind("touchstart", function(e) { obj.handleMouseDown(e); });
	this.html.bind("touchmove", function(e) { obj.handleMouseMove(e); });
	this.html.bind("touchend", function(e) { obj.handleMouseUp(e); });
    } else {
	this.html.mousedown( function(e) {obj.handleMouseDown(e);} );
	this.html.mousemove( function(e) {obj.handleMouseMove(e);} );
	this.html.mouseup( function(e) {obj.handleMouseUp(e);} );
    }
}
UberTube.prototype.handleMouseDown = function(e) {
    e.preventDefault();
    this.clicked = true;
    this.startTime = (new Date()).getTime();
    this.startX = e.pageX; this.startY = e.pageY;

    this.html.css("top", (e.pageY-45)+"px");
    this.html.css("left", (e.pageX-45)+"px");
    this.html.css("z-index", "100");
    this.html.css("cursor", "move");
    if (this.container instanceof Peg) {
	this.container.toggleUberTube();
    }
};
UberTube.prototype.handleMouseMove = function(e) {
    e.preventDefault();
    if (this.clicked) {
	e.preventDefault();
	this.html.css("top", (e.pageY-45)+"px");
	this.html.css("left", (e.pageX-45)+"px");

	var delta = Math.pow(this.startX - e.pageX, 2) + 
	            Math.pow(this.startY - e.pageY, 2);
	if (delta > 16) {
	    this.html.attr("src", "uber_none.png");
	}
    }
};
UberTube.prototype.handleMouseUp = function(e) {
    e.preventDefault();
    this.clicked = false;
    this.html.css("z-index", "99");
    this.html.css("cursor", "pointer");

    var handled = false, samePeg = false;
    for (var row = 0; row < grid.length; row++) {
	for (var i = 0; i < grid[row].length; i++) {
	    if (grid[row][i].contains(e.pageX, e.pageY) && !grid[row][i].uberTube) {
		if (this.container == grid[row][i]) { samePeg = true; }
		grid[row][i].toggleUberTube();
		this.container = grid[row][i];
		this.html.css("left", grid[row][i].html.attr("offsetLeft"));
		this.html.css("top", grid[row][i].html.attr("offsetTop"));
		this.html.attr("src", "blank.png");
		handled = true;
	    }
	}
    }
    if (!handled) {
	this.container = $("#bin");
    }

    var delta = (new Date()).getTime() - this.startTime;
    if (handled && samePeg && (delta <= 200)) {
	this.container.clickHandler();
    }
};

/**
 * Code for the minibots race
 */
var race;
var raceSpots = [];
var racers = 0;

// Race enums
var RACE_SCORE = [30, 20, 15, 10];
var RACE_POSITION = ["First", "Second", "Third", "Fourth"];

// Class that handles button toggling for each place in the race
function Racer(place, points) {
    this.num = racers; racers += 1;
    this.html = $("<div class='minibot'>");
    this.html.appendTo($("#race"));
    this.html.text(place+" place ("+points+" points)");
    this.points = points;
    this.value = false;
    var obj = this;
    this.html.click(function() { obj.handleClick(); });
}
Racer.prototype.handleClick = function() {
    if (raceSpots.length < 2 || this.value) {
	this.value = !this.value;
	if (this.value) {
	    raceSpots.push(this.num);
	} else {
	    raceSpots.pop(raceSpots.indexOf(this.num));
	    $("#errors").text("");
	}
	this.html.toggleClass("active");
	updateScore();
    } else {
	$("#errors").text("Error: Can't win the more than two places in the race, remove one first.");
    }
};
Racer.prototype.getScore = function() {
    return this.value ? this.points : 0;
};

/**
 * Code for updating the score
 */
function updateScore() {
    var autonScore = getAutonScore();
    var teleopScore = getTeleopScore();
    var raceScore = getRaceScore();
    var score = autonScore + teleopScore + raceScore;

    $("#auton-score").text(autonScore);
    $("#teleop-score").text(teleopScore);
    $("#race-score").text(raceScore);
    $("#score").text(score);
}
function isLogo(p1, p2, p3) {
    return (p1.tube == TRIANGLE) && (p2.tube == CIRCLE) && (p3.tube == SQUARE);
}
function getAutonScore() {
    var score = 0;
    for (var row = 0; row < grid.length; row++) {
	for (var peg = 0; peg < grid[row].length; peg++) {
	    if (grid[row][peg].uberTube) {
		score += 2 * (3 - row);
	    }
	}
    }
    return score;
}
function getTeleopScore() {
    var score = 0;
    for (var row = 0; row < grid.length; row++) {
	score += getGroupScore(3-row, grid[row][0], grid[row][1], grid[row][2]);
	score += getGroupScore(3-row, grid[row][3], grid[row][4], grid[row][5]);
    }
    return score;
}
function getGroupScore(value, p1, p2, p3) {
    var multiplier = 1;
    var tubes = 0;
    var pegs = [p1, p2, p3];
    for (var peg = 0; peg < pegs.length; peg++) {
	if (pegs[peg].tube != NONE && pegs[peg].uberTube) {
	    tubes += 2;
	} else if (pegs[peg].tube != NONE && !pegs[peg].uberTube) {
	    tubes += 1;
	}
    }
    if (isLogo(p1, p2, p3)) {
	multiplier = 2;
    }
    return tubes * value * multiplier;
}
function getRaceScore() {
    var score = 0;
    for (var i = 0; i < race.length; i++) {
	score += race[i].getScore();
    }
    return score;
}

// Main loop for initiating the game
function main() {
    grid = [getRow("#top"), getRow("#middle"), getRow("#bottom")];
    for (var row = 0; row < grid.length; row++) {
	grid[row][2].html.css("margin-right", "35px");
    }
    race = [new Racer(RACE_POSITION[0], RACE_SCORE[0]),
	    new Racer(RACE_POSITION[1], RACE_SCORE[1]),
	    new Racer(RACE_POSITION[2], RACE_SCORE[2]),
	    new Racer(RACE_POSITION[3], RACE_SCORE[3])];
    ubertubes = [new UberTube(), new UberTube(),  new UberTube()];
}