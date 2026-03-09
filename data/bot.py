import discord
import os
from discord import app_commands
from dotenv import load_dotenv

# Load configuration from .env
load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")
WHITELIST_FILE = "whitelist.txt"
MAX_ACCOUNTS_PER_USER = int(os.getenv("MAX_ACCOUNTS_PER_USER", 1))

class WhitelistBot(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        # This will sync commands globally. 
        # Note: Global sync can take up to an hour to propagate.
        await self.tree.sync()

    async def on_ready(self):
        print(f"✅ Logged in as {self.user} (ID: {self.user.id})")
        print("🔁 Synced global commands")

def get_whitelist_data():
    """
    Reads whitelist.txt and returns:
    - user_counts: dict mapping discord IDs to number of accounts registered
    - usernames: set of lowercase whitelisted usernames
    """
    user_counts = {}
    usernames = set()
    
    if not os.path.exists(WHITELIST_FILE):
        return user_counts, usernames
        
    with open(WHITELIST_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith("# id:"):
                uid = line.replace("# id:", "").strip()
                user_counts[uid] = user_counts.get(uid, 0) + 1
            elif not line.startswith("#"):
                usernames.add(line.lower())
                
    return user_counts, usernames

def register_user(discord_id, username):
    """Checks constraints and appends to whitelist.txt."""
    username = username.strip()
    if not username:
        return False, "Username cannot be empty."
    
    user_counts, usernames = get_whitelist_data()
    
    current_count = user_counts.get(str(discord_id), 0)
    if current_count >= MAX_ACCOUNTS_PER_USER:
        return False, f"You have already reached the limit of {MAX_ACCOUNTS_PER_USER} account(s) per person."
        
    if username.lower() in usernames:
        return False, f"The username `{username}` is already whitelisted."
        
    try:
        with open(WHITELIST_FILE, "a") as f:
            f.write(f"\n# id:{discord_id}\n")
            f.write(f"{username}\n")
        return True, f"Username `{username}` has been successfully whitelisted!"
    except Exception as e:
        return False, f"Error writing to file: {str(e)}"

client = WhitelistBot()

@client.tree.command(name="whitelist", description="Add a username to the server whitelist (1 per user)")
@app_commands.describe(username="The username you want to whitelist")
async def whitelist(interaction: discord.Interaction, username: str):
    success, message = register_user(interaction.user.id, username)
    if success:
        await interaction.response.send_message(f"✅ {message}", ephemeral=True)
    else:
        await interaction.response.send_message(f"❌ {message}", ephemeral=True)

if __name__ == "__main__":
    if not TOKEN:
        print("❌ Error: DISCORD_TOKEN not found in .env file.")
    else:
        client.run(TOKEN)
