const { DynamoDBClient, PutItemCommand,GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");


const stripe = require('stripe')(process.env.STRIPE_ACCESS_KEY);

const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });


  async function getPremiumUserData(user_id) {

    try {

      const params = {
        TableName: "user-premium",
        Key:{ user_id  : marshall(user_id.toString()) }
      };
      const command = new GetItemCommand(params);
      const premiumUser = await client.send(command);
     return premiumUser;
    } catch (err) {
      return null;
    }
  }

  async function userPremiumModel(userPremiumData) {

    try {

      const userData = getPremiumUserData(userPremiumData.user_id);
      if(userData?.Item){
        const unmarshallUserData = unmarshall(userData.Item);
        await stripe.subscriptions.cancel(unmarshallUserData.subscription_id);
      }
    }
    catch(err){
      console.log("Error in deleting user previous subscription!");
    }
    try{

     const params = {
      TableName: "user-premium",
      Item: marshall({
        user_id: userPremiumData?.user_id || "",
        user_email: userPremiumData?.customer_email || "",
        user_name:userPremiumData?.customer_name || "",
        session_id: userPremiumData?.stripeID || "",
        customer_id:userPremiumData?.customerID || "",
        subscription_id:userPremiumData?.subscriptionID || ""
      }),
    };
  
      const command = new PutItemCommand(params);
  
      const createResult = await client.send(command);
      return createResult;

    } catch (err) {
      return {success:false};
    }
  }
  
  module.exports = {
    userPremiumModel
  };
  