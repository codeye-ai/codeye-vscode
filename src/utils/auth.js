const axios = require("axios");

const { load, save } = require("./persistence");

const baseUrl = process.env.AUTH0_BASE_URL;
const clientId = process.env.AUTH0_CLIENT_ID;

async function check() {
  const state = await load(null, "auth", "state");
  if (!state) {
    return false;
  }

  const { token, expiry } = state;
  if (Date.now() > expiry) {
    return false;
  }

  return axios
    .get(baseUrl + "/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(({ data }) => ({
      id: data.sub,
      name: data.name,
      email: data.email,
    }));
}

async function initiate() {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("scope", "email openid profile");
  params.append("audience", "https://api.codeye.ai/");
  return axios
    .post(baseUrl + "/oauth/device/code", params)
    .then(({ data }) => ({
      token: data.device_code,
      url: data.verification_uri_complete,
    }));
}

async function verify(token) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "urn:ietf:params:oauth:grant-type:device_code");
  params.append("device_code", token);
  return axios
    .post(baseUrl + "/oauth/token", params)
    .then(({ data }) => ({
      token: data.access_token,
      expiry: Date.now() + data.expires_in * 1000,
    }))
    .then((state) => save(null, state, "auth", "state").then(() => state));
}

module.exports = { check, initiate, verify };
