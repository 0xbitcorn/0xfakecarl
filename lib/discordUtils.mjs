import client from "./var/client.mjs";
import {importModulesFromDir} from "./utils.mjs";
import { ActivityType, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs/promises";
import path from 'path';
import { connectToDatabase } from "./var/database.mjs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandFldr = path.join(__dirname, "/commands/");

async function clientReady() {

    console.log(`${client.user.tag} connected to:\n✅ DISCORD`);
    await connectToDatabase();
    const activity = "with carls mind";
    const activityType = ActivityType.Playing;
    client.user.setActivity(activity, { type: activityType });
    try{
        await registerSlashCommands();
    }catch(error){
        console.log(error);
    }
}

async function registerSlashCommands() {
    const dynamicCommands = await loadCommands();
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILDID), {
            body: dynamicCommands,
        });
        console.log("✅ Commands Registered");
    } catch (error) {
        console.error(error);
    }
}

async function loadCommands() {
    const dynamicCommands = [];
    const commandModules = await importModulesFromDir(commandFldr);
    const commandFiles = (await fs.readdir(path.resolve(commandFldr))).filter(file => file.endsWith('.mjs'));
    try{
        for (const file of commandFiles) {
            const command = (await import(`./commands/${file}`)).default;
            dynamicCommands.push(command.data);
    }
    }catch(error){
        console.log(error);
    }

    const commandNames = "Commands Found: /" + dynamicCommands.map((commandBuilder) => commandBuilder.name).join(' /');
    console.log(commandNames);

    return dynamicCommands;
}

async function clientInteractionCreate(interaction) {
    if (!interaction.isCommand()) return;
    const commandFiles = (await fs.readdir(path.resolve(commandFldr))).filter(file => file.endsWith('.mjs'));
    try{
        for (const file of commandFiles) {
            const command = (await import(`./commands/${file}`)).default;
            if(interaction.commandName == command.data.name){
                await command.execute(interaction);
            };
    }
    }catch(error){
        console.log(error);
    }
}

async function getNicknames(userIds) {
    console.log("Getting nicknames...");
    const guild = await client.guilds.fetch(guildId);
    l;
    const nicknames = [];
    for (const userId of userIds) {
        try {
            const member = await guild.members.fetch(userId);
            const nickname = member ? member.nickname || member.user.username : null;
            nicknames.push(nickname);
        } catch (err) {
            console.log("User nickname not found (getNicknames):" + userId);
        }
    }
    console.log(nicknames);
    return nicknames;
}

async function sendMessageToChannel(message, channelId) {
    try {
        // PG-NOTES: - This function is used a lot but you're pulling
        // in an out of scope variable
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error(`Channel with ID ${channelId} not found.`);
            return;
        }
        await channel.send(message);
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
}

export { clientReady, clientInteractionCreate, getNicknames, sendMessageToChannel };
