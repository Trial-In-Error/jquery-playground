# jquery-playground
A script for scraping your steam library and [howlongtobeat](http://howlongtobeat.com/). Exports to CSV for easy editing / sorting / filtering in Excel, or to JSON for chaining into other services. To use it, [install node.js](https://nodejs.org/download/). Open a command prompt, navigate to the project directory, and then type `node hltb-node.js`. If it doesn't run, try `npm install`. The script requires your Steam profile to be public, and you will need to know your steam profile ID (not your account name, profile name, or profile URL). See [this discussion](http://steamcommunity.com/discussions/forum/1/627457521160186984/) for a brief overview of the differences.


Known Problems:
===========================

Wrong game found:
---------------------------
* Monaco finds Ayrton Senna's Super Monaco GP II instead
* All the Civ games are super messed up

Game not found, but exists:
---------------------------
* Please, Don't Touch Anything
* Brutal Legend

Other:
---------------------------
* Stanley Parable?
* Walking Dead: Season 2?
* The Ship?
