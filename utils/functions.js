//require DiscordJS
const { MessageEmbed } = require('discord.js');

//require embed structures
const embed = require('../config/embed.json')

/*------------------------------*/

module.exports = {

    /**
     * Convert timestamp to 2400 time object.
     * @param {String} t Time object
     */
    time(t) {
        //check if (t) is a valid time string
        let valid = (new Date(t)).getTime() > 0;
        if (valid == true) {
            let time =
                ("0" + t.getHours()).slice(-2) + ":" +
                ("0" + t.getMinutes()).slice(-2);
            return time
        } else return undefined
    },

    /**
     * Capitalize full string
     * @param {String} str String object
     */
    capitalize(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                if (txt.charAt(0) == "'") {
                    return
                } else {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            }
        );
    },

    /**
     * Create and send generalized Error message.
     * @param {Map} message Message object
     * @param {String} input Error message input
     * @param {String} timer Timeout
     */
    async ErrorMessage(message, input, timer) {

        console.log(timer)

        //create error embed
        let ErrorEmbed = new MessageEmbed()
            .setDescription(`❗ ${input}`)
            .setColor(embed.color)
        //check if a remove timer is set!
        if (timer) { //if timer is set return error message and remove
            return message.channel.send({ embeds: [ErrorEmbed] }).then(msg => { msg.delete({ timeout: timer, reason: 'Removed error message, Serobot' }); })
        } else { //if no timer is set, just return error message
            return message.channel.send({ embeds: [ErrorEmbed] })
        }
    },

    /**
     * Clean the string object.
     * @param {String} string String object
     */
    clean(string) {
        if (typeof text === 'string') {
            return string
                .replace(/`/g, '`' + String.fromCharCode(8203))
                .replace(/@/g, '@' + String.fromCharCode(8203))
                .replace(client.token || process.env.TOKEN, '[-- REDACTED --]')
        } else {
            return string;
        }
    },

    /**
     * slice array in chunks
     * @param {Array} array Lenghy array
     * @param {Number} chunk Chunk size
     */
    chunk(array, chunk) {
        var i, j, temp, returnArray = [];
        for (i = 0, j = array.length; i < j; i += chunk) {
            returnArray.push(temp = array.slice(i, i + chunk));
        }
        return returnArray;
    }


};