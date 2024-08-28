const axios = require("axios");
const  querystring =  require("querystring");

function getGoogleAuthUrl() {

  try{
  const rootUrl = process.env.GOOGLE_ROOT_URL;

  const options = {
      redirect_uri: process.env.GOOGLE_AUTH_CALLBACK_URL,
      client_id:  process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        process.env.GOOGLE_PROFILE_URL,
        process.env.GOOGLE_EMAIL_URL,
      ].join(" "),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
    }
    catch(err){
        return null;
    }
}

function getGoogleUserToken({code}) {

try{
  const url = process.env.GOOGLE_TOKEN_URL;

  const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_AUTH_CALLBACK_URL,
      grant_type: "authorization_code",
  };  

  return axios.post(url, querystring.stringify(values), {
          headers: {
              "Content-Type": "application/x-www-form-urlencoded",
          },
      })
      .then((response) => {
          return response.data
      })
      .catch((error) => {
          console.error(`Failed to fetch auth tokens`);
          return { error : "Error in fetching the user token" };
      });
    }
    catch(err){
        return err;
    }
}

async function fetchUserData(accessToken, idToken) {

  try {
    
      const response = await axios.get(`${process.env.GOOGLE_FETCH_USER_URL}${accessToken}`, {
          headers: {
              Authorization: `Bearer ${idToken}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error(`Failed to fetch user data: ${error.message}`);
      return {error: "Error in fetching user data!"}
  }

}

module.exports = { getGoogleAuthUrl , getGoogleUserToken, fetchUserData };