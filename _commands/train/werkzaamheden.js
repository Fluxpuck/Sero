//construct API utilities
const { getDisruptions } = require('../../api/getDisruptions');

//construct packages
const { MessageEmbed, MessageButton,
    MessageActionRow, InteractionCollector } = require('discord.js');

//require embed structures
const { sero_emote_white, werk_emote } = require('../../config/embed.json');
const { chunk } = require('../../utils/functions');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //get all actual disruptions
    const Disruptions_actual = await getDisruptions({ type: 'werkzaamheid', actual: true })
    const Disruptions_planned = await getDisruptions({ type: 'werkzaamheid', actual: false })


    /*   Get ACTUAL Train Disruptions and create message   */

    //setup the embedded message
    const A_disruptionMessage = new MessageEmbed()
        .setTitle('Sero - Actuele Werkzaamheden')
        .setDescription(`Hier volgen de **Actuele** werkzaamheden\n[Actuele Situatie](https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor/)`)
        .setThumbnail('https://cdn.discordapp.com/emojis/644829999043444749.png')
        .setColor('#f6bf21')
        .setFooter(`Sero | Made by Fluxpuck#0001`)

    //if map is empty, add message
    if (Disruptions_actual.size <= 0) {
        A_disruptionMessage.addFields(
            {
                name: `\u200B`,
                value: `${sero_emote_white} Er zijn momenteel geen werkzaamheden! \n \u200B`,
                inline: false
            }
        )
    }

    //go over each disruption and create message
    for (const [key, value] of Disruptions_actual.entries()) {
        //go over all crossovers (transfers)
        value.disruption.forEach(disruption => {
            A_disruptionMessage.addFields(
                {
                    name: `\u200B`,
                    value: `**${disruption.title}**
                    ${werk_emote} ${disruption.gevolg} ${(disruption.extrareistijd) ? `*${disruption.extrareistijd}*` : ``}
                    ${(disruption.periode) ? `*${disruption.periode}*` : ``}
                    `,
                    inline: false
                }
            )
        });
    }

    /*   Get PLANNED Train Disruptions and create message   */

    //setup the embedded message
    const P_disruptionMessage = new MessageEmbed()
        .setTitle('Sero - Geplande Werkzaamheden')
        .setDescription(`Hier volgen de **Geplande** werkzaamheden\n[Actuele Situatie](https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor/)`)
        .setThumbnail('https://cdn.discordapp.com/emojis/644829999043444749.png')
        .setColor('#f6bf21')
        .setFooter(`Sero | Made by Fluxpuck#0001`)

    //if map is empty, add message
    if (Disruptions_actual.size <= 0) {
        P_disruptionMessage.addFields(
            {
                name: `\u200B`,
                value: `${sero_emote_white} Er zijn momenteel geen geplande werkzaamheden! \n \u200B`,
                inline: false
            }
        )
    }

    //go over each disruption and create message
    let disruptionArray = []
    for (const [key, value] of Disruptions_planned.entries()) {

        //go over all crossovers (transfers)
        value.disruption.forEach(disruption => {
            disruptionArray.push(
                {
                    name: `\u200B`,
                    value: `**${disruption.title}**
                ${werk_emote} ${disruption.gevolg} ${(disruption.extrareistijd) ? `*${disruption.extrareistijd}*` : ``}
                ${(disruption.periode) ? `*${disruption.periode}*` : ``}
                `,
                    inline: false
                }
            )
        });
    }

    //slice array with disruptions in chunks
    const disruptionChunks = chunk(disruptionArray, 8)
    //put disruption chunks into embed
    disruptionChunks[0].forEach(disruption => {
        P_disruptionMessage.addFields(disruption)
    })


    /*  Setup Action Row for Buttons   */
    let embedButtons = new MessageActionRow()
    embedButtons.addComponents(
        //create and add MessageButtons
        new MessageButton()
            .setStyle('SECONDARY')
            .setLabel('Actueel')
            .setCustomId('actueel')
            .setDisabled(true),

        new MessageButton()
            .setStyle('SECONDARY')
            .setLabel('Gepland')
            .setCustomId('gepland')
            .setDisabled(false)
    )

    //send message and await
    let msg = await message.channel.send({
        embeds: [A_disruptionMessage],
        components: [embedButtons]
    });

    //create filter and button collector
    const filter = (i) => i.user.id == message.author.id
    let collector = new InteractionCollector(client, { message: msg, filter: filter, time: 12000, componentType: "BUTTON" })

    //collect button interactions
    collector.on('collect', async (button) => {
        await button.deferUpdate();

        //add or retract page
        if (button.customId == 'gepland') {
            embedButtons.components[0].setDisabled(false);
            embedButtons.components[1].setDisabled(true);

            //edit page
            msg.edit({
                embeds: [P_disruptionMessage],
                components: [embedButtons]
            });

        }
        if (button.customId == 'actueel') {
            embedButtons.components[0].setDisabled(true);
            embedButtons.components[1].setDisabled(false);

            //edit page
            msg.edit({
                embeds: [A_disruptionMessage],
                components: [embedButtons]
            });
        }
    });

    //when button collection is over, disable buttons
    collector.on('end', collected => {
        //disable both buttons
        embedButtons.components[0].setDisabled(true)
        embedButtons.components[1].setDisabled(true)
        //edit page
        msg.edit({
            components: [embedButtons]
        });
    });

}


//command information
module.exports.info = {
    name: 'werkzaamheden',
    category: 'train',
    alias: ['werk'],
    usage: '[prefix]werkzaamheden',
    reply: 'Hier volgen de werkzaamheden.',
    desc: 'Bekijk de actuele of geplande werkzaamheden',
    options: []
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR"
]