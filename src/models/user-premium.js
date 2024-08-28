const {verifyPremium} = require("../middlewares/verifyPremiumUser");

  async function getPremiumUserData(req,res) {
    try {
        return res.status(200).json({success:true,isPremium:true, premiumUser:userData});
      }
      catch(err){
        return res.status(200).json({success:true,isPremium:true, premiumUser:userData});
      }
  }
         
  async function checkPremiumQuestionDetail(req,res) {
    try {
        return res.status(200).json({question_detail: req.question_detail,question_solution:{authorized:true, data: req.question_solution}});
     }
   catch (err) {  
     return res.status(401).json({success:false , message : "User is not Authorized!"})
   }
  }

  async function checkPremiumQuestionVisualize(req,res) {
    try {
        return res.status(200).json({success:true, question_visualize: req.question_visualize});
     }
   catch (err) {
     return res.status(500).json({success:false , message : "User is not Authorized!"})
   }
  }

  module.exports = {
    checkPremiumQuestionDetail,
    getPremiumUserData,
    checkPremiumQuestionVisualize
  };
  