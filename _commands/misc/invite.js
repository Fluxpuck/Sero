//construct packages
const { MessageEmbed } = require('discord.js');
//construct utilities
const { getUser } = require('../../utils/Resolver');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //construct invite URL
    const inventation = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot+applications.commands`

    //get user details
    const member = await getUser(message.guild, message.author.id);

    //setup the embedded message
    const embedMessage = new MessageEmbed()
        .setTitle(`${client.user.username}`)
        .setDescription(`Thank you for your interest in ${client.user.username}! Invite the bot by clicking this [inventation](${inventation})`)
        .addFields(
            { name: `Support Server`, value: `For support, join my [Support server](https://discord.gg/WcwNtAA)`, inline: true },
            { name: `Github Page`, value: `Checkout my [Github page](https://github.com/Fluxpuck)`, inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/605943682734096394.png')
        .setColor('#f6bf21')
        .setFooter(`${client.user.username} | Made by Fluxpuck#0001`)

    //send embedded message to user through DM
    member.send({ embeds: [embedMessage] })

}


//command information
module.exports.info = {
    name: 'invite',
    category: 'misc',
    alias: ['inv'],
    usage: '[prefix]invite',
    desc: 'Sends a DM (direct message) with the inventation link for Sero',
    options: []
}

//command permission groups
module.exports.permissions = [
    "VIEW_CHANNEL",
    "SEND_MESSAGES"
]