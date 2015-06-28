var currentDoc;
var parser = new DOMParser();

// [ {name:"Bioshock", mainStoryLength: undefined}, {"Kentucky Route Zero", mainStoryLength: undefined} ]

var current
var listOfGames;

function cleanUpSteam(gameName) {
	return gameName.replace(/[∞®™]/g, "").replace(/æ/g, "ae");
}

function parseMyGamesList(userAccountName) {
	jQuery.ajax({
		url:"http://steamcommunity.com/id/"+userAccountName+"/games?tab=all&xml=1"
	}).done(function(data) {
		listOfGames = [];
		current = data
		jQuery('game', data).each(function(index) {
			var gameName = cleanUpSteam(jQuery('game:nth('+index+') name', current).html().split("<![CDATA[").pop().split("]]>")[0].trim());
			if(typeof gameName === 'undefined') {
				console.warn('The nth game, '+index+' has no Steam name!');
			}
			console.log('name: '+gameName);
			listOfGames.push({
				name: gameName,
				id: parseInt(jQuery('game:nth('+index+') appID', current).html())
			})
		})
	});
}
 parseMyGamesList('Milgwyn')

function timeToBeatAll(listOfGames) {
	for(var index in listOfGames) {
		setTimeout(timeToBeat, 250*index, listOfGames[index]);
	}
	setTimeout(function() {
		console.log('Should be done!')
	}, 250*listOfGames.length);
}

function cleanUpHLTB(gameName) {
	if(typeof gameName !== 'undefined') {
		return gameName.replace(/(&amp;)/g, "&");
	} else {
		return undefined;
	}
}

function cleanUpPHPHLTB(gameName) {
	if(typeof gameName !== 'undefined') {
	// Remove "Edition"?
		return gameName.replace(/-(?=\ )|&(?=\ )|:(?=\ )/g, "").replace(/[&:]/g, " ");
	} else {
		return undefined;
	}
}

var editedListOfGames = listOfGames.filter(function(game) {
	if(typeof game.mainStoryLength !== 'undefined' && game.mainStoryLength !== 'undefined' && game.mainStoryLength !== 'N/A' && !isNaN(game.mainStoryLength)) {
		return true;
	} else {
		return false;
	}
}).sort(function(a, b) {
	a = parseInt(a.mainStoryLength)
	b = parseInt(b.mainStoryLength)
	if(a > b) {
		return 1
	} else if(a < b) {
		return -1
	} else {
		return 0 
	}
})

function parseTime(timeString) {	
	if(timeString === 'N/A') {
		return NaN;
	}else if(typeof timeString !== "undefined" && timeString !== "undefined") {
		if(timeString.toLocaleLowerCase().includes("mins") || timeString.toLocaleLowerCase().includes("minutes")) {
			return parseInt(timeString)/60;
		} else {
			return parseInt(timeString);
		}
	} else {
		return undefined;
	}
}

function timeToBeat(thisGame) {
	jQuery.ajax({
		url: "http://howlongtobeat.com/search_main.php",
		//  Query to popular?
		data: "queryString="+cleanUpPHPHLTB(thisGame.name)+"&t=games&sorthead=name&sortd=Normal Order&plat=PC&detail=0",
		method: "POST"
	}).done(function(data) {
		currentDoc = parser.parseFromString(data, 'text/html');
		var gameName = cleanUpHLTB(jQuery('#suggestionsList_main li:first a[href^="game.php?"]:last', currentDoc).html());
		var mainStoryLength = jQuery('#suggestionsList_main li:first div.gamelist_details div:first div:first div[class*="time"]', currentDoc).html();
		thisGame.mainStoryLength = parseTime(mainStoryLength);
		if(typeof gameName === 'undefined' || gameName === 'undefined') {
			console.error('Could not find '+thisGame.name+' with id '+thisGame.id+'.');
		} else if(String(thisGame.name).toLocaleLowerCase() !== gameName.toLocaleLowerCase()) {
			console.warn('Searched for '+thisGame.name+', but found '+gameName+' instead.');
		} else if(typeof mainStoryLength === 'undefined' && typeof gameName !== 'undefined') {
			console.error('Searched for '+thisGame.name+', and could not find a length for completion.');
		} else {
			console.log(gameName+': '+mainStoryLength);
		}
	}).error(function(data) {
		console.error(data);
	});
	jQuery('div#suggestionsList_main li:first ', currentDoc);
}
