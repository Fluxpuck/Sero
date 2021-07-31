//construct API utilities
const { getStations } = require('../../api/getStations');
const { getTravelInformation } = require('../../api/getTravelInformation');

//construct packages
const { MessageEmbed, MessageButton,
    MessageActionRow, InteractionCollector } = require('discord.js');
const fs = require('fs');

//require embed structures
const { ErrorMessage, capitalize } = require('../../utils/functions');
const { storing_emote, werk_emote } = require('../../config/embed.json');

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {

    //if no arguments, return error message
    if (arguments.length < 1) return ErrorMessage(message, 'Er is geen vertrek- en aankomst station ingegeven.', 6000)

    //message processor
    let messageArr = arguments.toString()
    let splitArr = messageArr.split(">")
    let stationFrom = capitalize(splitArr[0].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())
    let stationTo = capitalize(splitArr[1].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())

    //check for stations with -
    if (stationFrom.indexOf('-') > -1) {
        let fromArr = stationFrom.split("-")
        let tempFrom = capitalize(fromArr[0]) + "-" + capitalize(fromArr[1])
        stationFrom = tempFrom.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }
    if (stationTo.indexOf('-') > -1) {
        let toArr = stationTo.split("-")
        let tempTo = capitalize(toArr[0]) + "-" + capitalize(toArr[1])
        stationTo = tempTo.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }

    //check for exceptions
    function checkFromStation(station) { return station == stationFrom }
    function checkToStation(station) { return station == stationTo }

    //exception handler
    let station_exc_json = JSON.parse(fs.readFileSync('./config/station_exceptions.json', "utf8"))
    let exceptions = station_exc_json.exception

    //loop through all exceptions
    for (i in exceptions) {
        let exception = exceptions[i]
        let wrong = exception.false

        //if exception found, get correct station name
        if (wrong.some(checkFromStation) === true) {
            let good = exception.correct
            stationFrom = good
        } else if (wrong.some(checkToStation) === true) {
            let good = exception.correct
            stationTo = good
        }
    }

    //get train station information, including the station code
    const Stations = await getStations([stationFrom, stationTo])

    //construct both individual stations
    const stationcodeFrom = Stations.get(stationFrom).station
    const stationcodeTo = Stations.get(stationTo).station

    //check if both stations are found
    if (stationcodeFrom == undefined) return ErrorMessage(message, 'Het __vertrek__ station is niet gevonden, controlleer of het volledig en goed geschreven is en probeer opnieuw.', 6000);
    if (stationcodeTo == undefined) return ErrorMessage(message, 'Het __aankomst__ station is niet gevonden, controlleer of het volledig en goed geschreven is en probeer opnieuw.', 6000);

    //get train trip information 
    const TravelPlan = await getTravelInformation(stationcodeFrom.code, stationcodeTo.code)

    //check if object is not a map, raise error
    if (Object.getPrototypeOf(TravelPlan) != Map.prototype) {
        return ErrorMessage(message, `**Error ${TravelPlan.code}** De treinreis kon niet opgehaald worden, probeer het op een later tijdstip nogmaals`, 6000)
    }

    //go over each trip values and create an embedded message
    let tripMessage_Array = []
    for (const [key, value] of TravelPlan.entries()) {

        //setup the embedded message
        const tripMessage = new MessageEmbed()
            .setTitle('Sero - Reisplanner')
            .setDescription(`[Reisadvies](${value.shareURL}) **${stationcodeFrom.namen.middel}** - **${stationcodeTo.namen.middel}**
            vertrek **${value.crossovers[0].departTime}**${(value.duractionDelay > 0) ? `_+${value.duractionDelay}_` : ``} <:arrow_right2:847424144488529920> aankomst **${value.crossovers[value.crossovers.length - 1].arriveTime}** \n
            <:time:847378738759991336> \u200B ${value.tripDuration} \u200B \u200B \u200B <:transfer:847377565262020629> \u200B ${value.transfers}x overstappen \n \u200B`)
            .setThumbnail('https://cdn.discordapp.com/emojis/644829999043444749.png')
            .setColor('#f6bf21')
            .setFooter(`Pagina ${key + 1} van ${TravelPlan.size} | Made by Fluxpuck#0001`)

        //go over all crossovers (transfers)
        value.crossovers.forEach(crossover => {
            tripMessage.addFields(
                {
                    name: `${crossover.departTime}${(crossover.delay > 0) ? `*+${crossover.delay}*` : ``} <:white_dot:847428036903436298> ${crossover.departStation} <:Sero_w:605943682734096394> \`spoor ${crossover.departTrack}\``,
                    value: `<:blank:847120111881027635> | <:blank:847120111881027635> ${crossover.trainName} (${crossover.trainstops}) \n <:blank:847120111881027635> | \n **${crossover.arriveTime}** <:white_dot:847428036903436298> ${crossover.arriveStation} <:Sero_w:605943682734096394> \`spoor ${crossover.arriveTrack}\``, inline: false
                }
            )
        });

        //push each trip message into array
        tripMessage_Array.push(tripMessage)

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
    let page = 0, max_page = TravelPlan.size - 1
    let msg = await message.channel.send({
        embeds: [tripMessage_Array[page]],
        components: [embedButtons]
    });

    //create filter and button collector
    const filter = (i) => i.user.id == message.author.id
    let collector = new InteractionCollector(client, { message: msg, filter: filter, time: 12000, componentType: "BUTTON" })

    //collect button interactions
    collector.on('collect', async (button) => {
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
            embeds: [tripMessage_Array[page]],
            components: [embedButtons]
        });

    });


    //when button collection is over, disable buttons
    collector.on('end', collected => {
        //disable both buttons
        embedButtons.components[0].setDisabled(true)
        embedButtons.components[1].setDisabled(true)
        //edit page
        msg.edit({
            embeds: [tripMessage_Array[page]],
            components: [embedButtons]
        });
    });

}


//command information
module.exports.info = {
    name: 'reisplanner',
    category: 'train',
    alias: ['plan', 'trip'],
    usage: '[prefix]reisplanner [station] > [station]',
    desc: 'Plan een treinreis van A naar B',
    options: [{
        name: 'vertrek',
        type: 'STRING',
        description: 'Het station waarvan je wilt vertrekken.',
        required: true,
    },
    {
        name: 'aankomst',
        type: 'STRING',
        description: 'Het station war je wilt aankomen.',
        required: true,
    }]
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR"
]