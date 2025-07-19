// 文件路径: apps/server/routes/api.js
const express = require('express');
const router = express.Router();
const { getFortune } = require('../controllers/fortuneController');
const { handleFormRegistration  } = require('../controllers/registerController');

router.get('/fortune', getFortune);
router.post('/register', handleFormRegistration); // 使用新的注册路由

module.exports = router;