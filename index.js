const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  Events 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// 🔧 WKLEJ SWOJE ID
const verifiedRoleId = "ID_ROLI_VERIFIED";
const unverifiedRoleId = "ID_ROLI_UNVERIFIED";
const panelChannelId = "ID_KANALU_PANELU";

client.once('ready', async () => {
  console.log(`Bot online jako ${client.user.tag}`);

  const channel = await client.channels.fetch(panelChannelId);

  const button = new ButtonBuilder()
    .setCustomId('verify_btn')
    .setLabel('VERIFY')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  channel.send({
    content: 'Kliknij przycisk, aby się zweryfikować!',
    components: [row]
  });
});

client.on(Events.InteractionCreate, async interaction => {

  // kliknięcie VERIFY
  if (interaction.isButton() && interaction.customId === 'verify_btn') {

    const modal = new ModalBuilder()
      .setCustomId('verify_modal')
      .setTitle('Weryfikacja Minecraft');

    const mcNickInput = new TextInputBuilder()
      .setCustomId('mc_nick')
      .setLabel('Twój nick w Minecraft')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(mcNickInput));

    await interaction.showModal(modal);
  }

  // po wpisaniu nicku
  if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {

    const mcNick = interaction.fields.getTextInputValue('mc_nick');
    const member = interaction.member;

    const newNick = `${mcNick} (@${interaction.user.username})`;

    try {
      await member.setNickname(newNick);
      await member.roles.add(verifiedRoleId);

      if (member.roles.cache.has(unverifiedRoleId)) {
        await member.roles.remove(unverifiedRoleId);
      }

      await interaction.reply({
        content: `✅ Zweryfikowano jako **${mcNick}**`,
        ephemeral: true
      });

    } catch (err) {
      console.log(err);
      await interaction.reply({
        content: "❌ Bot nie ma permisji (role za wysoko).",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
