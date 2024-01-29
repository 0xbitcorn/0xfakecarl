import { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } from "discord.js";
import { pgClient } from "../var/database.mjs";
import fs from "fs";
export default {
    data: new SlashCommandBuilder()
        .setName("sql")
        .setDescription("Execute a SQL query and save the result in a file.")
        .addStringOption((option) => option.setName("query").setDescription("The SQL query to execute.").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (interaction) => {
        try {
            const sqlQuery = interaction.options.getString("query");

            var replyContent = `**[SQL QUERY]**\n\`\`\`${sqlQuery}\`\`\``;

            var result = await pgClient.query(sqlQuery);
            const data = result.rows;

            fs.writeFileSync("query.txt", JSON.stringify(data, null, 2));
            const attachment = new AttachmentBuilder("query.txt");
            await interaction.reply({ content: replyContent, files: [attachment] });
        } catch (error) {
            console.error("Error executing SQL query:", error.message);
            await interaction.reply(`${replyContent}\n:no_entry: **[ERROR]** \`\`\`${error.message}\`\`\``);
        }
    },
};
