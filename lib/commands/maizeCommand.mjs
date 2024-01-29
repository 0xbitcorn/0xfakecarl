import { getMaizeInputFile, clearMaizeInputFile, processDistribution } from "../maize.mjs";
import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("maize")
        .setDescription("MAIZE functions: Review, Clear, Process")
        .addStringOption((option) =>
            option.setName("function")
                .setDescription("Select operation to perform.")
                .setRequired(true)
                .addChoices(
                    { name: "Review", value: "review" },
                    { name: "Clear", value: "clear" },
                    { name: "F*%kin Send It!!", value: "sendit" },
                ))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (interaction) => {
        try {
            const operation = interaction.options.getString("function");

            switch (operation) {
                case "review":
                    try {
                        const attachment = getMaizeInputFile();
                        await interaction.reply({
                            content: "Maize input file attached.",
                            files: [attachment],
                        });
                    } catch (error) {
                        await interaction.reply({
                            content: "Error sending file.",
                            ephemeral: true,
                        });
                        console.error("Error sending file:", error.message);
                    }
                    break;
                case "clear":
                    if (interaction.user.id !== process.env.BITCORN) {
                        await interaction.reply({
                            content: "Sorry brotato. Only bitcorn is allowed to play with this fire.",
                            ephemeral: true,
                        });
                        return;
                    }

                    const clearConfirmationMessage = await interaction.reply({
                        content: "Are you sure you want to clear the Maize input file?",
                        ephemeral: true,
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setStyle("Success")
                                    .setLabel("Yes")
                                    .setCustomId("clear_confirmation_yes"),
                                new ButtonBuilder()
                                    .setStyle("Danger")
                                    .setLabel("No")
                                    .setCustomId("clear_confirmation_no")
                            ),
                        ],
                    });

                    const filter = (i) => i.customId.startsWith("clear_confirmation");
                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        time: 15000,
                    });
                    collector.on("collect", async (i) => {
                        if (i.customId === "clear_confirmation_yes") {
                            clearMaizeInputFile();
                            await i.update({
                                content: "Maize input file cleared successfully.",
                                components: [],
                            });
                        } else if (i.customId === "clear_confirmation_no") {
                            await i.update({
                                content: "Operation aborted.",
                                components: [],
                            });
                        }
                        collector.stop();
                    });
                    collector.on("end", (collected, reason) => {
                        if (reason === "time") {
                            interaction.followUp({
                                content: "Confirmation timed out. Operation aborted.",
                                ephemeral: true,
                            });
                        }
                    });
                    break;
                case "sendit":
                    try {
                        const attachment = getMaizeInputFile();
                        const reviewConfirmationMessage = await interaction.reply({
                            content: "Please review the attached Maize input file for issues.",
                            files: [attachment],
                            ephemeral: true,
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setStyle("Success")
                                        .setLabel("Proceed")
                                        .setCustomId("review_confirmation_yes"),
                                    new ButtonBuilder()
                                        .setStyle("Danger")
                                        .setLabel("Abort")
                                        .setCustomId("review_confirmation_no")
                                ),
                            ],
                        });

                        const filter = (i) => i.customId.startsWith("review_confirmation");
                        const collector = interaction.channel.createMessageComponentCollector({
                            filter,
                            time: 15000,
                        });
                        collector.on("collect", async (i) => {
                            if (i.customId === "review_confirmation_yes") {
                                await i.update({
                                    content: ">> THIS IS WHERE IT WOULD PROCESS, IF WE HAD THAT FUNCTION!!!",
                                    components: [],
                                });
                                processDistribution();
                            } else if (i.customId === "review_confirmation_no") {
                                const issueConfirmationMessage = await i.update({
                                    content:
                                        "Would you like to report an issue and send the file to bitcorn?\n(DM with specifics)",
                                    ephemeral: true,
                                    components: [
                                        new ActionRowBuilder().addComponents(
                                            new ButtonBuilder()
                                                .setStyle("Success")
                                                .setLabel("Yes")
                                                .setCustomId("report_issue_yes"),
                                            new ButtonBuilder()
                                                .setStyle("Danger")
                                                .setLabel("No")
                                                .setCustomId("report_issue_no")
                                        ),
                                    ],
                                });

                                const issueCollector = interaction.channel.createMessageComponentCollector({
                                    filter: (i) => i.customId.startsWith("report_issue"),
                                    time: 15000,
                                });
                                issueCollector.on("collect", async (i) => {
                                    if (i.customId === "report_issue_yes") {
                                        const userToDM = process.env.BITCORN;
                                        const dmChannel = await interaction.client.users.fetch(userToDM);
                                        await dmChannel.send({
                                            content: `<@${interaction.user.id}> (a.k.a. ${interaction.user.tag}) reported there's an issue with this Maize input file:`,
                                            files: [attachment],
                                        });
                                        await i.update({
                                            content: "Issue reported. Thank you!",
                                            components: [],
                                        });
                                    } else if (i.customId === "report_issue_no") {
                                        await i.update({
                                            content: "Process aborted.",
                                            components: [],
                                        });
                                    }
                                    issueCollector.stop();
                                });
                            }
                            collector.stop();
                        });
                        collector.on("end", (collected, reason) => {
                            if (reason === "time") {
                                interaction.followUp({
                                    content: "Confirmation timed out. Distribution aborted.",
                                    ephemeral: true,
                                });
                            }
                        });
                    } catch (error) {
                        await interaction.reply({
                            content: "Error sending file.",
                            ephemeral: true,
                        });
                        console.error("Error sending file:", error.message);
                    }
                    break;
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while processing the command.",
                ephemeral: true,
            });
        }
    },
};
