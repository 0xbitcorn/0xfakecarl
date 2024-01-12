// maizeCommand.js
module.exports = {
  data: {
    name: 'maize',
    description: 'MAIZE functions: Review, Clear, Process',
    options: [
      {
        name: 'function',
        type: 3, // STRING
        description: 'Select operation to perform.',
        required: true,
        choices: [
          { name: 'Review', value: 'review' },
          { name: 'Clear', value: 'clear' },
          { name: 'Fuckin Send It!!', value: 'sendit' },
        ],
      },
    ],
  },
  execute: async (interaction) => {
    try {
      // Check if the user has the necessary permissions or any other conditions if needed

                  // Check if the user has the PuzzleGang role
                  const requiredRoleId = '970758538681012315';
                  const member = interaction.member;
          
                  if (!member || !member.roles || !member.roles.cache.has(requiredRoleId)) {
                      // User doesn't have the required role
                      await interaction.reply({
                      content: 'You do not have the required role to use this command.',
                      ephemeral: true,
                      });
                      return;
                  }

      const { getMaizeInputFile, clearMaizeInputFile, processDistribution } = require('../functions/maize.js');
      const operation = interaction.options.getString('function');

      // Call the appropriate function based on the selected operation
      switch (operation) {
        case 'review':
          try {
            const attachment = getMaizeInputFile();
            await interaction.reply({ content: 'Maize input file attached.', files: [attachment] });
          } catch (error) {
            await interaction.reply({ content: 'Error sending file.', ephemeral: true });
            console.error('Error sending file:', error.message);
          }
          break;
        case 'clear':
          if (interaction.user.id !== '416645304830394368') {
            await interaction.reply({ content: 'Sorry bro. Only bitcorn is allowed to play with this fire.', ephemeral: true });
            return;
          }
          // Confirm the user's intention
          const confirmationMessage = await interaction.reply({
            content: 'Are you sure you want to clear the Maize input file?',
            ephemeral: true,
            components: [
              {
                type: 'ACTION_ROW',
                components: [
                  {
                    type: 'BUTTON',
                    style: 'SUCCESS',
                    label: 'Yes',
                    customId: 'clear_confirmation_yes',
                  },
                  {
                    type: 'BUTTON',
                    style: 'DANGER',
                    label: 'No',
                    customId: 'clear_confirmation_no',
                  },
                ],
              },
            ],
          });

          // Set up a collector to handle user's response
          const filter = (i) => i.customId.startsWith('clear_confirmation');
          const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

          collector.on('collect', async (i) => {
            // User clicked a button
            if (i.customId === 'clear_confirmation_yes') {
              clearMaizeInputFile();
              await i.update({ content: 'Maize input file cleared successfully.', components: [] });
            } else if (i.customId === 'clear_confirmation_no') {
              await i.update({ content: 'Operation aborted.', components: [] });
            }
            collector.stop();
          });

          collector.on('end', (collected, reason) => {
            if (reason === 'time') {
              // Timeout occurred
              interaction.followUp({ content: 'Confirmation timed out. Operation aborted.', ephemeral: true });
            }
          });
          break;
          case 'sendit':
            try {
              const attachment = getMaizeInputFile();
              await interaction.reply({ content: 'Please review the attached Maize input file for issues.', files: [attachment] });
          
              // Ask the user to confirm
              const confirmationMessage = await interaction.followUp({
                content: 'Do you want to proceed with the distribution?',
                ephemeral: true,
                components: [
                  {
                    type: 'ACTION_ROW',
                    components: [
                      {
                        type: 'BUTTON',
                        style: 'SUCCESS',
                        label: 'Yes',
                        customId: 'review_confirmation_yes',
                      },
                      {
                        type: 'BUTTON',
                        style: 'DANGER',
                        label: 'No',
                        customId: 'review_confirmation_no',
                      },
                    ],
                  },
                ],
              });
          
              // Set up a collector to handle user's response
              const filter = (i) => i.customId.startsWith('review_confirmation');
              const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
          
              collector.on('collect', async (i) => {
                // User clicked a button
                if (i.customId === 'review_confirmation_yes') {
                  await i.update({ content: '[THIS IS WHERE IT WOULD PROCESS, IF WE HAD THAT FUNCTION]', components: [] });
                  // Continue with the distribution process
                  processDistribution();
                } else if (i.customId === 'review_confirmation_no') {
                  // Set up buttons for reporting an issue
                  const issueConfirmationMessage = await i.update({
                    content: 'Would you like to report an issue and send the file to bitcorn?\n(DM with specifics)',
                    ephemeral: true,
                    components: [
                      {
                        type: 'ACTION_ROW',
                        components: [
                          {
                            type: 'BUTTON',
                            style: 'SUCCESS',
                            label: 'Yes',
                            customId: 'report_issue_yes',
                          },
                          {
                            type: 'BUTTON',
                            style: 'DANGER',
                            label: 'No',
                            customId: 'report_issue_no',
                          },
                        ],
                      },
                    ],
                  });
          
                  // Set up a collector for reporting an issue
                  const issueCollector = interaction.channel.createMessageComponentCollector({ filter: (i) => i.customId.startsWith('report_issue'), time: 15000 });
          
                  issueCollector.on('collect', async (i) => {
                    if (i.customId === 'report_issue_yes') {
                      const userToDM = '416645304830394368';
                      const dmChannel = await interaction.client.users.fetch(userToDM);
          
                      await dmChannel.send({
                        content: `<@${interaction.user.id}> (a.k.a. ${interaction.user.tag}) reported there's an issue with this Maize input file:`,
                        files: [attachment],
                      });
          
                      await i.update({ content: 'Issue reported. Thank you!', components: [] });
                    } else if (i.customId === 'report_issue_no') {
                      await i.update({ content: 'Process aborted.', components: [] });
                    }
          
                    issueCollector.stop();
                  });
                }
          
                collector.stop();
              });
          
              collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                  // Timeout occurred
                  interaction.followUp({ content: 'Confirmation timed out. Distribution aborted.', ephemeral: true });
                }
              });
            } catch (error) {
              await interaction.reply({ content: 'Error sending file.', ephemeral: true });
              console.error('Error sending file:', error.message);
            }
            break;
          
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
    }
  },
};
