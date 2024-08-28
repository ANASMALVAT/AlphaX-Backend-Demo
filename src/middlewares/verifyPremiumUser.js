const {DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall,unmarshall } = require('@aws-sdk/util-dynamodb');

const stripe = require('stripe')(process.env.STRIPE_ACCESS_KEY);

const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

module.exports.verifyPremium = async (user_id) => {
  try{
        const params = {
            TableName: "user-premium",
            Key:{ user_id  : marshall(user_id.toString()) }
          };

        const command = new GetItemCommand(params);
        const premiumUser = await client.send(command);

        if(premiumUser?.Item){
            const premiumUserData = unmarshall(premiumUser?.Item);
            const userSubscription = await stripe.subscriptions.retrieve(premiumUserData.subscription_id);
            return {verification:true, subscriptionStatus: userSubscription.status,subscriptionData: userSubscription,premiumUserData:premiumUserData};
        }
        else {
            return {verification:true, subscriptionStatus: "NOT PREMIUM MEMBER",subscriptionData:null,premiumUserData:null};
        }
    }
  catch(err){
    return {verification:false, subscriptionStatus: "NOT PREMIUM MEMBER",subscriptionData:null,premiumUserData:null};
}
}