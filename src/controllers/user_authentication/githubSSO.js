const axios = require("axios");
const { json } = require("body-parser");
const  querystring =  require("querystring");

async function getGithubAccessToken(code) {
    
    try{
        const githubClientId = process.env.GITHUB_CLIENT_ID;
        const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
        const requestURL = `https://github.com/login/oauth/access_token?client_id=${githubClientId}&client_secret=${githubClientSecret}&code=${code}`;
        const response = await fetch(requestURL,{
            method:"POST",
            headers:{ 
                "Accept":"application/json"
                }
            })
        console.log(response)
        return response.json();
    }
    catch(error){
        console.log("here");

        console.log(error);
        return {error: "Error in fetching token!"} 
    }
}   

async function getGithubUserData(token) {

    try{
    const requestUserdataURL = `https://api.github.com/user`;
        const response = await fetch(requestUserdataURL,{
            method:"GET",
            headers:{
                "Authorization":"Bearer " + token
            }
        })
        console.log(response)
        return response.json();
    }
    catch(error){
        console.log("here2");

        console.log(error);
        return {error: "Error In Fetching User Data!"} 
    }
}   

module.exports = { getGithubAccessToken,getGithubUserData };