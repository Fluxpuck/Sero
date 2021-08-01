//require defaultPrefix from configuration file
const { defaultPrefix, ownerIDs } = require('../config/config.json')
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

const checkGuildCommandPermissions = async (guild, member, channelId, permissions) => {
    //check if permission array is present
    if (permissions === false) return { status: false, error: 'Permission Error', message: 'No permissions were recieved' }

    //construct elements
    let permission_array = []
    const role_array = permissions.role_access.split(',')
    const chnl_array = permissions.chnl_access.split(',')

    /**
     * Go over all the available permissions
     */
    role_array.forEach(role => { //check if member has the permissioned role(s)
        if (member.roles.cache.has(role) == false) permission_array.push(false)
    });
    chnl_array.forEach(channelID => { //check if the command is eligible to be used in the channel
        if (channelId != channelID) permission_array.push(false)
    });

    /*  check if the refuse array does not have any false permissions
        and if the message author is bot owner  */
    if (!permission_array.includes(false) ||
        ownerIDs.includes(member.id) ||
        member.permissions.has("ADMINISTRATOR")) {
        return true
    } else return false

}

/*------------------------------*/

//export all functions
module.exports = {
    getGuildPrefix,
    getGuildCommandPermissions,
    checkGuildCommandPermissions
}