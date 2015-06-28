// add a jQuery psuedo selector to match attributes with case insensitivity
$.expr[':'].attrNoCase = function(node, stackIndex, properties){
	var args = properties[3].split(',').map(function(arg) {
		return arg.replace(/^\s*["']|["']\s*$/g, '');  
	});
	if ($(node).attr(args[0])) {
		return $(node).attr(args[0]).toLowerCase() == args[1].toLowerCase();
	}
};

// count the number of tables on page
function getTableCount() {
	return parseInt($('a[id^="collapseButton"]:last')[0].id.split("collapseButton").pop());
}

// expand all tables on page
function expandAll() {
	for(var i = 0; i < getTableCount(); i++) {
		collapseTable(i);
	}
}

function findChampionByName(name, doc) {
	var result = [];
	$(doc).find('table.wikitable.collapsible').each(function() {
		$(this).find('tbody tr:nth(3)').each(function() {
			$(this).find('td a:attrNoCase("title","'+ name +'")').each(function() {
				//console.log(this);
				result.push(this);
			});
		});
	});
	return result;
}

function countChampionWins(name, doc, shouldLog) {
	var nodeList = findChampionByName(name, doc);
	var result = {win: [], loss: []};
	$(nodeList).each(function() {
		var redTeam = $(this).parent().parent().parent().find('tr:nth-child(2):first').find(':nth-child(4)').html().trim();
		var blueTeam = $(this).parent().parent().parent().find('tr:nth-child(2):first').find(':nth-child(1)').html().trim();
		var redWin = (parseInt($(this).parent().parent().parent().find('tr:nth-child(2):first').find(':nth-child(3)').html().trim()) === 1);
		// if we're red team
		if($(this).parent().is(':last-child')) {
			// and the third slot says that we won
			if(redWin) {
				if(shouldLog) {
					console.log(name+' won for '+redTeam+'.');	
				}
				result.win.push({redTeam: redTeam, blueTeam: blueTeam, redWin: redWin});
			} else {
				if(shouldLog) {
					console.log(name+' lost for '+redTeam+'.');
				}
				result.loss.push({redTeam: redTeam, blueTeam: blueTeam, redWin: redWin});
			}
		} else {
			// else, if we're blue team
			if(!redWin) {
				if(shouldLog) {
					console.log(name+' won for '+blueTeam+'.');
				}
				result.win.push({redTeam: redTeam, blueTeam: blueTeam, redWin: redWin});
			} else {
				if(shouldLog) {
					console.log(name+' lost for '+blueTeam+'.');
				}
				result.loss.push({redTeam: redTeam, blueTeam: blueTeam, redWin: redWin});
			}
		}
	});
	return result;
}
//var resultPointer;
function countChampionWinsIterated(name, URLs, shouldLog) {
	var rawResults = [];

	var result = {win: [], loss: []};
	var deferred = [];
	
	for(var count = 0; count < URLs.length; count++) {
		deferred.push($.ajax({
			url: URLs[count],
			success: function (data) {
				rawResults.push(data);
				var doc = $.parseHTML(data);
				if(shouldLog) {
					console.log('Start: '+this.url.split("?")[0]);	
				}
				var temp = countChampionWins(name, doc, shouldLog);
				if(temp.win.length > 0) {
					result.win = result.win.concat(temp.win);
				}
				if(temp.loss.length > 0) {
					result.loss = result.loss.concat(temp.loss);
				}
				//console.log(JSON.stringify(temp));
			},
		}))
	}

	$.when.apply(this, deferred).then(function() {
		//resultPointer = result;
		//jQuery.extend(resultPointer, result);
		//resultPointer = result;
		console.log("------------------------------");
		console.log(name);
		console.log("Wins: "+result.win.length);
		console.log("Losses: "+result.loss.length);
	});
}

var searchObject = {};
function constructSearchObject(URLs) {
	var deferred = [];

	for(var count = 0; count < URLs.length; count++) {
		deferred.push($.ajax({
			url: URLs[count],
			success: function (data) {
				//rawResults.push(data);
				//var doc = $.parseHTML(data);
				searchObject[URLs[count]] = $.parseHTML(data);
				// if(shouldLog) {
				// 	console.log('Start: '+this.url.split("?")[0]);	
				// }
				// var temp = countChampionWins(name, doc, shouldLog);
				// if(temp.win.length > 0) {
				// 	result.win = result.win.concat(temp.win);
				// }
				// if(temp.loss.length > 0) {
				// 	result.loss = result.loss.concat(temp.loss);
				// }
				// //console.log(JSON.stringify(temp));
			},
		}))
	}

	$.when.apply(this, deferred).then(function() {
		//resultPointer = result;
		//jQuery.extend(resultPointer, result);
		//resultPointer = result;
		console.log("------------------------------");
		//console.log(name);
		//console.log("Wins: "+result.win.length);
		//console.log("Losses: "+result.loss.length);
	});
}

var URLs = [
	"http://lol.gamepedia.com/2015_NA_LCS_Spring/Scoreboards/Round_Robin/Week_1",
	"http://lol.gamepedia.com/2015_NA_LCS_Spring/Scoreboards/Round_Robin/Week_2",
	"http://lol.gamepedia.com/2015_NA_LCS_Spring/Scoreboards/Round_Robin/Week_3",
	"http://lol.gamepedia.com/2015_NA_LCS_Spring/Scoreboards/Round_Robin/Week_4",
	"http://lol.gamepedia.com/2015_NA_LCS_Spring/Scoreboards/Round_Robin/Week_5"
];

constructSearchObject(URLs);

var URLs2 = [
	"http://lol.gamepedia.com/2015_EU_LCS_Spring/Scoreboards/Round_Robin/Week_1",
	"http://lol.gamepedia.com/2015_EU_LCS_Spring/Scoreboards/Round_Robin/Week_2",
	"http://lol.gamepedia.com/2015_EU_LCS_Spring/Scoreboards/Round_Robin/Week_3",
	"http://lol.gamepedia.com/2015_EU_LCS_Spring/Scoreboards/Round_Robin/Week_4",
	"http://lol.gamepedia.com/2015_EU_LCS_Spring/Scoreboards/Round_Robin/Week_5"
];

//var res;
//countChampionWinsIterated('sivir', URLs);

function getAllChampionsSYNCH() {
	return JSON.parse($.ajax(
		{
			url: 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?api_key=92b6310b-244c-427d-914b-83c573f267a9',
			async: false,
		}).responseText);
}

function allChampionWinrates() {
	var championList = getAllChampionsSYNCH();
	for(var count = 0; count < Object.keys(championList.data).length; count++) {
		//console.log('count '+count)
		countChampionWinsIterated(championList.data[Object.keys(championList.data)[count]].name, URLs.concat(URLs2), false);
	}
}