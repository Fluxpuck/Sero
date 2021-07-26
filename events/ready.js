//construct Sero utilities
const ClientManager = require('../utils/ClientManager');
const DataManager = require('../utils/DataManager');
const { logCommandTable } = require('../utils/ConsoleManager');

//construct packages and set path to command directory
const { join } = require('path');
const wait = require('util').promisify(setTimeout);
const commandFolder = join(__dirname, '..', '_commands');

//exports event
module.exports = async (client) => {

    //set bot activity
    await ClientManager.setSeroActivity(client);

    //load all commands
    async function fileLoader(fullFilePath) {
        if (fullFilePath.endsWith(".js")) {
            let props = require(fullFilePath)
            client.commands.set(props.info.name, props)
        }
    }

    //go through all folders and get the commands
    await ClientManager.getSeroCommands(commandFolder, { dealerFunction: fileLoader })
    logCommandTable(client.commands) //log all commands to console.table
    console.log(` > Loaded ${Array.from(client.commands.keys()).length} command${Array.from(client.commands.keys()).length > 1 ? 's' : ''} successfully.`)

    //check all Databases per Guild
    await Array.from(client.guilds.cache.values()).forEach(async guild => {
        DataManager.updateGuildinfo(guild); //update Guildinfo Table
        DataManager.updateCommandPermissions(guild, client.commands); //update Command Permissions Table   
    })

    await wait(1500) //wait for all items to be loaded
    console.log(`───────────────────────────────────────────────`)
    console.log(`Logged in as ${client.user.tag}!`);

}