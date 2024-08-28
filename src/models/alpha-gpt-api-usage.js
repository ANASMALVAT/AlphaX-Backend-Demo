const { DynamoDBClient, UpdateItemCommand ,GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const {verifyPremium} = require("../middlewares/verifyPremiumUser");

const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const getUserGptUsageMethod = async (user_id) => {
    try {

      const getItemParams = {
      "Key": {
        "user_id": {
          "S": user_id.toString()
        },
      },
        "TableName": "alpha_gpt_api_usage"
      };

      const getCommand = new GetItemCommand(getItemParams);
      let getResult = await client.send(getCommand);
      return{success:true, getResult:getResult};
    } catch (error){
      return {success:false};
    }
  }

  const putUserGPTUsage = async (user_id) => {
    try{
        let currentDate = new Date().toJSON().slice(0, 10);
        var putItemParams = {
            TableName: "alpha_gpt_api_usage",
            Item: {
            user_id: { S: user_id.toString() },
            date: {
                M: {
                    [currentDate]: { N: "1" }
                }
            }
            },
        };
        const putItemCommand = new PutItemCommand(putItemParams);
        const putResult = await client.send(putItemCommand);
        return {success:true};
      }
      catch(err){
        return {success:false};

      }
  }

  const updateUserGPTUsage = async (user_id,date, newValue ) => {

    try{
        const updateParams = {
            TableName: "alpha_gpt_api_usage",
            Key: {
                "user_id": { S: user_id.toString() }
            },
            UpdateExpression: "SET #date.#currentDate = :newValue",
            ExpressionAttributeNames: {
                "#date": "date",
                "#currentDate": date
            },
            ExpressionAttributeValues: {
                ":newValue": { N: newValue.toString() }
            }
        };

        const updateCommand = new UpdateItemCommand(updateParams);
        await client.send(updateCommand);
        return {success:true};
      }
      catch(err){
        return {success:false};

      }
  }



  async function userGPTUsage(req,res,next) {
    
    try{
      let currentDate = new Date().toJSON().slice(0, 10);

      
    
  

    
        const userGPTUsage = unmarshall(getResult?.Item);
        const date = Object.keys(userGPTUsage.date)[0];
        
            if(date == currentDate)
            {
                const userPremiumData = await verifyPremium(user_id);
                if(userPremiumData?.verification && userPremiumData?.subscriptionStatus === 'active'){
                    if(userGPTUsage.date[date] >= process.env.ALPHAGPT_API_CALL_PREMIUM){
                        return res.send('You have exhausted your daily AlphaGPT usage!')
                    }
                    
                    else{
                        let newValue = userGPTUsage.date[date];
                        newValue = newValue + 1;
                        const updateResponse = await updateUserGPTUsage(user_id,date,newValue);
                        if(updateResponse.success){
                          next();
                        }
                        else{
                          return res.send('AlphaGPT is under maintainence!');
                        }
                    }
                }

                else{
                    
                    if(userGPTUsage.date[date] >= process.env.ALPHAGPT_API_CALL){
                        return res.send('You have exhausted your daily AlphaGPT usage!')
                    }

                    else{
                        let newValue = userGPTUsage.date[date];
                        newValue = newValue + 1;
                        const updateResponse = await updateUserGPTUsage(user_id,date,newValue);
                        if(updateResponse.success){
                          next();
                        }
                        else{
                          return res.send('AlphaGPT is under maintainence!');
                        }
                    }
                }
            }
            else{
              const putResponse = await putUserGPTUsage(user_id);
              if(putResponse.success){
                next();
              }
              else{
                return res.send('AlphaGPT is under maintainence!');
              }
            }
      }
    catch(error){
        return res.send('AlphaGPT is under maintainence!');
    }
  }
  
  module.exports = {
    userGPTUsage,
  };
  