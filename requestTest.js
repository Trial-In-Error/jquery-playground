var request = require('request');
var cheerio = require('cheerio');
var ent = require('ent');
var $, httpResponse;

var options = {
	url: 'http://howlongtobeat.com/search_main.php',
	formData: {queryString: "The Witcher", t:'games'}
}

var callback = function(err,httpResponse,body) {
	$ = cheerio.load(body);
	var gameName = /*cleanUpHLTB*/($('li').first().find('a[href^="game.php?"]').last().html());
	var mainStoryLength = $('li').first().find('div.search_list_details div').first().find('div').first().find('div[class*="time"]').html();
	thisGame.mainStoryLength = /*parseTime*/(mainStoryLength);
	if(typeof gameName === 'undefined' || gameName === 'undefined') {
		console.error('Could not find '+thisGame.name+' with id '+thisGame.id+'.');
	} else if(String(thisGame.name).toLocaleLowerCase() !== gameName.toLocaleLowerCase()) {
		console.warn('Searched for '+thisGame.name+', but found '+gameName+' instead.');
	} else if(typeof mainStoryLength === 'undefined' && typeof gameName !== 'undefined') {
		console.error('Searched for '+thisGame.name+', and could not find a length for completion.');
	} else {
		console.log(gameName+': '+mainStoryLength);
	}
}
request.post(options, callback);