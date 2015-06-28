// make the site easily human readable
jQuery('.search_result_row:not(.ds_owned)').remove();

function createGamesList() {
	// cache jQuery collection ('.ds_owned')
	var $temp = jQuery('.ds_owned');
	// create a list for the results
	var list = [];
	jQuery('.ds_owned').each(function(index) {
		// setTimeout(function() {
			// window.open('http://pcgamingwiki.com/api/appid.php?appid='+$temp.filter(':nth('+String(index)+')').data('ds-appid')+'#Multiplayer_types');
			// jQuery.ajax('http://pcgamingwiki.com/api/appid.php?appid='+$temp.filter(':nth('+String(index)+')').data('ds-appid')).done(function(result) {
				// var parser = new DOMParser()
				// var doc = parser.parseFromString(result, 'text/html');
				// console.log(index);
				list[index] = { 'game':  $temp.filter(':nth('+String(index)+')').find('span.title').html(), 'id': $temp.filter(':nth('+String(index)+')').data('ds-appid')};
			// });
		// }, parseInt(index)*200);
	});
	return list;
}

var debug;

function completeGamesList(list) {
	var parser = new DOMParser();
	// var currentDoc;
	for (index in list) {
		setTimeout(function(index) {
			// console.log(index);
			jQuery.ajax('http://pcgamingwiki.com/api/appid.php?appid='+list[index].id).done(function(data){
				var currentDoc = parser.parseFromString(data, 'text/html');
				list[index].players = parsePlayerCount(currentDoc, list, index);
				console.log('Finished '+list[index].game+' (index '+index+') with playercount '+list[index].players);
			});
		}, 200*index, index);
	}
}

function parsePlayerCount(context, list, index) {
	try {
		// debug = context;
		// console.log(context)
		return parseInt(jQuery('a[title="Glossary:Local play"]', context).parent().parent().find('td:nth(1)').html().trim());
	} catch (err) {
		console.warn('App '+list[index].game+' ('+list[index].id+') generated an error during parsing.');
		// console.error(err);
		return 1;
	}	
}

function prettify(list) {
	list.sort(function(a, b) {
		return a.game.localeCompare(b.game);
	});
	for (index in list) {
		// 30 character padding
		var pad = '                              ';
		console.log(list[index].game+pad.substring(0, pad.length - list[index].game.length)+': '+list[index].players);
	}
}
