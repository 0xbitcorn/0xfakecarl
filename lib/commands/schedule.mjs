import { scheduleJob } from "node-schedule";
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("Schedule a message")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Select where to post the message (default: current channel)")
                .addChannelTypes(ChannelType.GuildText)
        )
        .addIntegerOption((option) =>
            option.setName("time").setDescription("Specify the UNIX time to send the message (default: immediately)")
        )
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription("Input message to send (default: last message you sent in current channel)")
                .setMaxLength(2000)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel("channel") || interaction.channel;
            const unixTime = interaction.options.getInteger("time") || Math.floor(new Date().getTime() / 1000);
            const inputMessage = interaction.options.getString("message");
            const messageContent = [];

            if (!inputMessage) {
                // If messageContent is blank, fetch the last message sent by the user
                const currChannel = interaction.channel;
                const messages = await currChannel.messages.fetch({ limit: 15 });
                const userMessages = messages.filter((msg) => msg.author.id === interaction.user.id);
                const lastMessage = userMessages.first();
                if (lastMessage) {
                    messageContent.push(lastMessage.content);
                } else {
                    return interaction.reply({
                        content: "You haven't sent any messages recently.",
                        ephemeral: true,
                    });
                }
            } else {
                messageContent.push(inputMessage);
            }

            // PG-NOTES: Consider that these aren't stored somewhere,
            // so if the bot goes down, the messages are lost
            // ^^build a feature in to handle this

            const scheduledTime = new Date(unixTime * 1000); // Convert Unix time to milliseconds

            if (scheduledTime <= new Date()) {
                // If the scheduled time is in the past, send the message immediately

                channel.send(messageContent.join());
                await interaction.reply({
                    content: `Message sent immediately.`,
                    ephemeral: true,
                });
                console.log(`[${interaction.user.tag} used /schedule]: Message sent immediately.`);
                return;
            } else {
                scheduleJob(scheduledTime, () => {
                    channel.send(messageContent.join());
                });

                console.log(`[${interaction.user.tag} used /schedule]: Message scheduled for ${scheduledTime}`);
                await interaction.reply({
                    content: `Message scheduled for ${scheduledTime}`,
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("Error scheduling message:", error);
            interaction.reply({
                content: "An error occurred while scheduling the message.",
                ephemeral: true,
            });
        }
    },
};
