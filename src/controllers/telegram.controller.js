const { default: axios } = require('axios');
const Groups = require('../models/Groups');
const Student = require('../models/Student');

module.exports.sendMessageToGroup = async (req, res) => {
  try {
    const { groupName, message } = req.body;

    const group = await Groups.findOne({ groupName });

    if (!group) {
      return res.status(404).json({
        type: 'error',
        message: 'Такої групи не існує',
      });
    }
    if (!group.students.length) {
      return res.status(404).json({
        type: 'error',
        message: 'У групі не має студентів',
      });
    }

    group.students.forEach(async (student) => {
      await axios
        .post(
          `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${student.student.id}&text=${message}`
        )
        .catch((err) => {
          Student.findOneAndDelete({ id: student.student.id }, (err) => {
            if (err) console.log(err);
          });
          Groups.findOneAndUpdate(
            {
              groupName: groupName,
            },
            { $pull: { students: student } },
            { new: true },
            (err) => {
              if (err) console.log(err);
            }
          );
        });
    });

    return res.status(200).json({
      type: 'success',
      message: `Повідомлення відправлено у групу ${groupName}`,
    });
  } catch (err) {
    if (err) console.log(err);
  }
};
