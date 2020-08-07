require("dotenv-safe").config();
const fetch = require("node-fetch");
const express = require("express");
const app = express();

// Dynamic Port from env or default
const PORT = process.env.PORT || 3005;
// Auth Provider Secrets
const { GH_CLIENT_ID, GH_CLIENT_SECRET } = process.env;

const gh_oauth = async (ctx) => {
  // Extract Request Token from frontend
  const requestToken = ctx.query.code || null;
  console.log("Auth Code:", requestToken);

  // Sign In with OAuth
  const tokenResponse = await fetch(
    `https://github.com/login/oauth/access_token?client_id=${GH_CLIENT_ID}&client_secret=${GH_CLIENT_SECRET}&code=${requestToken}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
      },
    }
  ).then((res) => res.json());

  // Extract Access Token
  const accessToken = tokenResponse.access_token;
  console.log(`Access token: ${accessToken}`);

  // Get User Details with Access Token (authed)
  const result = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `token ${accessToken}`,
    },
  }).then((res) => res.json());

  console.log(result);
  const name = result.name;

  // Redirect to "Secret" Page
  ctx.res.redirect(`/secret.html?name=${name}`);
};

// Routes to Serve
app.use(express.static("public"));
app.get("/", (_, res) => res.sendFile(__dirname + "/public/index.html"));
app.get("/oauth/github/redirect", gh_oauth);

/* Serve the Application */
app.listen(PORT, () => {
  console.log(`🚀 Now serving OAuth at: http://localhost:${PORT}`);
});
