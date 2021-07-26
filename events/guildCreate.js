//construct utilities
const DataManager = require('../utils/DataManager');

//require configuration details
const { report_channel } = require('../config/config.json');

//exports event
module.exports = async (client, guild) => {

    //update Databases for new Guild
    await DataManager.updateGuildinfo(guild);
    await DataManager.updateCommandPermissions(guild);

    /*------------------------------*/

    //create report embed
    const report_embed = new MessageEmbed()
        .setTitle(`${client.user.tag} joined ${guild.name}`)
        .addFields(
            { name: 'Guild Owner', value: `\`\`\`${guild.owner.user.tag} | ${guild.owner.user.id}\`\`\``, inline: false },
            { name: 'Member Count', value: `\`\`\`${guild.memberCount}\`\`\``, inline: true },
            { name: 'Region', value: `\`\`\`${guild.region}\`\`\``, inline: true },
            { name: 'Guild Created at', value: `\`\`\`${guild.createdAt.toLocaleString()}\`\`\``, inline: false },
        )
        .setThumbnail(guild.iconURL())
        .setColor('#f6bf21')
        .setTimestamp()
        .setFooter(guild.id)

    //send report message!!
    await client.channels.fetch(report_channel)
        .then(channel => channel.send({ embeds: [report_embed] }))

}