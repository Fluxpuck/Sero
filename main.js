/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    Sero is a Discord bot, running on the DiscordJS Library and the Discord Gateway (API).
    Contact info@fluxpuck.com for any information   */

console.log(`
.........................................
.........................................
....███████ ███████ ██████ ..██████ .....
....██      ██      ██   ██ ██    ██ ....
....███████ █████ ..██████  ██ ...██ ....
....     ██ ██    ..██   ██ ██ ...██ ....
....███████ ███████ ██ ..██  ██████  ....
....                   ..   .       .....
.........................................
`)

//require packages
require("dotenv").config();

//setup DiscordJS Client
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    ws: { properties: { $browser: 'Discord Android' } }
});

//set Client dependencies 
client.commands = new Collection();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version

//listen to Client events
const events = require('./utils/EventManager');
events.run(client);

//connect to Discord gateway
client.login(process.env.TOKEN);