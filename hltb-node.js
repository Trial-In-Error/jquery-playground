var DOMParser = require('xmldom').DOMParser,
	parser = new DOMParser(),
	ent = require('ent'),
	cheerio = require('cheerio'),
	request = require('request'),
	fs = require('fs'),
	process = require('process'),
	prompt = require('prompt');

var listOfGames;

prompt.start();
promptUseExistingFile();

function promptUseExistingFile() {
	prompt.get({
		properties: {
			useFile: {
				description: "Import existing JSON file?"
			}
		}
	}, function(err, result) {
		var res = result.useFile.toLocaleLowerCase();
		if(res === "y" || res === "yes" || res === "true" || res === "t" || res === "file") {
			promptFileName();
		} else if(res === "n" || res === "no" || res === "false" || res === "f" || res === "steam") {
			promptUserName();
		} else {
			console.log('Input not recognized! Please respond with "yes" or "no".');
			promptUseExistingFile();
		}
	});
}

function promptFileName() {
	prompt.get({
		properties: {
			fileName: {
				description: "What is the file's name?"
			}
		}
	}, function(err, result) {
		try {
			loadJSONFromFile(promptTimeToBeat);
		} catch (err) {
			console.log(err);
			promptFileName();
		}
	});
}

function promptTimeToBeat() {
	prompt.get({
		properties: {
			fetch: {
				description: "Fetch the time to beat for each game?"
			}
		}
	}, function(err, result) {
		var res = result.fetch.toLocaleLowerCase();
		if(res === "y" || res === "yes" || res === "true" || res === "t" || res === "file") {
			timeToBeatAll(listOfGames, promptSaveAsJSON);
		} else if(res === "n" || res === "no" || res === "false" || res === "f" || res === "steam") {
			promptSaveAsJSON();
		} else {
			console.log('Input not recognized! Please respond with "yes" or "no".');
			promptTimeToBeat();
		}
	});
}

function promptSaveAsJSON() {
	prompt.get({
		properties: {
			save: {
				description: "Save the results as a JSON file?"
			}
		}
	}, function(err, result) {
		var res = result.save.toLocaleLowerCase();
		if(res === "y" || res === "yes" || res === "true" || res === "t" || res === "file") {
			exportJSONToFile(listOfGames, promptSaveAsCSV);
		} else if(res === "n" || res === "no" || res === "false" || res === "f" || res === "steam") {
			promptSaveAsCSV();
		} else {
			console.log('Input not recognized! Please respond with "yes" or "no".');
			promptSaveAsJSON();
		}
	});
}

function quit() {
	process.exit();
}

function promptSaveAsCSV() {
	prompt.get({
		properties: {
			save: {
				description: "Save the results as a CSV file?"
			}
		}
	}, function(err, result) {
		var res = result.save.toLocaleLowerCase();
		if(res === "y" || res === "yes" || res === "true" || res === "t" || res === "file") {
			exportToCSV(quit);
		} else if(res === "n" || res === "no" || res === "false" || res === "f" || res === "steam") {
			process.exit();
		} else {
			console.log('Input not recognized! Please respond with "yes" or "no".');
			promptSaveAsCSV();
		}
	});
}

function promptUserName() {
	prompt.get({
		properties: {
			username: {
				description: "What is your steam user ID?"
			}
		}
	}, function(err, result) {
		parseMyGamesList(result.username, promptTimeToBeat);
	});
}

function cleanUpSteam(gameName) {
	return gameName.replace(/[∞®™]/g, "").replace(/æ/g, "ae");
}

function parseMyGamesList(userAccountName, incomingCallback) {
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
		incomingCallback();
	};
	request.get(options, callback);
}
// parseMyGamesList('Milgwyn');

function timeToBeatAll(listOfGames, callback) {
	for(var index in listOfGames) {
		setTimeout(timeToBeat, 250*index, listOfGames[index]);
	}
	setTimeout(function() {
		console.log('Should be done!');
		// timeToBeatAll(listOfGames[0]);
		callback();
	}, 250*(listOfGames.length+10));
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

function parseToCSV(listOfGames) {
	string = "Game Name, Steam ID, Time to Beat\n";
	for(var game of listOfGames) {
		string += "\""+game.name+"\", "+game.id+", "+game.mainStoryLength+"\n";
	}
	return string.slice(0, -1);
}

function exportToCSV(callback) {
	fs.writeFile('listOfGames.csv', parseToCSV(listOfGames), function(err) {
		if(err) throw err;
		console.log('File written: listOfGames.csv');
		if(callback) {
			callback();	
		}
	});
}

function exportJSONToFile(listOfGames, callback) {
	fs.writeFile('listOfGames.json', JSON.stringify(listOfGames), function(err) {
		if(err) throw err;
		console.log('File written: listOfGames.json');
		if(callback) {
			callback();
		}
	});
}

function loadJSONFromFile(callback) {
	fs.readFile('listOfGames.json', 'utf8', function (err, data) {
		if (err) throw err;
		listOfGames = JSON.parse(data);
		if(callback) {
			callback();
		}
	});
}

function parseTime(timeString) {	
	if(timeString === 'N/A') {
		return NaN;
	} else if(typeof timeString !== "undefined" && timeString !== "undefined") {
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