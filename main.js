const axios = require('axios');
const TeleBot = require('telebot');
const bot = new TeleBot('7924560661:AAF10_-1ZbCOLRq5csb5kDNE6l2h99yZ00o');
let lastID = 0;
const token = 'MK-JGpCBAGZJOOM1Y9m0wgbxAgdw/1hAHxwQ//ws4zSC5mlXl3kCFE6AUaCNVbvHgyEWZKmb2EMdQO7SC9fi5BfBw=='
async function getTokensApi() {
  try {
    const response = await axios.get('https://www.clanker.world/api/tokens');
    if (response.status !== 200) {
      throw new Error(`Response status err: (not 200): ${response.statusText}`);
    }
    const data = response.data;
    const fidresponse = await axios.get('https://www.clanker.world/api/get-user-by-fid?fid='+ data.data[0].requestor_fid+ '');
    const fidData = fidresponse.data
    try {
        console.log('Data parsing... last id got: ' + lastID);
        if (lastID !== data.data[0].id) {
          const follResponse = await axios.get('https://client.warpcast.com/v2/followers-you-know?fid='+ data.data[0].requestor_fid+ '&limit=20', {headers: {Authorization: 'Bearer '+token+'' }});
          const follResponseData = follResponse
          console.log('got another id: ', data.data[0].id, ' sending message...')
          lastID = data.data[0].id
            processTokenData(data, fidData, follResponseData);
        } else {
            console.log("Id is same, retrying data get...")
        }
    } catch (error) {
        console.error("Data parse error", error.message)
    }

  } catch (error) {
    console.error('Occured main handler error: ', error.message);
  }
}

function processTokenData(data, fidData, follResponseData) {
  
  const tokens = data.data;
  const fid = fidData
  const lastToken = tokens[0];
  const ethAddresses = fid.verified_addresses.eth_addresses
  console.log('Func processTokenData proceeded!')
  let eth_addresses
  let followersArr = []
  for(let user of follResponseData.data.result.users) {
    followersArr.push(user.username);
  }
  
  let sameFollowers = followersArr.join(', ');
  console.log(sameFollowers)
  if (ethAddresses.length > 0) {
    eth_addresses = ethAddresses.map(address => 
    `<a href="https://etherscan.io/address/${address}">${address}</a>`
    ).join('\n');
  } else {
    eth_addresses = `\nThere's no any ETH wallets verified.`
  }
  
format = 
  `
<a href='warpcast.com/${fid.username}'>@${fid.username}</a><strong> DEPLOYED A CLANK!</strong>

<a href="https://www.clanker.world/clanker/${lastToken.contract_address}">${lastToken.name}</a> | <a href="https://www.clanker.world/clanker/${lastToken.contract_address}">${lastToken.symbol}</a>

<code>${lastToken.contract_address}</code>

<strong>Deployer:</strong> <a href='warpcast.com/${fid.username}'>${fid.display_name}</a>
<strong>Username:</strong> <a href='warpcast.com/${fid.username}'>@${fid.username}</a>
<strong>Followers:</strong> ${fid.follower_count}

<strong>Followers you know:</strong>
${sameFollowers}

<a href="https://dexscreener.com/base/${lastToken.pool_address}">DexScreener</a> | <a href="https://www.defined.fi/base/${lastToken.pool_address}">Defined</a> | <a href="https://basescan.org/token/${lastToken.contract_address}">BaseScan</a>

<strong>ID:</strong> <code>${lastToken.id}</code> | <strong>Type:</strong> <code>${lastToken.type}</code>
  `
  let replyMarkup = bot.inlineKeyboard([
    [
      bot.inlineButton('🌀 SigmaBot buy', {url: 'https://t.me/Sigma_buyBot?start=x734293327-'+lastToken.contract_address+''})
    ]
]);

bot.sendMessage(-4556987357, format, {
    parseMode: "HTML",
    webPreview: false,
    replyMarkup,
});
console.log('Message sent to bot')

}


const intervalId = setInterval(getTokensApi, 1000);
