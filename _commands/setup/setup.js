//require DiscordJS
const { MessageEmbed, MessageActionRow, MessageButton,
    MessageSelectMenu, InteractionCollector } = require('discord.js');

//database connection
const Database = require('../../config/database');

//require embed structures
const { getComponentInteraction } = require('../../utils/CollectionManager');

//require embed structures
const { failure_emote, sero_emote_white,
    setup_one, setup_two, setup_three, setup_four } = require('../../config/embed.json')

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //setup the embedded message
    const messageEmbed = new MessageEmbed()
        .setTitle('Sero - Command Setup')
        .setDescription(`\`\`\`Welkom in de interactieve setup. In deze interactieve setup krijg je de mogelijkheid om een commando in te stellen voor specifieke rollen en tekst-kanalen. Klik op "Start Setup" en volg de stappen.\`\`\``)
        .setThumbnail('https://cdn.discordapp.com/emojis/644829999043444749.png')
        .setColor('#f6bf21')
        .setFooter(`Command Setup | Made by Fluxpuck#0001`)

    /*  Setup Action Row for Buttons   */
    let startButtons = new MessageActionRow()
    startButtons.addComponents(
        //create and add MessageButtons
        new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('> Start Setup')
            .setCustomId('start')
            .setDisabled(false)
    )

    //send message to channel
    let msg = await message.channel.send({
        embeds: [messageEmbed],
        components: [startButtons]
    })

    /* ---------- ---------- ---------- */


    /* 
    
    1. Information
    2. Choose a command
    3. Choose the desired role(s) for this command
    4. Choose the desired channel(s) for this command 
    5. Finilize the command

    */

}


//command information
module.exports.info = {
    name: 'setup',
    category: 'setup',
    alias: [],
    usage: '[prefix]command',
    desc: 'Interactive module to setup each individual command',
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR "
]