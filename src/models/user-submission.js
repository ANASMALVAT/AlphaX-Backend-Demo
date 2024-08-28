const { DynamoDBClient, UpdateItemCommand ,GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall,unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const getUserSubmissionsMethod = async (user_id,question_id) => {

    const getItemParams = {
      "ExpressionAttributeNames": {
        "#QD": question_id
      },
      "Key": {
        "user_id": {
          "S": user_id.toString()
        },
      },
      "ProjectionExpression":"#QD",
      "TableName": "user-submission"
    };

    const getCommand = new GetItemCommand(getItemParams);

    try {
      let getResult = await client.send(getCommand);
      getResult = unmarshall(getResult?.Item || []);
      return getResult[question_id] || [];
      
    } catch (error){
      console.log('Error scanning the table:', error);
    }

  }

  async function getUserSubmission(req,res) {
    try{

      const question_id = req.query.questionId;
      const user_id = req.user_id;

      const getResult = await getUserSubmissionsMethod(user_id,question_id);
      return res.status(200).json({succcess:true , userSubmissions: getResult || []})
    }
    catch(error){
      return res.status(500).json({succcess:false , message:"Error fetching user submission"})
    }
  }

  async function putUserSubmission(req,res) {
    try {

      const { language_id, source_code, isRunning,problemId } = req.body;

      if(isRunning) return;

      const code_language = language_id.value;
      const user_code = source_code;
      const user_id = req.user_id;
      const question_id = problemId;

      let getResult = await getUserSubmissionsMethod(user_id,question_id);

      const currentDateTime = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });

      const newSubmission = {
        user_code: user_code,
        code_language: code_language,
        submission_time: currentDateTime
      };

      if (Array.isArray(getResult)) {
        getResult.unshift(newSubmission);
        getResult = getResult.slice(0, 5);
      } else {
        getResult = [newSubmission];
      }

      const updateItemParams = {
        TableName: "user-submission",
        "Key": {
          "user_id": {
            "S": user_id.toString()
          },
        },
        "ExpressionAttributeNames": {
          "#QD": question_id,
        },
        "ExpressionAttributeValues": {
          ":v": {
            "L": marshall(getResult)
          },
        },
        "UpdateExpression": "SET #QD = :v",
      };

      const updateCommand = new UpdateItemCommand(updateItemParams);
      await client.send(updateCommand);

    } catch (err) {
      res.send("Error submitting code!");
    }
  }

  
  
  module.exports = {
    putUserSubmission,
    getUserSubmission
  };
  