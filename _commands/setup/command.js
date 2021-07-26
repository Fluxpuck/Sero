//construct packages
const { MessageEmbed, MessageActionRow, MessageButton,
    MessageSelectMenu, InteractionCollector } = require('discord.js');
const Database = require('../../config/database');

//require embed structures
const { getComponentInteraction } = require('../../utils/CollectionManager');

//require embed structures
const { failure_emote, sero_emote_white,
    setup_one, setup_two, setup_three, setup_four } = require('../../config/embed.json')

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //construct timer
    const timer = 1000 * 60 * 5

    //setup the embedded message
    const messageEmbed = new MessageEmbed()
        .setTitle('Sero - Command Setup')
        .setDescription(`\`\`\`Welkom in de interactieve command setup. In deze interactieve setup krijg je de mogelijkheid om een commando in te stellen voor specifieke rollen en tekst-kanalen. Klik op "Start Setup" en volg de stappen.\`\`\``)
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

    /* [#1] - Collect Reponse */
    let filter = (i) => i.customId === 'start' && i.user.id == message.author.id
    let Collector = await getComponentInteraction(msg, timer, filter);
    if (Collector === false) { //if no response is given in the timer 
        //disable Interactions
        startButtons.components.forEach(comp => { comp.setDisabled(true); });
        //alter embed
        messageEmbed.fields = []
        delete messageEmbed.description
        delete messageEmbed.thumbnail
        messageEmbed.addFields([{ name: "\u200B", value: `${failure_emote} **Timer** is afgelopen en je kan niet meer reageren. Voer het commando opnieuw uit en reageer optijd. \n \u200B`, inline: false }])
        messageEmbed.setColor("#D51414");
        //edit Message and buttons
        await msg.edit({ embeds: [messageEmbed], components: [startButtons] })
        return;
    }

    //alter messageEmbed
    messageEmbed.fields = []
    messageEmbed.setDescription(`**Stap 1** ${sero_emote_white} Welk command wil je (opnieuw) instellen?`)
    // messageEmbed.setThumbnail(setup_one)
    messageEmbed.setFooter(`Stap 1 van 4 | Made by Fluxpuck#0001`)

    //create and add MessageMenu
    let commandDrop = new MessageSelectMenu()
        .setCustomId(`command-menu`)
        .setPlaceholder(`Selecteer het command dat je wilt instellen`)
        .setMinValues(1)
        .setMaxValues(1)

    //collect all commands
    client.commands.forEach(command => {
        if (command.info.category != '') {
            commandDrop.addOptions(
                {
                    label: command.info.name,
                    value: command.info.name,
                    description: command.info.short
                }
            )
        }
    });

    /*  Setup Action Row for Menu   */
    let commandMenu = new MessageActionRow()
    commandMenu.addComponents(commandDrop)

    //edit message and add Menu
    await msg.edit({ embeds: [messageEmbed], components: [commandMenu] })

    /* [#2] - Collect Reponse */
    filter = (i) => i.customId === 'command-menu' && i.user.id == message.author.id
    Collector = await getComponentInteraction(msg, timer, filter);
    if (Collector === false) { //if no response is given in the timer 
        //disable Interactions
        commandMenu.components.forEach(comp => { comp.setDisabled(true); });
        //alter embed
        messageEmbed.fields = []
        delete messageEmbed.thumbnail
        messageEmbed.addFields([{ name: "\u200B", value: `${failure_emote} **Timer** is afgelopen en je kan niet meer reageren. Voer het commando opnieuw uit en reageer optijd. \n \u200B`, inline: false }])
        messageEmbed.setColor("#D51414");
        //edit Message and buttons
        await msg.edit({ embeds: [messageEmbed], components: [commandMenu] })
        return;
    }

    //set commandValue
    const commandValue = Collector.values[0]

    //alter messageEmbed
    messageEmbed.fields = []
    messageEmbed.setDescription(`**Stap 2** ${sero_emote_white} Wie mag of mogen het commando **${commandValue}** gebruiken?`)
    // messageEmbed.setThumbnail(setup_two)
    messageEmbed.setFooter(`Stap 2 van 4 | Made by Fluxpuck#0001`)

    //collect all guildRoles
    let guildRoles = message.guild.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(r => [r.name, r.id])
    if (guildRoles.length > 25) {
        guildRoles.slice(0, 25)
    }
    if (!guildRoles) guildRoles = "Oops, er is iets fout gegaan.";

    //create and add MessageMenu
    let roleDrop = new MessageSelectMenu()
        .setCustomId(`role-menu`)
        .setPlaceholder(`Selecteer één of meerdere rollen`)
        .setMinValues(1)
        .setMaxValues(25)

    //collect all commands
    guildRoles.forEach((role, i) => {
        if (i < 26) {
            roleDrop.addOptions(
                {
                    label: role[0],
                    value: role[0],
                    description: role[1]
                }
            )
        }
    });

    /*  Setup Action Row for Menu   */
    let roleMenu = new MessageActionRow()
    roleMenu.addComponents(roleDrop)

    //edit message and add Menu
    await msg.edit({ embeds: [messageEmbed], components: [roleMenu] })

    /* [#3] - Collect Reponse */
    filter = (i) => i.customId === 'role-menu' && i.user.id == message.author.id
    Collector = await getComponentInteraction(msg, timer, filter);
    if (Collector === false) { //if no response is given in the timer 
        //disable Interactions
        roleMenu.components.forEach(comp => { comp.setDisabled(true); });
        //alter embed
        messageEmbed.fields = []
        delete messageEmbed.thumbnail
        messageEmbed.addFields([{ name: "\u200B", value: `${failure_emote} **Timer** is afgelopen en je kan niet meer reageren. Voer het commando opnieuw uit en reageer optijd. \n \u200B`, inline: false }])
        messageEmbed.setColor("#D51414");
        //edit Message and buttons
        await msg.edit({ embeds: [messageEmbed], components: [roleMenu] })
        return;
    }

    //set roleValues
    const roleValues = Collector.values

    //alter messageEmbed
    messageEmbed.fields = []
    messageEmbed.setDescription(`**Stap 3** ${sero_emote_white} In welk of welke tekst-kanalen mag het commando **${commandValue}** gebruikt worden?`)
    // messageEmbed.setThumbnail(setup_three)
    messageEmbed.setFooter(`Stap 3 van 4 | Made by Fluxpuck#0001`)

    //collect all guildChannels
    let guildChannels = message.guild.channels.cache
        .sort((a, b) => b.position - a.position)
        .filter(c => c.type == 'text')
        .map(c => [c.name, c.id])
    if (guildChannels.length > 25) guildChannels.slice(0, 25)
    if (!guildChannels) guildChannels = "Oops, er is iets fout gegaan.";

    console.log(guildChannels.length)

    //create and add MessageMenu
    let channelDrop = new MessageSelectMenu()
        .setCustomId(`channel-menu`)
        .setPlaceholder(`Selecteer één of meerdere tekst-kanalen`)
        .setMinValues(1)
        .setMaxValues(25)

    //collect all commands
    guildChannels.forEach((channel, i) => {
        if (i < 26) {
            channelDrop.addOptions(
                {
                    label: channel[0],
                    value: channel[0],
                    description: channel[1]
                }
            )
        }
    });

    /*  Setup Action Row for Menu   */
    let channelMenu = new MessageActionRow()
    channelMenu.addComponents(channelDrop)

    //edit message and add Menu
    await msg.edit({ embeds: [messageEmbed], components: [channelMenu] })

    /* [#4] - Collect Reponse */
    filter = (i) => i.customId === 'channel-menu' && i.user.id == message.author.id
    Collector = await getComponentInteraction(msg, timer, filter);
    if (Collector === false) { //if no response is given in the timer 
        //disable Interactions
        channelMenu.components.forEach(comp => { comp.setDisabled(true); });
        //alter embed
        messageEmbed.fields = []
        delete messageEmbed.thumbnail
        messageEmbed.addFields([{ name: "\u200B", value: `${failure_emote} **Timer** is afgelopen en je kan niet meer reageren. Voer het commando opnieuw uit en reageer optijd. \n \u200B`, inline: false }])
        messageEmbed.setColor("#D51414");
        //edit Message and buttons
        await msg.edit({ embeds: [messageEmbed], components: [channelMenu] })
        return;
    }

    //set channelValues
    const channelValues = Collector.values

    //alter messageEmbed
    messageEmbed.fields = []
    messageEmbed.setDescription(`**Stap 4** ${sero_emote_white} Bevestig de volgende instellingen voor het commando **${commandValue}**`)
    messageEmbed.addFields(
        { name: `Rollen`, value: `\`\`\`${roleValues.join(', ')}\`\`\``, inline: true },
        { name: `Tekst-kanalen`, value: `\`\`\`${channelValues.join(', ')}\`\`\``, inline: true },
    )
    // messageEmbed.setThumbnail(setup_four)
    messageEmbed.setFooter(`Stap 4 van 4 | Made by Fluxpuck#0001`)

    /*  Setup Action Row for Buttons   */
    let finishButtons = new MessageActionRow()
    finishButtons.addComponents(
        //create and add MessageButtons
        new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Finish')
            .setCustomId('finish')
            .setDisabled(false),
        new MessageButton()
            .setStyle('DANGER')
            .setLabel('Cancel')
            .setCustomId('cancel')
            .setDisabled(false)
    )

    //send message to channel
    msg = await message.channel.send({
        embeds: [messageEmbed],
        components: [finishButtons]
    })

    /* [#5] - Collect Reponse */
    filter = (i) => i.user.id == message.author.id
    Collector = await getComponentInteraction(msg, timer, filter);
    if (Collector === false) { //if no response is given in the timer 
        //disable Interactions
        finishButtons.components.forEach(comp => { comp.setDisabled(true); });
        //alter embed
        messageEmbed.fields = []
        delete messageEmbed.thumbnail
        messageEmbed.addFields([{ name: "\u200B", value: `${failure_emote} **Timer** is afgelopen en je kan niet meer reageren. Voer het commando opnieuw uit en reageer optijd. \n \u200B`, inline: false }])
        messageEmbed.setColor("#D51414");
        //edit Message and buttons
        await msg.edit({ embeds: [messageEmbed], components: [finishButtons] })
        return;
    }

    //check if setup is cancelled
    if (Collector.customId == 'cancel') {
        //disable Interactions
        finishButtons.components.forEach(comp => { comp.setDisabled(true); });
        //alter embed
        messageEmbed.fields = []
        delete messageEmbed.description
        delete messageEmbed.thumbnail
        messageEmbed.addFields([{ name: "\u200B", value: `${failure_emote} De setup is **geannuleerd**. \n \u200B`, inline: false }])
        messageEmbed.setColor("#D51414");
        //edit Message and buttons
        await msg.edit({ embeds: [messageEmbed], components: [finishButtons] })
        return;
    }

    //if setup is finished, push to database
    if (Collector.customId == 'finish') {

        messageEmbed.fields = []
        messageEmbed.setDescription(`**Klaar!** Het commando **${commandValue}** is nu ingesteld met de volgende instellingen!`)
        messageEmbed.addFields(
            { name: `Rollen`, value: `\`\`\`${roleValues.join(', ')}\`\`\``, inline: true },
            { name: `Tekst-kanalen`, value: `\`\`\`${channelValues.join(', ')}\`\`\``, inline: true },
        )
        messageEmbed.setThumbnail('https://cdn.discordapp.com/emojis/644829999043444749.png')
        messageEmbed.setFooter(`Command Setup | Made by Fluxpuck#0001`)

        //edit Message
        await msg.edit({ embeds: [messageEmbed], components: [] })

        //setup commandPermissions and push to Database
        const commandPermissions = { role_access: ``, chnl_access: `` }
        Database.query(`INSERT INTO ${message.guild.id}_permissions WHERE cmd_name = ${commandValue} SET ?`, commandPermissions, function (err, result) {
            if (err) { console.log(err) } //create error
        })

    }



    console.log(commandValue, roleValues, channelValues)




    //CREATE A FIX FOR THE DROPDOWN LIMIT OF 25





}


//command information
module.exports.info = {
    name: 'command',
    category: 'setup',
    alias: [],
    usage: '[prefix]command',
    desc: 'Interactive module to setup each individual command',
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR "
]