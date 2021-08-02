//construct packages
const { MessageEmbed } = require('discord.js');

//require embed structures
const { CommandsbyGroup } = require('../../utils/CommandManager');
const { capitalize } = require('../../utils/functions');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //setup the embedded message
    const helpMessage = new MessageEmbed()
        .setTitle('Sero - Algemene Help')
        .setThumbnail('https://cdn.discordapp.com/emojis/605943682734096394.png')
        .setColor('#f6bf21')
        .setFooter(`Sero | Made by Fluxpuck#0001`)

    //filter/sort all commands based on category
    const commandsByGroup = await CommandsbyGroup(client)

    //if no arguments, send general Help message
    if (arguments.length < 1) {

        //general embed description
        helpMessage.setDescription(`${client.user.username} is een bot die voorziet in informatie over de spoorwegen in Nederland. Hieronder volgt een lijst met alle beschikbare commando's.\
        \ *Huidige server prefix is \`${prefix}\`*`)

        //got through all categories
        for (const category of Object.keys(commandsByGroup)) {
            if (category) {
                helpMessage.addFields(
                    {
                        name: `${capitalize(category)}`,
                        value: `
\`\`\`
${commandsByGroup[category].map(c => c.info.name).join('\n')}
\`\`\`
                    `,
                        inline: true
                    }
                )
            }
        }

        //send message
        message.channel.send({ embeds: [helpMessage] })

    }

    //if argument is command, give command help
    if (arguments.length > 0 && client.commands.has(arguments[0])) {
        const commandInfo = client.commands.get(arguments[0]).info

        //change embed variables
        helpMessage.setTitle(`Sero - Commando Help`)
        helpMessage.setFooter(`${capitalize(commandInfo.name)} | Made by Fluxpuck#0001`)

        //command information
        helpMessage.addFields(
            {
                name: `Beschrijving`,
                value: `\`\`\`${commandInfo.desc}\`\`\``,
                inline: false
            },
            {
                name: `Gebruik`,
                value: `\`\`\`${commandInfo.usage.replace('[prefix]', prefix)}\`\`\``,
                inline: true
            },
            {
                name: `Aliassen`,
                value: `\`\`\`${commandInfo.alias.length > 0 ? commandInfo.alias.join(', ') : "None"}\`\`\``,
                inline: true
            },
        )

        //send message
        message.channel.send({ embeds: [helpMessage] })

    }
}

//command information
module.exports.info = {
    name: 'help',
    category: 'misc',
    alias: [],
    usage: '[prefix]help',
    desc: 'Get more information related to all the available commands',
    options: []
}

//command permission groups
module.exports.permissions = [
    "VIEW_CHANNEL",
    "SEND_MESSAGES"
]