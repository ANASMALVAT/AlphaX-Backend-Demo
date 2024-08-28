const { DynamoDBClient, GetItemCommand  } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");


const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  async function fetchDriverCode(req,res,next) {
  
    try {

      const problemId = req.body.problemId;

      if(typeof problemId === "undefined"){
          return res.status(404).json({succcess:false , message:"Question doesnot exist, please checkout our question list."})
      }

      const params = {
        TableName: "driver_code",
        Key:{ question_id  : {S : problemId} }
      };

      const command = new GetItemCommand(params);

      const createResult = await client.send(command);

      if (createResult?.Item === undefined) {
        return res.status(404).json({ success: false, message: "Question does not exist, please checkout our question list." });
      }

      req.driver_code = unmarshall(createResult?.Item?.driver_codes?.M);
      next();

    } catch (err) {
      return res.status(500).json({succcess:false , message:"Alpha Algo is under maintainence!"})
    }
  }

  module.exports = {
    fetchDriverCode
  };
  