const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.js');
const Role = require('../models/Role.js');

const generateAccessToken = (id, username, roles) => {
  const payload = {
    id,
    username,
    roles,
  };

  return jwt.sign(payload, process.env.SECRET, { expiresIn: '24h' });
};

const map = new Map();
// tg
module.exports.getToken = async (req, res) => {
  try {
    const { _id, code } = req.body;
    const admin = await Admin.findOne({ _id });
    const token = generateAccessToken(admin._id, admin.username, admin.roles);
    map.set(code, {
      token,
      userInfo: {
        _id: admin._id,
        username: admin.username,
        roles: admin.roles,
      },
      isAuth: true,
    });
    res.json({ token, message: 'Можете повертатися до адмені панелі' });
  } catch (err) {
    res.json({ err, message: 'Щось пішло не так' });
  }
};
// web
module.exports.login = async (req, res) => {
  const { code } = req.body;
  if (map.get(code)) {
    try {
      const admin = await Admin.findOne({ _id: map.get(code).userInfo._id });

      if (!admin.roles.length) {
        const userRole = await Role.findOne({ value: 'USER' });
        Admin.findByIdAndUpdate(
          { _id: map.get(code).userInfo._id },
          { $set: { roles: [userRole.value] } },
          { new: true },
          (err) => {
            if (err) console.log(err);
          }
        );
      }
      map.get(code).userInfo.roles = admin.roles;
      res.status(200).json(map.get(code));

      let token = await map.get(code).token;
      let _id = await map.get(code).userInfo._id;
      Admin.findByIdAndUpdate(
        { _id },
        { $set: { token } },
        { new: true },
        (err) => {
          if (err) console.log(err);
        }
      );

      map.delete(code);
    } catch (err) {
      if (err)
        res.status(500).json({ message: 'Помилка сервера', type: 'error' });
    }
  } else {
    return res.status(404).json({ message: 'Код не знайдено', type: 'error' });
  }
};

module.exports.checkAuth = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodeData = jwt.verify(token, process.env.SECRET);
    Admin.findOne({ _id: decodeData.id }, (err, admin) => {
      if (admin) {
        if (admin.token === token) {
          return res.status(200).json({
            userInfo: {
              username: admin.username,
              _id: admin._id,
              roles: admin.roles,
            },
            isAuth: true,
          });
        }
      }
    });
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Будьласка авторизуйтеся',
        type: 'error',
        isAuth: false,
      });
    }
  }
};
