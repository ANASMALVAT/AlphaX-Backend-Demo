const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall,unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


async function setUserProblemComplete(req,res,next) {
    

try {

    const user_id = req.user_id;
    const {problemId} = req.body;

    const params = {
      TableName: "user",
      Key:{ user_id  : {S : user_id.toString()} }
    };

    const command = new GetItemCommand(params);

    const userData = await client.send(command);
    const alphaUser = unmarshall(userData?.Item);

    const userCompletedProblems = alphaUser['completed_problems'] || [];
    if(!userCompletedProblems.includes(problemId)){
        userCompletedProblems.push(problemId);
    }
    else{
        next();
    }

    const updateItemParams = {

        TableName: "user",
        "Key": {
          "user_id": {
            "S": user_id.toString()
          },
        },
        "ExpressionAttributeNames": {
          "#CP": 'completed_problems',
        },
        "ExpressionAttributeValues": {
          ":v": {
            "L": marshall(userCompletedProblems)
          },
        },
        "UpdateExpression": "SET #CP = :v",
      };
      
      const updateCommand = new UpdateItemCommand(updateItemParams);
      await client.send(updateCommand);
      next();

  } catch (err) {
    console.log(err);
  }
}


module.exports = {
  setUserProblemComplete
};
