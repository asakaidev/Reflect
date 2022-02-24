/**
 * Yes I suck at programming how do you know?
 *
 * 
 *
 */

const { Client } = require('discord.js-selfbot-v11'),
    client = new Client();

const { prompt } = require('enquirer')
var colors = require('node-colors-sync')

//const delay = async(ms) => new Promise(resolve => setTimeout(resolve, ms))

async function run() {

    await logAscii()
    process.title = '@Sakugawa | Mirror [Config]'

    const config = await prompt([{
            type: 'input',
            name: 'token',
            message: 'Insert your account token'
        }, {
            type: 'input',
            name: 'original',
            message: 'Insert the original server ID (to copy)'
        },
        {
            type: 'input',
            name: 'target',
            message: 'Insert the target server ID'
        }
    ])
    const { token, original, target } = config

    client.on('ready', async() => {
        logAscii()
        const guilds = [await client.guilds.get(original), await client.guilds.get(target)]
        guilds.forEach(g => {
            if (!g) {
                log('Unknown server, verify the ID! (Its wrong or any server like that does not exist)', 3)
                process.exit(1)
            }
        })

        let itens = {
            text: guilds[0].channels.filter(c => c.type === 'text').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            voice: guilds[0].channels.filter(c => c.type === 'voice').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            category: guilds[0].channels.filter(c => c.type === 'category').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            roles: guilds[0].roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).map(r => r)
        }
        process.title = `@Sakuta | Mirror [Cloning ${guilds[0].name}]`;

        log('Deleting all channels and roles of target guild...', 1)
        await guilds[1].channels.forEach(c => c.delete().catch(() => {}))
        await guilds[1].roles.map(r => r.delete().catch((() => {})))

        await guilds[1].setIcon(guilds[0].iconURL)
        await guilds[1].setName(`${guilds[0].name} Sakuta's clone`)

        for (let role of itens.roles) {
            if (guilds[1].roles.get(role.id)) continue;

            guilds[1].createRole({
                name: role.name,
                type: role.type,
                color: role.color,
                permissions: role.permissions,
                managed: role.managed,
                mentionable: role.mentionable,
                position: role.position
            }).then(r => log(`Created the role: ${r.name}`, 1))
        }

        await guilds[0].emojis.forEach(e => {
            if (guilds[1].emojis.get(e.id)) return;

            guilds[1].createEmoji(e.url, e.name).then(c => log(`Created emoji: ${c}`, 1));
        })

        itens['category'].forEach(async(category) => {
            if (guilds[1].channels.get(category.id)) return;

            await guilds[1].createChannel(category.name, {
                type: 'category',
                permissionOverwrites: category.permissionOverwrites.map(v => {
                    let target = guilds[0].roles.get(v.id);
                    if (!target) return;
                    return {
                        id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                        allow: v.allow || 0,
                        deny: v.deny || 0,
                    };
                }).filter(v => v),
                position: category.position
            }).then(c => {
                log(`Created category: ${c.name}`, 1)
            })
        })

        for (let channel of itens.text) {
            if (guilds[1].channels.get(channel.id)) continue;

            if (!channel.parent) {
                if (channel.topic) await guilds[1].createChannel(channel.name, {
                    type: 'text',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position
                }).then(c => c.setTopic(channel.topic))
            } else {
                let chn = await guilds[1].createChannel(channel.name, {
                    type: 'text',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position
                })
                if (channel.topic) chn.setTopic(channel.topic);

                if (guilds[1].channels.find(c => c.name == channel.parent.name)) chn.setParent(guilds[1].channels.find(c => c.name == channel.parent.name).id);
                else {
                    var cat = await guilds[1].createChannel(channel.parent.name, {
                        type: 'category',
                        permissionOverwrites: channel.permissionOverwrites.map(v => {
                            let target = guilds[0].roles.get(v.id);
                            if (!target) return;
                            return {
                                id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                                allow: v.allow || 0,
                                deny: v.deny || 0,
                            };
                        }).filter(v => v),
                        position: channel.position
                    });
                    chn.setParent(cat);
                }
            }
            log(`Created channel: ${channel.name}`, 1)
        }

        for (let channel of itens.voice) {
            if (guilds[1].channels.get(channel.id)) continue;

            if (!channel.parent) {
                if (channel.topic) await guilds[1].createChannel(channel.name, {
                    type: 'voice',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position,
                    userLimit: channel.userLimit
                })
            } else {
                let chn = await guilds[1].createChannel(channel.name, {
                    type: 'voice',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position,
                    userLimit: channel.userLimit
                })

                if (guilds[1].channels.find(c => c.name == channel.parent.name)) chn.setParent(guilds[1].channels.find(c => c.name == channel.parent.name).id);
                else {
                    var cat = await guilds[1].createChannel(channel.parent.name, {
                        type: 'category',
                        permissionOverwrites: channel.permissionOverwrites.map(v => {
                            let target = guilds[0].roles.get(v.id);
                            if (!target) return;
                            return {
                                id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                                allow: v.allow || 0,
                                deny: v.deny || 0,
                            };
                        }).filter(v => v),
                        position: channel.position,
                    });
                    chn.setParent(cat);
                }
            }
            log(`Created the channel: ${channel.name}`, 1)
        }
    })

    client.login(`${token}`.replace(/"/g, ''))
        .catch(() => {
            logAscii()
            log('Ops! Something is wrong, verify the token!', 3)
        })
}

async function logAscii() {
    console.clear()
    console.log(`



                888b     d888 d8b
                8888b   d8888 Y8P   Yes I suck at programming
                88888b.d88888
                888Y88888P888 888 888d888 888d888 .d88b.  888d8888
                888 Y888P 888 888 888P"   888P"  d88""88b 888P8"
                888   "   888 888 888     888    Y88..88P 888
                888       888 888 888     888     "Y88P"  888
        The ultimate outdated discord server cloner | This still works somehow
`.brightRed)
}

async function log(message, type) {
    switch (type) {
        case 1:
            await console.log(` [\u2713] ${message}`.brightGreen)
            break;
        case 2:
            await console.log(` [\u26A0] ${message}`.yellow)
            break;
        case 3:
            await console.log(` [\u274C] ${message}`.red)
            break;
    }
}

run()
