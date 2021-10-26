require('dotenv').config();
const { readFileSync } = require('fs');

const apiPut = require('axios').create({
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.accountId}/workers`,
  headers: {
    Authorization: `Bearer ${process.env.token}`,
    'Content-Type': 'application/javascript',
  },
}).put;

(async () => {
  const webProxy = readFileSync('WebProxy.js', 'utf8');
  let apiResponse = await apiPut('/scripts/mirror', webProxy);
  apiResponse.data.result.script = undefined;
  console.log(apiResponse.data);
})();
