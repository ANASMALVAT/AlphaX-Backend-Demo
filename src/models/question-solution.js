const { DynamoDBClient, GetItemCommand  } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  async function fetchQuestionSolution(req,res,next) {

    try {
    const question_id = req.headers.question_id;

    console.log(question_id);

    const params = {
      TableName: "question_solution",
      Key:{ question_id  : {S : question_id} }
    };

    const command = new GetItemCommand(params);
    const createResult = await client.send(command);

    if (createResult?.Item === undefined) {
      return res.status(404).json({ success: false, message: "Question does not exist, please checkout our question list." });
    }

    req.question_solution = createResult.Item;

    if(createResult?.Item?.isFree?.BOOL){
      return res.status(200).json({question_detail: req.question_detail , question_solution:{ authorized:true, data: req.question_solution}});
    }

    next();

    } catch (err) {
      return res.status(500).json({succcess:false , message:"Alpha Algo is under maintainence!"})
    }
  }

  module.exports = {
    fetchQuestionSolution
  };
