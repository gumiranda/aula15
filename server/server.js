/* eslint-disable import/order */
/* eslint-disable no-use-before-define */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const variables = require('./bin/configuration/variables');
const helmet = require('helmet');

// EXPRESS BRUTE FORCE
const ExpressBrute = require('express-brute');
const MongooseStore = require('express-brute-mongoose');
const BruteForceSchema = require('express-brute-mongoose/dist/schema');

//EXPRESS RATE LIMIT
const rateLimit = require('express-rate-limit');
const rateLimitStore = require('@lykmapipo/rate-limit-mongoose');

// ROTAS
const userRouter = require('./modules/user/routes/user-router');
const cardRouter = require('./modules/payment/routes/card-router');
const chatRouter = require('./modules/chat/routes/chat-router');
const transactionRouter = require('./modules/payment/routes/transaction-router');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// eslint-disable-next-line no-unused-vars
const connectedUsers = {};

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  return next();
});
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin), // || '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,HEAD,DELETE,OPTIONS',
    );
  res.header(
    'Access-Control-Allow-Headers',
    'content-Type,x-requested-with,Authorization',
  );
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());

mongoose.connect(variables.Database.connection, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

//brute force
const model = mongoose.model(
  'bruteforce',
  new mongoose.Schema(BruteForceSchema),
);
const store = new MongooseStore(model);
const bruteForce = new ExpressBrute(store);

//rate limiter
const windowMs = 15 * 60 * 1000;
const storeLimiter = rateLimitStore({ windowMs });
const limiter = rateLimit({ storeLimiter, windowMs, max: 100 });

app.use(limiter);

app.use('/api/user', bruteForce.prevent, userRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/card', cardRouter);
app.use('/api/chat', chatRouter);

const port = process.env.PORT || 3333;

server.listen(port, () => {
  io.on('connection', (socket) => {
    const { user_id } = socket.handshake.query;
    connectedUsers[user_id] = socket.id;
  });

  console.info(`Servidor rodando na porta ${port}`);
});
