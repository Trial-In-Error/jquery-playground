var DOMParser = require('xmldom').DOMParser,
	parser = new DOMParser(),
	ent = require('ent'),
	cheerio = require('cheerio'),
	request = require('request');

var listOfGames;

function cleanUpSteam(gameName) {
	return gameName.replace(/[∞®™]/g, "").replace(/æ/g, "ae");
}

function parseMyGamesList(userAccountName) {
	var options = ({
		url: "http://steamcommunity.com/id/"+userAccountName+"/games?tab=all&xml=1"
	});
	var callback = function(err, httpResponse, body) {
		if(err) {
			console.error(err);
			return;
		}
		$ = cheerio.load(body);
		listOfGames = [];
		$('game').each(function(index) {
			var gameName = cleanUpSteam($('game').eq(index).find('name').html().split("<!--[CDATA[").pop().split("]]-->")[0].trim());
			if(typeof gameName === 'undefined') {
				console.warn('The nth game, '+index+' has no Steam name!');
			}
			console.log('name: '+gameName);
			listOfGames.push({
				name: gameName,
				id: parseInt($('game').eq(index).find('appID').html())
			});
		});
	};
	request.get(options, callback);
}
parseMyGamesList('Milgwyn');

function timeToBeatAll(listOfGames) {
	for(var index in listOfGames) {
		setTimeout(timeToBeat, 250*index, listOfGames[index]);
	}
	setTimeout(function() {
		console.log('Should be done!');
		// timeToBeatAll(listOfGames[0]);
	}, 250*(listOfGames.length+3));
}

function cleanUpHLTB(gameName) {
	if(typeof gameName === 'string') {
		return gameName.replace(/(&amp;)/g, "&");
	} else {
		return undefined;
	}
}

// var debug
function cleanUpPHPHLTB(gameName) {
	// debug = gameName;
	if(typeof gameName === 'string') {
	// Remove "Edition"?
		return gameName.replace(/-(?=\ )|&(?=\ )|:(?=\ )/g, "").replace(/[&:]/g, " ").replace(" Edition", "").replace(" edition", "").replace(/( )+(?= )/g, "");
	} else {
		return undefined;
	}
}

function sortGames() {
	return listOfGames.filter(function(game) {
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
}

function parseTime(timeString) {	
	if(timeString === 'N/A') {
		return NaN;
	}else if(typeof timeString !== "undefined" && timeString !== "undefined") {
		if((timeString.toLocaleLowerCase().indexOf("mins") > - 1) || (timeString.toLocaleLowerCase().indexOf("minutes") > - 1)) {
			return parseInt(timeString)/60;
		} else {
			return parseInt(timeString);
		}
	} else {
		return undefined;
	}
}

function stripCDATA(input) {
	return input.replace(/(<!--\[CDATA\[)/g, "").replace(/(\]\]-->)/g, "")
}

function timeToBeat(thisGame) {
	var options = {
		url: 'http://howlongtobeat.com/search_main.php',
		formData: {queryString: cleanUpPHPHLTB(thisGame.name), t:'games'}
	}
	var callback = function(err,httpResponse,body) {
		if(err) {
			console.error(err);
			return;
		}
		var $ = cheerio.load(body);
		var gameName = cleanUpHLTB($('li').first().find('a[href^="game.php?"]').last().html());
		if(typeof gameName === 'string') {
			gameName = ent.decode(gameName);
		} else {
			console.warn('No game found for '+thisGame.name+' with id '+thisGame.id+'!');
			return;
		}
		var mainStoryLength = $('li').first().find('div.search_list_details div').first().find('div').first().find('div[class*="time"]').html();
		thisGame.mainStoryLength = parseTime(mainStoryLength);
		if(typeof gameName === 'undefined' || gameName === 'undefined') {
			console.error('Could not find '+thisGame.name+' with id '+thisGame.id+'.');

		// this here cleanup function will cause problems, i promise it
		} else if(cleanUpPHPHLTB(String(thisGame.name).toLocaleLowerCase()) !== cleanUpPHPHLTB(gameName.toLocaleLowerCase())) {
			console.warn('Searched for '+cleanUpPHPHLTB(thisGame.name)+', but found '+cleanUpPHPHLTB(gameName)+' instead.');
			// is this reasonable?
			console.log(gameName+': '+parseTime(mainStoryLength));
		} else if(typeof mainStoryLength === 'undefined' && typeof gameName !== 'undefined') {
			console.error('Searched for '+thisGame.name+', and could not find a length for completion.');
		} else {
			console.log(gameName+': '+parseTime(mainStoryLength));
		}
	}
	request.post(options, callback);
}