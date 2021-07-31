//exports event
module.exports = async (client, interaction) => {

    //check if interaction is application command
    if (interaction.type === 'APPLICATION_COMMAND') {

        //filter the interaction input
        const { channelId, guildId, user, guild } = interaction
        const { commandName, commandId } = interaction
        const input = interaction.options

        //get Guild Prefix
        const prefix = await GuildManager.getGuildPrefix(guild);


        // console.log(channelId, guildId)
        // console.log(commandName, commandId)

        // console.log(user)
        // console.log(guild)

        // console.log(input)



    }
}