const axios = require('axios');
const { OpenAI } = require("openai");
require('dotenv').config();

exports.callGPT = async (request, response) => {
    try {
        const userRequest = request.body['currentChat'];
        
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });

        const result = await openai.chat.completions.create({
            
        messages: [
            { role: "system", content: "You are AlphaGPT, friendly coding assistant. You will help with coding syntax, logic, debugging, and algorithmic problems.Your job is not give huge explanation, but to give concise answers and syntax help, not big answers just only what they are asking in brief, so only answer in concise manner!" },
            ...userRequest],
        model: "gpt-3.5-turbo",
        stream:true,
        })

        response.header('Content-Type', 'text/plain');

        for await (const chunk of result) {
            if (!response.writableFinished && !response.aborted) {
                response.write(chunk.choices[0]?.delta?.content || "");
            } else {
                break;
            }
        }
        response.end();
    }
    catch(err){
        response.status(503).send("AlphaGPT is under maintainence!");
    }

}