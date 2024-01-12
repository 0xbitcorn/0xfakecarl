const client = require("./client.js")
async function sendMessageToChannel(message, channelId) {
	try {
    // PG-NOTES: - This function is used a lot but you're pulling
    // in an out of scope  variable
	  const channel = await client.channels.fetch(channelId);
  
	  if (!channel) {
		console.error(`Channel with ID ${channelId} not found.`);
		return;
	  }

	  await channel.send(message);

	} catch (error) {
	  console.error('Error sending message:', error.message);
	}
  }
