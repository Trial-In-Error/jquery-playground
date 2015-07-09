function test() {
	timeToBeatAll(listOfGames.slice(0,1));
}

function timeToBeat(thisGame) {
	var payload = querystring.stringify({'querystring': "Sunless+Sea", 't': 'games'});
	// console.log(thisGame)
	var options = ({
		host: "howlongtobeat.com",
		path: '/search_main.php',//+querystring.stringify({'queryString': cleanUpPHPHLTB(thisGame.name), 't': 'games', 'sorthead': 'name', 'sortd': 'Normal Order', 'plat': 'PC', 'detail': '0'}),
		method: "POST",
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(payload)
		}
	});
	console.log(options.path);
	var callback = function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		})
		response.on('end', function() {
			var $ = cheerio.load(data);
			debug = data
			var gameName = cleanUpHLTB($('li').first().find('a[href^="game.php?"]').last().html());
			var mainStoryLength = $('li').first().find('div.search_list_details div').first().find('div').first().find('div[class*="time"]').html();
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
		});
	};
	var req = http.request(options, callback);
	// var payload = querystring.stringify({'queryString': cleanUpPHPHLTB(thisGame.name), 't': 'games', 'sorthead': 'name', 'sortd': 'Normal Order', 'plat': 'PC', 'detail': '0'})
	
	console.log(payload)
	req.write(payload);
	req.end();
	// jQuery('div#suggestionsList_main li:first ', currentDoc);
}