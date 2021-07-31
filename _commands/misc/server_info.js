//does not need any requirements or utilities

/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {



    console.log(permissions)



}


//command information
module.exports.info = {
    name: 'server',
    category: 'misc',
    alias: ['serverinfo'],
    usage: '[prefix]server',
    desc: 'Get information about the server',
    options: []
}

//command permission groups
module.exports.permissions = [
    "MANAGE_GUILD",
    "VIEW_GUILD_INSIGHTS"
]