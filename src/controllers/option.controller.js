const Admin = require('../models/Admin');
const Groups = require('../models/Groups');
const MainGroup = require('../models/MainGroup');
const Student = require('../models/Student');

module.exports.createTeacherGroup = async (req, res) => {
  const { groupName, teacherName } = req.body;
  try {
    if (!teacherName || !groupName) {
      return res.status(500).json({
        type: 'error',
        message: 'Всі поля повинні бути заповнені',
      });
    }
    const admin = await Admin.findOne({ username: teacherName });
    const group = await Groups.findOne({ groupName });
    const mainGroup = await MainGroup.findOne({ groupName: groupName });

    if (admin || mainGroup || group) {
      return res.status(200).json({
        type: 'error',
        message: 'Такий викладач і група вже існують',
      });
    }
    new Admin({
      username: teacherName,
      group: groupName,
      subGroup: '',
    }).save();

    new Groups({
      groupName,
      admin: teacherName,
    }).save();

    await new MainGroup({
      groupName,
    }).save();

    return res
      .status(200)
      .json({ type: 'success', message: 'Викладача успішно створений' });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при створенні викладача',
    });
  }
};

let res;
const checkSubGroup = (mainGroup, subGroupName) => {
  if (mainGroup.subGroup !== null) {
    res = mainGroup.subGroup.find((item) => item.groupName === subGroupName);
  } else {
    return false;
  }
  return res;
};

module.exports.createTeacherSubGroup = async (req, res) => {
  try {
    const { teacherName, groupName, subGroupName } = req.body;

    const admin = await Admin.findOne({ username: teacherName });
    const group = await Groups.findOne({ groupName: subGroupName });
    const mainGroup = await MainGroup.findOne({ groupName: groupName });

    if (!teacherName || !groupName || !subGroupName) {
      return res.status(500).json({
        type: 'error',
        message: 'Всі поля повинні бути заповнені',
      });
    }

    if (!admin) {
      new Admin({
        username: teacherName,
        group: groupName,
        subGroup: subGroupName,
      }).save();
    }

    if (!group) {
      new Groups({
        groupName: subGroupName,
        admin: teacherName,
      }).save();
    }

    if (!mainGroup) {
      await new MainGroup({
        groupName,
      }).save();
    }
    if (!checkSubGroup(mainGroup, subGroupName)) {
      MainGroup.findOneAndUpdate(
        { groupName },
        {
          $push: {
            subGroup: { groupName: subGroupName },
          },
        },
        (err) => {
          if (err) console.log(err);
        }
      );
    } else {
      return res.status(500).json({
        type: 'error',
        message: `Підгрупа ${subGroupName} вже існує`,
      });
    }

    return res.status(200).json({
      type: 'success',
      message: 'Викладача підгрупи успішно створено',
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при створенні викладача',
    });
  }
};

module.exports.getGroups = async (req, res) => {
  const { teacherName } = req.body;

  try {
    const groups = await Groups.find({ admin: teacherName });

    if (!groups.length) {
      return res.status(404).json({
        type: 'error',
        message: 'У вас не має груп',
      });
    }
    return res.status(200).json({
      type: 'success',
      message: 'Список груп успішно отримано',
      list: groups,
    });
  } catch (err) {
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при отриманні списку груп',
    });
  }
};

module.exports.getAllGroups = async (req, res) => {
  try {
    let groups = await Groups.find();

    res.status(200).json({
      type: 'success',
      message: 'Список груп успішно отримано',
      groups,
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при отриманні списку груп',
    });
  }
};

module.exports.deleteStudent = async (req, res) => {
  try {
    const { id, username, group } = req.body;
    Student.findOneAndDelete({ id: id }, (err) => {
      if (err) {
        return res.status(500).json({
          message: 'Сталася помилка при виделенні студента',
          type: 'error',
        });
      }
    });

    Groups.findOneAndUpdate(
      { groupName: group },
      {
        $pull: {
          students: {
            student: { username: username, id: id, group: group },
          },
        },
      },
      { new: true },
      (err) => {
        if (err) {
          return res.status(500).json({
            message: 'Сталася помилка при виделенні студента з групи',
            type: 'error',
          });
        }
      }
    );
    return res
      .status(200)
      .json({ type: 'success', message: 'Студент успішно видалений' });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при видаленні студента',
    });
  }
};

module.exports.renameGroup = async (req, res) => {
  try {
    const { groupName, newName } = req.body;

    const groups = await Groups.findOne({ groupName: newName });
    const curentGroup = await Groups.findOne({ groupName });
    const students = await Student.find({ group: groupName });

    if (groups) {
      return res.status(500).json({
        type: 'error',
        message: 'Така група вже існує, оберіть іншу назву',
      });
    }
    const mainGroup = await MainGroup.findOne({
      subGroup: { $elemMatch: { groupName } },
    });

    if (mainGroup && mainGroup.subGroup.length) {
      await mainGroup.updateOne({
        $pull: {
          subGroup: {
            groupName: groupName,
          },
        },
      });
      await mainGroup.updateOne({
        $push: {
          subGroup: {
            groupName: newName,
          },
        },
      });
    }

    if (students.length) {
      Student.updateMany(
        { group: groupName },
        { $set: { group: newName } },
        (err) => {
          if (err) console.log(err);
        }
      );
    }
    Admin.updateOne(
      { group: groupName },
      { $set: { group: newName } },
      (err) => {
        if (err) console.log(err);
      }
    );
    Groups.updateOne({ groupName }, { $set: { groupName: newName } }, (err) => {
      if (err) console.log(err);
    });

    curentGroup.students.forEach(({ student }) => {
      Groups.findOneAndUpdate(
        { groupName },
        {
          $set: {
            students: {
              student: { ...student, group: newName },
            },
          },
        },
        { new: true },
        (err) => {
          if (err) {
            return res.status(500).json({
              message: 'Сталася помилка при виделенні студента з групи',
              type: 'error',
            });
          }
        }
      );
    });

    MainGroup.updateOne(
      { groupName },
      { $set: { groupName: newName } },
      (err) => {
        if (err) console.log(err);
      }
    );

    res.status(200).json({
      type: 'success',
      message: `Групу ${groupName} перейменовано у ${newName}`,
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при перейменуванні групи',
    });
  }
};

module.exports.getGroup = async (req, res) => {
  const { _id } = req.params;
  try {
    const group = await Groups.findOne({ _id });

    if (!group) {
      return res
        .status(404)
        .json({ type: 'error', message: 'Такої групи не існує' });
    }

    res.status(200).json(group);
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при отриманні групи',
    });
  }
};

module.exports.moveStudent = async (req, res) => {
  try {
    /**
     * students- array
     * moveTo - group where need to move
     */
    const { students, moveTo } = req.body;
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Сталася помилка при зміні групи студента',
    });
  }
};
