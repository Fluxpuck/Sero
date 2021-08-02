
/*------------------------------*/

//construct the command and export
module.exports.run = async (client, message, arguments, prefix, permissions) => {



}

//command information
module.exports.info = {
    name: 'permission',
    category: 'setup',
    alias: ['perm'],
    usage: '[prefix]permission',
    desc: 'Change the permissions for a selected command',
    options: []
}

//command permission groups
module.exports.permissions = [
    "ADMINISTRATOR"
]