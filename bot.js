/*

  Welcome to my custom bot build (:
  
  Everything here is open-source so feel free to use this code
  to copy or to edit (if you know what your doing).

  I spent a long time perfecting this so I'd be happy if you
  spent 10 seconds of your life clicking the little star icon
  in the top right of the repoistory. 

  Check me out @ https://eli.fail

*/

// Your Twitch Username (optional)
const USERNAME = "";

// Twitch Client Key (optional)
const CLIENT_ID = process.env.TWITCH_KEY;

// Your Discord server ID
const SERVER_ID = "";

// The ID of the channel INSIDE of your Discord server that you want welcome messages sent to (optional)
const CHANNEL_ID = "";

// Welcome message sent in the channel that was assigned above (optional)
// $MEMBER automatically pings the user, example: @eli#1000
const WELCOME_MSG =
  ":tada: Everyone please welcome $MEMBER to our server! :tada:";

// The ID of the role automatically assigned to a user when they join your server (optional)
const ROLE_ID = "";

/*
 *  Discord Client Status (optional)
 *  Types: WATCHING | PLAYING | LISTENING | STREAMING
 *
 *  *If you have TYPE set to STREAMING you MUST also set a stream link*
 */
const DISCORD_STATUS_TYPE = "WATCHING";
const DISCORD_STATUS_MESSAGE = "$MEMBER_COUNT users";
const DISCORD_STATUS_LINK = "";

/*
 *  DO NOT EDIT ANY OF THE CODE BELOW
 *
 *  Unless you know what you are doing (:
 */

require("dotenv").config();
const Discord = require("discord.js");
const fetch = require("node-fetch");
const color = require("chalk");
const bot = new Discord.Client();

bot.on("ready", () => {
  if (!SERVER_ID) {
    console.log(color.red("[Error] Please set a SERVER_ID in bot.js"));
    process.exit(1);
  }

  console.log(color.cyan("~~~~~~~~~~~~~~~~~~~"));
  console.log(color.cyan("Bot: ") + color.white(bot.user.tag));
  console.log(
    color.cyan("Twitch Extension: ") +
      (USERNAME && CLIENT_ID ? color.green("Active") : color.red("Inactive"))
  );
  console.log(
    color.cyan("Welcome MSG: ") +
      (WELCOME_MSG && CHANNEL_ID
        ? color.green("Active")
        : color.red("Inactive"))
  );
  console.log(
    color.cyan("Client Status: ") +
      (DISCORD_STATUS_TYPE && DISCORD_STATUS_MESSAGE
        ? color.green("Active")
        : color.red("Inactive"))
  );
  console.log(color.cyan("~~~~~~~~~~~~~~~~~~~"));
  refreshStatus();
});

bot.on("guildMemberAdd", guildMember => {
  refreshStatus();
  WELCOME_MSG
    ? bot.guilds
        .get(SERVER_ID)
        .channels.get(CHANNEL_ID)
        .send(WELCOME_MSG.replace("$MEMBER", `<@${guildMember.user.id}>`))
    : null;
  ROLE_ID
    ? guildMember.addRole(bot.guilds.get(SERVER_ID).roles.get(ROLE_ID))
    : null;
});

refreshStatus = async () => {
  let status = USERNAME && CLIENT_ID ? await fetchStatus() : { live: false };
  if (status.live) {
    bot.user.setActivity(status.title, {
      type: "STREAMING",
      url: "https://twitch.tv/" + USERNAME
    });
  } else {
    if (DISCORD_STATUS_TYPE != "STREAMING") {
      bot.user.setActivity(
        DISCORD_STATUS_MESSAGE.replace(
          "$MEMBER_COUNT",
          bot.guilds.get(SERVER_ID).memberCount
        ),
        {
          type: DISCORD_STATUS_TYPE
        }
      );
    } else {
      bot.user.setActivity(
        DISCORD_STATUS_MESSAGE.replace(
          "$MEMBER_COUNT",
          bot.guilds.get(SERVER_ID).memberCount
        ),
        {
          type: "STREAMING",
          url: DISCORD_STATUS_LINK
        }
      );
    }
  }
};

fetchStatus = () => {
  return new Promise(async (resolve, reject) => {
    const user_id = await fetchUserId(USERNAME);
    fetch(`https://api.twitch.tv/kraken/streams/?channel=${user_id}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-Id": CLIENT_ID
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json._total > 0) {
          resolve({ live: true, title: json.streams[0].channel.status });
        } else {
          resolve({ live: false, title: null });
        }
      });
  });
};

fetchUserId = username => {
  return new Promise((resolve, reject) => {
    fetch(`https://api.twitch.tv/kraken/users?login=${username}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-Id": CLIENT_ID
      }
    })
      .then(res => res.json())
      .then(json => {
        resolve(json.users[0]._id);
      });
  });
};

setInterval(refreshStatus, 15 * 1000);

bot.login(process.env.DISCORD_KEY);
