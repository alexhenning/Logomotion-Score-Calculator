
var grid;

// Tube enums
var NONE = 0;
var TRIANGLE = 1;
var CIRCLE = 2;
var SQUARE = 3;
var COLORS = ["black", "red", "white", "blue"];
var IMAGES = ["none.png", "triangle.png", "circle.png", "square.png"];

//
function Peg(raised, parent) {
    this.raised = raised;
    this.tube = NONE;
    this.uberTube = false;
    this.html = $("<div class='peg'>");
    this.html.appendTo(parent);
    this.html.html("<img src='none.png'/>");
    if (raised) {
	this.html.css("margin-top", "-10px");
    }

    var obj = this;
    this.html.click(function() { obj.clickHandler(); });
    this.html.rightClick(function() { obj.rightClickHandler(); });
}
Peg.prototype.clickHandler = function() {
    this.tube += 1;
    if (this.tube > SQUARE) { this.tube = NONE; }
    this.html.html("<img src='"+(this.uberTube ? "uber_" : "")+IMAGES[this.tube]+"'/>");
    updateScore();
};
Peg.prototype.rightClickHandler = function() {
    this.uberTube = !this.uberTube;
    this.html.html("<img src='"+(this.uberTube ? "uber_" : "")+IMAGES[this.tube]+"'/>");
    updateScore();
}

// Race
var race;
var RACE_SCORE = [30, 20, 15, 10];
var RACE_POSITION = ["First", "Second", "Third", "Fourth"];
function Racer(place, points) {
    this.html = $("<div class='minibot'>");
    this.html.appendTo($("#race"));
    this.html.text(place+" place ("+points+" points)");
    this.points = points;
    this.value = false;
    var obj = this;
    this.html.click(function() { obj.handleClick(); });
}
Racer.prototype.handleClick = function() {
    this.value = !this.value;
    this.html.toggleClass("active");
    updateScore();
};
Racer.prototype.getScore = function() {
    return this.value ? this.points : 0;
};

//
function getRow(parent) {
    return [new Peg(false, parent), new Peg(true, parent), new Peg(false, parent),
	    new Peg(false, parent), new Peg(true, parent), new Peg(false, parent)];
}

//
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

function main() {
    grid = [getRow("#top"), getRow("#middle"), getRow("#bottom")];
    race = [new Racer(RACE_POSITION[0], RACE_SCORE[0]),
	    new Racer(RACE_POSITION[1], RACE_SCORE[1]),
	    new Racer(RACE_POSITION[2], RACE_SCORE[2]),
	    new Racer(RACE_POSITION[3], RACE_SCORE[3])];
}