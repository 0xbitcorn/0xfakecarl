import fs from "fs";
import { scheduleJob } from "node-schedule";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import {sendMessageToChannel} from "../discordUtils.mjs"

const templateFldr = "./files/templates/";
const channelMapping = {
    t_cornmoji: "1200487839142510762",
    t_wordwrap: "1200487839142510762",
    t_rebus: "1200487839142510762",
};

export default {
    data: new SlashCommandBuilder()
        .setName("template")
        .setDescription("Schedule a template message (sent to it's default channel)")
        .addStringOption((option) =>
            option.setName("template").setDescription("Choose template").setRequired(true).addChoices(
                {
                    name: "#CORNMOJI",
                    value: "t_cornmoji",
                },
                {
                    name: "#REBUS",
                    value: "t_rebus",
                },
                {
                    name: "#WORDWRAP",
                    value: "t_wordwrap",
                }
            )
        )
        .addStringOption((option) =>
            option.setName("game").setDescription("Input game title or number").setRequired(true)
        )
        .addStringOption((option) => option.setName("theme").setDescription("Input theme").setRequired(true))
        .addIntegerOption((option) =>
            option
                .setName("time")
                .setDescription("Enter time in UNIX when the template should be sent (or leave blank for now)")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        try {
            await interaction.deferReply({
                ephemeral: true,
            });

            let channel = "";
            const template = interaction.options.getString("template");
            const unixTime = interaction.options.getInteger("time") || Math.floor(new Date().getTime() / 1000);
            const scheduledTime = new Date(unixTime * 1000);

            console.log("Time to Send: " + scheduledTime);
            console.log("Template Selected: " + template);
            const templateFilePath = `${templateFldr}/${template}.txt`;
            const templateContent = fs.readFileSync(templateFilePath, "utf-8");
            const gameNumberTitle = interaction.options.getString("game");
            const theme = interaction.options.getString("theme");
            console.log("game number:" + gameNumberTitle);
            console.log("theme:" + theme);
            let finalContent;

            // If the template is 't_cornmoji', convert game number to key cap emojis
            if (template === "t_cornmoji") {
                const emojiMapping = [
                    ":zero:",
                    ":one:",
                    ":two:",
                    ":three:",
                    ":four:",
                    ":five:",
                    ":six:",
                    ":seven:",
                    ":eight:",
                    ":nine:",
                ];

                const keyCapEmojis = gameNumberTitle
                    .split("")
                    .map((digit) => emojiMapping[parseInt(digit)])
                    .join(" ");
                finalContent = templateContent.replace("<GAME>", keyCapEmojis).replace("<THEME>", theme);
            } else {
                finalContent = templateContent.replace("<GAME>", gameNumberTitle).replace("<THEME>", theme);
            }

            // Get the channel ID from the mapping

            channel = channelMapping[template];

            if (scheduledTime <= new Date()) {
                sendMessageToChannel(finalContent, channel);
                await interaction.editReply({
                    content: `Message sent immediately`,
                    ephemeral: true,
                });
                console.log(`Message sent immediately`);
            } else {
                scheduleJob(scheduledTime, () => {
                sendMessageToChannel(finalContent, channel);
                });
                await interaction.editReply({
                    content: `Message scheduled for <t:${unixTime}:f>\n\`\`\`Please note: Message delivery is NOT guaranteed. If bot reboots, messages will currently be lost.\`\`\``,
                    ephemeral: true,
                });
                console.log(`Message scheduled for ${scheduledTime}`);
            }
        } catch (error) {
            console.error("Error scheduling message:", error);
            interaction.editReply({
                content: "An error occurred while scheduling the message.",
                ephemeral: true,
            });
        }
    },
};
