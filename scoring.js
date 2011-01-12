
var grid;

// Tube enums
var NONE = 0;
var TRIANGLE = 1;
var CIRCLE = 2;
var SQUARE = 3;
var COLORS = ["black", "red", "white", "blue"];

//
function Peg(raised, parent) {
    this.raised = raised;
    this.tube = NONE;
    this.uberTube = false;
    this.html = $("<div class='peg'>");
    this.html.appendTo(parent);

    var obj = this;
    this.html.click(function() { obj.clickHandler(); });
    this.html.dblclick(function() { obj.dblClickHandler(); });
}
Peg.prototype.clickHandler = function() {
    this.tube += 1;
    if (this.tube > SQUARE) { this.tube = NONE; }
    this.html.css("background-color", COLORS[this.tube]);
    updateScore();
};
Peg.prototype.dblClickHandler = function() {
    this.uberTube = !this.uberTube;
    this.html.css("border-color", this.uberTube ? "yellow" : "gray");
    updateScore();
}

// Race
var race;
var RACE_SCORE = [30, 20, 15, 10];
var RACE_POSITION = ["First", "Second", "Third", "Fourth"];
function initRace() {
    race = [false, false, false, false];
    for (var i = 0; i < race.length; i++) {
	var n = i;
	var html = $("<div class='minibot'>");
	html.appendTo($("#race"));
	html.text(RACE_POSITION[n] + "place (" + RACE_SCORE[n] + " points)");
	html.click(
	    function() {
		race[n] = !race[n];
		html.toggleClass("active");
		updateScore();
	    });
    }
}

//
function getRow(parent) {
    return [new Peg(false, parent), new Peg(true, parent), new Peg(false, parent),
	    new Peg(false, parent), new Peg(true, parent), new Peg(false, parent)];
}

//
function updateScore() {
    var autonScore = 0, teleopScore = 0, raceScore = 0, score = 0;
    for (var row = 0; row < grid.length; row++) {
	if (isLogo(grid[row][0], grid[row][1], grid[row][2])) {
	    teleopScore += 2 * getScore(3-row, grid[row][0], grid[row][1], grid[row][2]);
	} else {
	    teleopScore += getScore(3-row, grid[row][0], grid[row][1], grid[row][2]);
	}
	if (isLogo(grid[row][3], grid[row][4], grid[row][5])) {
	    teleopScore += 2 * getScore(3-row, grid[row][3], grid[row][4], grid[row][5]);
	} else {
	    teleopScore += getScore(3-row, grid[row][3], grid[row][4], grid[row][5]);
	}
    }
    raceScore = getRaceScore();
    score = autonScore + teleopScore + raceScore;
    $("#auton-score").text(autonScore);
    $("#teleop-score").text(teleopScore);
    $("#race-score").text(raceScore);
    $("#score").text(score);
}
function isLogo(p1, p2, p3) {
    return (p1.tube == TRIANGLE) && (p2.tube == CIRCLE) && (p3.tube == SQUARE);
}
function getScore(value, p1, p2, p3) {
    var tubes = 0;
    var pegs = [p1, p2, p3];
    for (var peg = 0; peg < pegs.length; peg++) {
	if (pegs[peg].tube != NONE) { tubes += 1; }
	if (pegs[peg].hasUber) { tubes += 1; }
    }
    return tubes * value;
}
function getRaceScore() {
    var score = 0;
    for (var i = 0; i < race.length; i++) {
	if (race[i]) {
	    score += RACE_SCORE[i];
	}
    }
    return score;
}

function main() {
    grid = [getRow("#top"), getRow("#middle"), getRow("#bottom")];
    initRace();
}