//setup database connection(s)
const database = require('../config/database');

/*------------------------------*/

//resolve channel
const getChannels = async (guild, input, flag) => {

    //create return array
    let array_id = []

    //handle input (Array)
    let input_string = Array.isArray(input) ? input.toString() : input
    let input_array = input_string.split(',')

    /*----------*/

    //go through all input channels
    input_array.forEach(channel => {

        //filter input [1]
        let mention = new RegExp('<#([0-9]+)>', 'g').exec(channel)
        let item = mention != null ? mention[1] : channel.trim()

        //filter input [2]
        let filter = database.escape(item.replace(',', ''))
        let filter_item = filter.substring(1).slice(0, -1).trim()

        //get channel information
        let targetChannel = filter_item.match(/^[0-9]+$/) != null ? guild.channels.cache.get(filter_item) : guild.channels.cache.find(channel => channel.name.toLowerCase() == filter_item.toLowerCase())

        //check what flag is present
        switch (flag) {
            case "tag": //if user asked for channel tags, return channel tags
                if (targetChannel) array_id.push(`<#${targetChannel.id}>`)
                break;
            case "name": //if user asked for channel names, return channel names
                if (targetChannel) array_id.push(targetChannel.name)
                break;
            case "all": //if user requests all channel information
                if (targetChannel) array_id.push(targetChannel)
                break;
            default:
                if (targetChannel) array_id.push(targetChannel.id)
        }
    });

    //check if any result and return
    if (array_id.length >= 1) return array_id
    else return false
}

//resolve role
const getRoles = async (guild, input, flag) => {

    //create return array
    let array_id = []

    //handle input (Array)
    let input_string = Array.isArray(input) ? input.toString() : input
    let input_array = input_string.split(',')

    //go through every input
    input_array.forEach(role => {

        //filter input [1]
        let mention = new RegExp('<@&([0-9]+)>', 'g').exec(role)
        let item = mention != null ? mention[1] : role.trim()

        //filter input [2]
        let filter = database.escape(item.replace(',', ''))
        let filter_item = filter.substring(1).slice(0, -1).trim()

        //get role information
        let targetRole = filter_item.match(/^[0-9]+$/) != null ? guild.roles.cache.get(filter_item) : guild.roles.cache.find(role => role.name.toLowerCase() == filter_item.toLowerCase())

        //check what flag is present
        switch (flag) {
            case "tag": //if user asked for rp;e ids, return role ids
                if (targetRole) array_id.push(`<@&${targetRole.id}>`)
                break;
            case "name": //if user asked for role names, return role names
                if (targetRole) array_id.push(targetRole.name)
                break;
            case "all": //if user requests all role information
                if (targetRole) array_id.push(targetRole)
                break;
            default:
                if (targetRole) array_id.push(targetRole.id)
        }

    });

    //check if any result and return
    if (array_id.length >= 1) return array_id
    else return false

}

//resolve user
const getUser = async (guild, input) => {
    let member //setup member value

    //filter input [1]
    let mention = new RegExp('<@!?([0-9]+)>', 'g').exec(input)
    let item = mention != null ? mention[1] : input.trim()

    //filter input [2]
    let filter = database.escape(item.replace(',', ''))
    let filter_item = filter.substring(1).slice(0, -1).trim()

    //get user by id
    if (filter_item.match(/^[0-9]+$/)) {
        member = await guild.members.cache.get(filter_item) //get user straight from member cache
        if (!member) { member = await guild.members.cache.find(member => member.id == filter_item) } //find user in member cache
        else if (!member) { member = await guild.members.fetch(filter_item); } //fetch member straight from guild
        //if member is found (by id) return member
        if (member) return member;
    }

    //get user by username#discriminator
    if (filter_item.indexOf('#') > -1) {
        let [name, discrim] = filter_item.split('#') //split the into username and (#) discriminator
        member = await guild.members.cache.find(u => u.user.username === name && u.user.discriminator === discrim);
        //if member is found (by username and discriminator) return member
        if (member) return member;
    }

    //if member value is still empty, return false
    if (!member) return false;
}

module.exports = {
    getMessages,
    getUserMessages,
    getChannels,
    getRoles,
    getUser,
    getCommand,
    findCommand,
    inputType
}