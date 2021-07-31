//does not need any requirements or utilities

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {



    console.log(permissions)



}


//command information
module.exports.info = {
    name: 'bot',
    category: 'misc',
    alias: ['botinfo', 'seroinfo'],
    usage: '[prefix]bot',
    desc: 'Get status information about the Sero',
    options: []
}

//command permission groups
module.exports.permissions = [
    "MANAGE_GUILD",
    "VIEW_GUILD_INSIGHTS"
]