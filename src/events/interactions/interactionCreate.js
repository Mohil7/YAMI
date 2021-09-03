const { Interaction } = require("discord.js");
const { BotClient } = require("@src/structures");
const { timeformat } = require("@utils/miscUtils");

/**
 * @param {BotClient} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    if (!client.slashCommands.has(interaction.commandName)) {
      return interaction.reply("An error has occurred").catch(() => {});
    }

    // get the slash command
    const command = client.slashCommands.get(interaction.commandName);

    // cooldown check
    if (command.cooldown > 0) {
      const remaining = command.getRemainingCooldown(interaction.member.id);
      if (remaining > 0)
        return interaction
          .reply({
            content: `You are on cooldown. You can use the command after ${timeformat(remaining)}`,
            ephemeral: true,
          })
          .catch(() => {});
    }

    // defer the reply
    await interaction.deferReply({ ephemeral: command.slashCommand.ephemeral }).catch(() => {});

    // Run the event
    await command.interactionRun(interaction, interaction.options);
    command.applyCooldown(interaction.member.id);
  }
};
