//require defaultPrefix from configuration file
const { defaultPrefix } = require('../config/config.json')
//setup database connection
const database = require('../config/database');

/*------------------------------*/

//get Guild specific Prefix
const getGuildPrefix = async (guild) => {
    return new Promise(async function (resolve) {
        const query = (`SELECT prefix FROM guild_information WHERE guild_id = ${guild.id}`)
        database.query(query, async function (err, result) { resolve(result) })
    }).then(async function (result) {
        //return if no guild was found in the Database
        if (!result || result.length < 1) return
        //check if a prefix is set, else get default prefix from config file
        const guildPrefix = (result[0].prefix == null || result[0].prefix.length < 1) ? defaultPrefix : result[0].prefix
        //return guild prefix
        return guildPrefix
    })
}

//get Guild specific Command permissions 
const getGuildCommandPermissions = async (guild, commandName) => {
    return new Promise(async function (resolve) {
        const query = (`SELECT * FROM ${guild.id}_permissions WHERE cmd_name = "${commandName}"`)
        database.query(query, async function (err, result) { resolve(result) })
    }).then(async function (result) {
        //return if no guild was found in the Database
        if (!result || result.length < 1) return false
        else return result[0]
    })
}









/*------------------------------*/

//export all functions
module.exports = {
    getGuildPrefix,
    getGuildCommandPermissions
}