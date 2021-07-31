/*------------------------------*/


const CommandsbyGroup = async (client) => {
    //filter/sort all elements based on category
    const commandsByGroup = client.commands.reduce((key, value) => {
        // Group initialization
        if (!key[value.info.category]) {
            key[value.info.category] = [];
        }
        // Grouping
        key[value.info.category].push(value);
        return key;
    }, {});
    return commandsByGroup
}

const getSlashCommandData = async (client, commandsByGroup, options) => {
    const data = []
    for (const category of Object.keys(commandsByGroup)) {
        if (options.has(category)) {
            //go over each train-command and create slash command for it.
            commandsByGroup[category].forEach(command => {
                data.push({
                    name: command.info.name,
                    description: command.info.desc,
                    options: command.info.options
                })
            });
        }
    }
    return data
}

const createSlashCommand = async (client, slashCommandData) => {
    await client.application?.fetch() //fetch current command information
    slashCommandData.forEach(command => {
        client.application.commands.create({
            name: command.name,
            description: command.description,
            options: command.options
        })
    });
}

module.exports = {
    CommandsbyGroup,
    getSlashCommandData,
    createSlashCommand
};