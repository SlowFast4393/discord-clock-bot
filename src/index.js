import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

// ----- Env + config -----
const {
  DISCORD_TOKEN,
  CHANNEL_ID,
  TIMEZONE = 'UTC',
  NAME_PREFIX = '🕒',
  NAME_SUFFIX = '',
  INTERVAL_MINUTES = '5',
  CLOCK_STYLE = '24',
  LABEL = ''
} = process.env;

if (!DISCORD_TOKEN) throw new Error('Missing DISCORD_TOKEN in .env / env vars');
if (!CHANNEL_ID) throw new Error('Missing CHANNEL_ID in .env / env vars');

const intervalMinutesNum = Math.max(5, parseInt(INTERVAL_MINUTES, 10) || 5); // keep >= 5
const intervalMs = intervalMinutesNum * 60 * 1000;
const use12h = String(CLOCK_STYLE).trim() === '12';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Format current time for the configured timezone
function formattedNow() {
  const opts = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: use12h,
    timeZone: TIMEZONE
  };
  const time = new Intl.DateTimeFormat('en-GB', opts).format(new Date());

  const label = LABEL ? ` ${LABEL}` : '';
  const prefix = NAME_PREFIX ? `${NAME_PREFIX} ` : '';
  const suffix = NAME_SUFFIX ? ` ${NAME_SUFFIX}` : '';
  return `${prefix}${time}${label}${suffix}`.trim();
}

async function updateChannelName() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.warn(`[clock] Channel ${CHANNEL_ID} not found`);
      return;
    }

    const newName = formattedNow();
    if (channel.name !== newName) {
      await channel.setName(newName, 'Clock update');
      console.log(`[clock] Renamed to: ${newName}`);
    } else {
      console.log('[clock] No change — skipped rename');
    }
  } catch (err) {
    console.error('[clock] Failed to update channel name:', err.message);
  }
}

// Align first run to the next exact interval mark (:00, :05, :10, ...)
function scheduleAlignedUpdates() {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Minutes until next multiple of INTERVAL_MINUTES
  const minutesUntilNext =
    (intervalMinutesNum - (minutes % intervalMinutesNum)) % intervalMinutesNum;

  // Milliseconds until next aligned tick
  const msUntilNext = (minutesUntilNext * 60 - seconds) * 1000;

  console.log(
    `[clock] Waiting ${Math.max(0, Math.round(msUntilNext / 1000))}s for next aligned update...`
  );

  setTimeout(() => {
    updateChannelName();                     // do one on the aligned mark
    setInterval(updateChannelName, intervalMs); // then repeat every interval
  }, Math.max(0, msUntilNext));
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}. Timezone: ${TIMEZONE}. Interval: ${intervalMinutesNum}m`);
  scheduleAlignedUpdates();
});

client.login(DISCORD_TOKEN);

