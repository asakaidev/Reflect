/**
 * V1.3 Finished Repl.it port and UI improvements (Which means adding a gradient lol)
 */
const chalk = require("chalk")

const { Client } = require('v11-discord.js'),
    client = new Client();

const { prompt } = require('enquirer')
var colors = require('@libertyio/colors-node-js')

colors.setTheme({
  error: 'red',
  ASCII: 'brightMagenta'
});
const gradient = require('gradient-string');

//const delay = async(ms) => new Promise(resolve => setTimeout(resolve, ms))
// no this thing does not save ur token litreally open source
async function run() {

    await logAscii()
    process.title = '@Reflect | Sakuu [Configuration]'

    const config = await prompt([{
            type: 'input',
            name: 'token',
            message: 'Insert your account`s token'
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
                log('Unknown server, verify the ID (Wrong ID or a server with such ID does not exist)', 3)
                process.exit(1)
            }
        })
// well yeah frick 
        let itens = {
            text: guilds[0].channels.filter(c => c.type === 'text').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            voice: guilds[0].channels.filter(c => c.type === 'voice').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            category: guilds[0].channels.filter(c => c.type === 'category').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            roles: guilds[0].roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).map(r => r)
        }
        process.title = `@Reflect | Saku [Cloning ${guilds[0].name}]`;

        log('Deleting all channels and roles of target guild...', 1)
        await guilds[1].channels.forEach(c => c.delete().catch(() => {}))
        await guilds[1].roles.map(r => r.delete().catch((() => {})))

        await guilds[1].setIcon(guilds[0].iconURL)
        await guilds[1].setName(`${guilds[0].name} By saku`)

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
            log('Whoops! Something is wrong, verify the token!' .error, 3)
        })
}

async function logAscii() {
    console.clear()
    console.log(gradient.mind(`

                Imagine a server 

8888888b.           .d888 888                   888    
888   Y88b         d88P"  888                   888    
888    888         888    888                   888    
888   d88P .d88b.  888888 888  .d88b.   .d8888b 888888 
8888888P" d8P  Y8b 888    888 d8P  Y8b d88P"    888    
888 T88b  88888888 888    888 88888888 888      888    
888  T88b Y8b.     888    888 Y8b.     Y88b.    Y88b.  
888   T88b "Y8888  888    888  "Y8888   "Y8888P  "Y888 
        
A discord server cloner made with outdated stuff | Made with Node.JS & v11-discord.js
`))
}

async function log(message, type) {
    switch (type) {
        case 1:
            await console.log(` [\u2713] ${message}`.green)
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