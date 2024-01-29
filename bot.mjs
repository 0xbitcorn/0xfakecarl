import dotenv from 'dotenv'
dotenv.config();
import client from "./lib/var/client.mjs";
import { clientReady, clientInteractionCreate } from './lib/discordUtils.mjs';

    client.once("ready", () => {
        clientReady();
    });
    
    client.on("interactionCreate", async (interaction) => {
        clientInteractionCreate(interaction);
    });
    
    client.on("error", console.log);
    
    client.login(process.env.token);
    
    client.on("messageCreate", async (message) => {
        const msg = message.content.toLowerCase();
    });