//construct API utilities
const { getDisruptions } = require('../../api/getDisruptions');

//construct packages
const { MessageEmbed } = require('discord.js');

//require embed structures
const { storing_emote, sero_emote_white } = require('../../config/embed.json');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //get all actual disruptions
    const Disruptions = await getDisruptions({ type: 'storing', actual: true })

    //setup the embedded message
    const disruptionMessage = new MessageEmbed()
        .setTitle('Sero - Verstoringen')
        .setDescription(`[Actuele Situatie](https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor/)`)
        .setThumbnail('https://cdn.discordapp.com/emojis/644829999043444749.png')
        .setColor('#f6bf21')
        .setFooter(`Sero | Made by Fluxpuck#0001`)

    //go over each disruption and create message
    for (const [key, value] of Disruptions.entries()) {
        //go over all crossovers (transfers)
        value.disruption.forEach(disruption => {
            disruptionMessage.addFields(
                {
                    name: `\u200B`,
                    value: `**${disruption.title}** | ${disruption.faselabel} (${disruption.prioriteit})
                    ${storing_emote} ${disruption.oorzaak}
                    ${(disruption.verwachting) ? `*${disruption.verwachting}*` : ``}
                    ${(disruption.gevolg) ? `*${disruption.gevolg}*` : ``}
                    `,
                    inline: false
                }
            )
        });
    }

    //if map is empty, add message
    if (Disruptions.size <= 0) {
        disruptionMessage.addFields(
            {
                name: `\u200B`,
                value: `${sero_emote_white} Er zijn momenteel geen verstoringen! \n \u200B`,
                inline: false
            }
        )
    }

    console.log(disruptionMessage)

    //send message
    message.channel.send({
        embeds: [disruptionMessage]
    })

}


//command information
module.exports.info = {
    name: 'storingen',
    category: 'train',
    alias: ['storing', 'verstoring'],
    usage: '[prefix]storingen',
    desc: 'Bekijk de actuele verstoringen',
    options: []
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR"
]