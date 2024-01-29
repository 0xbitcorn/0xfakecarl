import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear a specified number of messages from the channel.")
        .addIntegerOption((option) =>
            option.setName("amount").setDescription("Number of messages to clear").setMaxValue(100).setMinValue(1).setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger("amount");
        try {
            const messages = await interaction.channel.messages.fetch({
                limit: amount,
            });

            // Separate messages into older and newer than 14 days
            // These groups require different deletion processes
            const olderThan14Days = [];
            const newerThan14Days = [];
            for (const [snowflake, message] of messages) {
                if (olderThan14Days.length + newerThan14Days.length >= amount) {
                    break;
                }
                if (Date.now() - message.createdTimestamp > 14 * 24 * 60 * 60 * 1000) {
                    olderThan14Days.push(message);
                } else {
                        newerThan14Days.push(message);
                }
            }

            // Bulk delete newer messages
            if (newerThan14Days.length > 0) {
                await interaction.channel.bulkDelete(newerThan14Days);
            }

            // Delete older messages individually
            for (const message of olderThan14Days) {
                await message.delete();
            }

            // Send a confirmation message
            interaction.reply({
                content: `Cleared ${amount} messages.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Error clearing messages:", error);
            interaction.reply({
                content: "An error occurred while clearing messages.",
                ephemeral: true,
            });
        }
    },
};