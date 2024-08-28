const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall,unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function userLoginModel(id,email,given_name,profile_url) {

try {
  const user_id = id;
  const params = {
     TableName: "user",
     Key:{ user_id  : {S : user_id.toString()} }
  };

  const getCommand = new GetItemCommand(params);
  const userData = await client.send(getCommand);
  if(userData.Item){

      const updateItemParams = {

        TableName: "user",
        "Key": {
          "user_id": {
            "S": id.toString()
          },
        },
        "ExpressionAttributeNames": {
          "#UM": "user_mail",
          "#UN": "user_name",
          "#UP": "user_profile",

        },
        "ExpressionAttributeValues": {
          ":ve": {
            "S": email
          },
          ":vn": {
            "S": given_name
          },
          ":vp": {
            "S": profile_url
          },
        },
        UpdateExpression: "SET #UM = :ve, #UN = :vn, #UP = :vp"
      };

      const updateCommand = new UpdateItemCommand(updateItemParams);
      const updateData = await client.send(updateCommand);
      return updateData;
  }
  else{
      const putItemParams = {
          TableName: "user",
          Item: {
            user_id :marshall(id.toString()),
            user_mail:marshall(email),
            user_name:marshall(given_name),
            user_profile:marshall(profile_url)
          }
      };

      const putItemCommand = new PutItemCommand(putItemParams);
      const putResult = await client.send(putItemCommand);
      return putResult;
    }
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}


async function getUserData(req,res,next) {

  const user_id = req.user_id;
  
   const params = {
      TableName: "user",
      Key:{ user_id  : {S : user_id.toString()} }
    };

  const command = new GetItemCommand(params);

  try {
    const userData = await client.send(command);
    const alphaUser =  unmarshall(userData?.Item);
    return alphaUser;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  userLoginModel,
  getUserData
};
