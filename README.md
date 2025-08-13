# Discord Clock Bot

Renames a Discord channel with the current time every few minutes (default 5), respecting Discord rate limits.

## Quick Start

1) Create a Discord bot at https://discord.com/developers/applications  
   - Add a Bot user, copy its **Token**.  
   - Invite it to your server with **Manage Channels** permission.

2) Get a **Channel ID**  
   - Discord → Settings → Advanced → Developer Mode ON  
   - Right-click your target channel → Copy Channel ID

3) Configure  
   - Make a `.env` file (copy from `.env.example`) and fill:
     - `DISCORD_TOKEN=...`
     - `CHANNEL_ID=...`
     - `TIMEZONE=Asia/Kolkata` (or your TZ)

4) Run locally
```bash
npm install
npm start
