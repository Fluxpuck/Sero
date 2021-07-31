//construct API utilities
const { getStations } = require('../../api/getStations');
const { getDepartures } = require('../../api/getDepartures');

//construct packages
const { MessageEmbed, MessageButton,
    MessageActionRow, InteractionCollector } = require('discord.js');
const fs = require('fs');

//require bot utilities
const { getComponentInteraction } = require('../../utils/CollectionManager');
const { ErrorMessage, capitalize, chunk } = require('../../utils/functions');
const { work_emote, failure_emote } = require('../../config/embed.json');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //if no arguments, return error message
    if (arguments.length < 1) return ErrorMessage(message, 'Er is geen station ingegeven.', 6000)

    //message processor
    let messageArr = arguments.toString()
    let splitArr = messageArr.split(">")
    let stationName = capitalize(splitArr[0].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())

    //check for stations with -
    if (stationName.indexOf('-') > -1) {
        let fromArr = stationName.split("-")
        let tempFrom = capitalize(fromArr[0]) + "-" + capitalize(fromArr[1])
        stationName = tempFrom.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }

    //check for exceptions
    function checkStationName(station) { return station == stationName }

    //exception handler
    let station_exc_json = JSON.parse(fs.readFileSync('./config/station_exceptions.json', "utf8"))
    let exceptions = station_exc_json.exception

    //loop through all exceptions
    for (i in exceptions) {
        let exception = exceptions[i]
        let wrong = exception.false

        //if exception found, get correct station name
        if (wrong.some(checkStationName) === true) {
            let good = exception.correct
            stationName = good
        }
    }

    //get train station information, including the station code
    const Stations = await getStations([stationName])
    const Station = Stations.get(stationName).station

    //check if station is found
    if (Station == undefined) return ErrorMessage(message, 'Het station is niet gevonden, controlleer of het volledig en goed geschreven is en probeer opnieuw.', 6000);

    //get all the station departure information
    const Departures = await getDepartures(Station.code, 20)

    //check if object is not a map, raise error
    if (Object.getPrototypeOf(Departures) != Map.prototype) {
        return ErrorMessage(message, `**Error ${Departures.code}** De vertrektijden konden niet opgehaald worden, probeer het op een later tijdstip nogmaals`, 6000)
    }

    //select station departure
    const Departure = Departures.get(Station.code).departures

    //go over each trip values and create an embedded message
    let departureArray = []
    for (const [key, value] of Departure.entries()) {

        //go over all route stations
        let routestations = []
        value.routestations.forEach(station => {
            routestations.push(station.mediumName)
        });

        //only add trains that are not overdue to depart and not cancelled
        if (value.timeFromNow >= 0 && value.cancelled == false) {
            departureArray.push(
                {
                    name: `\u200B`,
                    value: `${work_emote} **${value.departtime}** ${(value.delay > 0) ? `+${value.delay}` : ``} - **${value.direction}** - **Spoor ${value.departTrack}**
                    \`${value.timeFromNow} min.\` \u200B ${value.train} ${value.trainname} ${value.traincode} (${value.departStatus})
                    ${(routestations.length >= 1) ? `*via ${routestations.join(', ')}*` : ``}
                    ${(value.messages.length >= 1) ? `*${value.messages[0].message}*` : ``}
                    `
                }
            )
        }

        //add cancelled departures
        if (value.cancelled == true) {
            departureArray.push(
                {
                    name: `\u200B`,
                    value: `${failure_emote} **${value.departtime}** ${(value.delay > 0) ? `+${value.delay}` : ``} - **${value.direction}** - **Spoor ${value.departTrack}**
                    ${value.train} ${value.trainname} ${value.traincode}
                    ${(value.messages.length >= 1) ? `*${value.messages[0].message}*` : ``}`
                }
            )
        }
    }

    //slice array with departures in chunks
    const departureChunks = chunk(departureArray, 5)

    //put departure chunks into embed
    let departureMessage_Array = []
    for (i in departureChunks) {

        //setup the embedded message
        const departureMessage = new MessageEmbed()
            .setTitle('Sero - Vertrektijden')
            .setDescription(`Vertrektijden station **${Station.namen.lang}**`)
            .setThumbnail('https://cdn.discordapp.com/emojis/644829999043444749.png')
            .setColor('#f6bf21')
            .setFooter(`Pagina ${parseInt(i) + 1} van ${departureChunks.length} | Made by Fluxpuck#0001`)

        departureChunks[i].forEach(departure => {
            departureMessage.addFields(departure)
        })

        //push each departure message chunk into array
        departureMessage_Array.push(departureMessage)

    }

    /*  Setup Action Row for Buttons   */
    let embedButtons = new MessageActionRow()
    embedButtons.addComponents(
        //create and add MessageButtons
        new MessageButton()
            .setStyle('SECONDARY')
            .setLabel('< Vorige')
            .setCustomId('minus')
            .setDisabled(true),

        new MessageButton()
            .setStyle('SECONDARY')
            .setLabel('Volgende >')
            .setCustomId('plus')
            .setDisabled(false)
    )

    //send message and await
    let page = 0, max_page = departureChunks.length - 1
    let msg = await message.channel.send({
        embeds: [departureMessage_Array[page]],
        components: [embedButtons]
    });


    //create filter and button collector
    const filter = (i) => i.user.id == message.author.id
    let collector = new InteractionCollector(client, { message: msg, filter: filter, time: 12000, componentType: "BUTTON" })

    collector.on(`collect`, async (button) => {
        await button.deferUpdate();

        //add or retract page
        if (button.customId == 'plus') (page >= max_page) ? max_page : page++
        if (button.customId == 'minus') (page <= 0) ? 0 : page--

        //check page and alter buttons
        switch (page) {
            case 0:
                embedButtons.components[0].setDisabled(true)
                break;
            case max_page:
                embedButtons.components[1].setDisabled(true)
                break;
            default:
                embedButtons.components[0].setDisabled(false)
                embedButtons.components[1].setDisabled(false)
        }

        //edit page
        msg.edit({
            embeds: [departureMessage_Array[page]],
            components: [embedButtons]
        });
    })

    collector.on(`end`, async (collected) => {
        //disable both buttons
        embedButtons.components[0].setDisabled(true)
        embedButtons.components[1].setDisabled(true)
        //edit page
        msg.edit({
            embeds: [departureMessage_Array[page]],
            components: [embedButtons]
        });
    })

}

//command information
module.exports.info = {
    name: 'vertrek',
    category: 'train',
    alias: ['departure', 'station'],
    usage: '[prefix]vertrek',
    desc: 'Bekijk de vertrektijden per station',
    options: [{
        name: 'station',
        type: 'STRING',
        description: 'Het station waarvan je de vertrektijden wilt.',
        required: true,
    }]
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR"
]