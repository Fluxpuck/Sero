//construct utilities
const GuildManager = require('../utils/GuildManager');
const Resolver = require('../utils/Resolver');
//require packages
const wait = require('util').promisify(setTimeout);

//exports event
module.exports = async (client, interaction) => {

    //check if interaction is application command
    if (!interaction.isCommand()) return;

    //filter the interaction input
    const { channelId, guildId, user, guild } = interaction
    const { commandName, commandId } = interaction
    const input = interaction.options

    //create message arguments
    let messageArgs = []
    for (const [key, value] of input.entries()) {
        messageArgs.push(value.value)
    }

    //get command detauls
    const prefix = await GuildManager.getGuildPrefix(guild); //get Guild Prefix
    const member = await Resolver.getUser(guild, user.id); //get Member details
    const channel = await Resolver.getChannels(guild, channelId, 'all');
    const message = { channel: channel[0], author: member, slashinteraction: true }

    //get the client command
    const commandFile = client.commands.get(commandName)
    if (commandFile) {

        //get Command Permissions for this Guild
        const permissions = await GuildManager.getGuildCommandPermissions(guild, commandFile.info.name)
        let permissionCheck = await GuildManager.checkGuildCommandPermissions(guild, member, channelId, permissions)

        //check if user has permission to use the command
        if (permissionCheck = true) await interaction.reply(commandFile.info.reply);

        //if the user has no permission to use the command, deny access
        if (permissionCheck == false) {
            await interaction.reply('You do not have permission to use this command!');
            await wait(4000)
            await interaction.deleteReply();
        }

        //if the user has access, run the command and delete reply
        if (permissionCheck == true) {
            await commandFile.run(client, message, messageArgs.join('>'), prefix, permissions);
            await interaction.deleteReply();
        }

    }
}