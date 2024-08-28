const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const crypto = require("crypto");


const generateId = () => {
  const genRanHex = crypto.randomBytes(20).toString("hex");
  return genRanHex;
}

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function contactModel(req,res) {

  try {

  const issue_id = generateId();
  const email = req.body.user_email;
  const subject = req.body.user_subject;
  const message = req.body.user_message;

    const params = {
      TableName: "user-contact",
      Item: marshall({
        issue_id: issue_id,
        email:email,
        subject:subject,
        message:message
      }),
    };

    const command = new PutItemCommand(params);
    await client.send(command);
    return res.status(200).json({succcess:true , message:"Message Inserted Successful"});

    } catch (err) {
      return res.status(500).json({succcess:false , message:"Alpha Algo is under maintainence!"})
    }
}

module.exports = {
  contactModel
};
