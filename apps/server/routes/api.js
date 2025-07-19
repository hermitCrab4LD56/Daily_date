// 文件路径: apps/server/routes/api.js (最终版)
const express = require('express');
const router = express.Router();

const { getFortune } = require('../controllers/fortuneController');
const { handleFormRegistration } = require('../controllers/registerController');

router.get('/fortune', getFortune);
router.post('/register', handleFormRegistration);

module.exports = router;