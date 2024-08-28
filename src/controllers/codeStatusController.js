
const axios = require('axios')
const dotenv = require('dotenv');
dotenv.config();

exports.checkStatus = async (token) => {
    
    try{
        const request = {
            method: "GET",
            url: process.env.JUDGE0_URL+ "/" + token,
            params: { base64_encoded: "true", fields: "*" },
            headers:{
                'X-Auth-User': "a1133bc6-a0f6-46bf-a2d8-6157418c6fe2",
            }
        };

        const requestDataFreeTier = {
            method: "GET",
            url: "https://judge0-ce.p.rapidapi.com/submissions" + "/" + token,
            params: { base64_encoded: "true", fields: "*" },
            headers: {
              "X-RapidAPI-Host":"judge0-ce.p.rapidapi.com",
              "X-RapidAPI-Key": "8c8d256b22msh598286017050bd0p1f830ejsn57bfa2f2f987",
            },
        };


        const requestDelete = {
            method: "DELETE",
            url: process.env.JUDGE0_URL+ "/" + token,
            headers:{
                'X-Auth-User': "a1133bc6-a0f6-46bf-a2d8-6157418c6fe2",
            }
        };

        const response = await axios.request(requestDataFreeTier);
        return response.data;
    }
    catch (error){
        return error;
    }
};
  