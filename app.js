const express = require('express');
const cron = require('node-cron');
const moment = require('moment');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const nodemailer = require('nodemailer');

const userRouter = require('./routes/userRoutes');
const listRouter = require('./routes/shoppingListRoutes');
const storeRouter = require('./routes/storeRoutes');
const userListRouter = require('./routes/userListRoutes');
const ShoppingList = require('./model/shoppingListModel');
const Email = require('./utils/email');
const User = require('./model/userModel');

const app = express();

// Development logging
if(process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Implementing CORS
app.use(cors());

// Security HTTP Headers
app.use(helmet());

// Implementing rate limiting(Limit from same IP)
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP address! Please try again later in one Hour'
});

// Rate limiting middleware to prevent XSS attack
app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' })) // Limit the amount of data that comes in the body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss()); // Clean malicious HTML code

// Serving static file
app.use(express.static(`${__dirname}/public`));

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

app.use((req, res, next) => {
  // const date = moment('21/11/2022 2:30PM', 'DD/MM/YYYY h:mmA');

  cron.schedule('* * * * * *', async() => {
    const lists = await ShoppingList.find();

    // console.log(lists);

    lists.forEach( async (el) => {
      // console.log(el);
      // console.log(el.userEmail);
      let reminderDate = el.reminder;
      let momentReminderDate = moment(reminderDate, 'DD/MM/YYYY h:mmA').toString();
      let momentCurrentDate = moment().toString(Date.now());
      // console.log(momentReminderDate, momentCurrentDate);

      if(momentReminderDate === momentCurrentDate) {
        const user = await User.findOne({email: el.userEmail});
        // console.log(el.userEmail);
        // console.log(user);
        await new Email(user).reminder();
        console.log('sent');
      //   const mailOptions = {
      //     from: `Chibueze Chukwu <${process.env.EMAIL_FROM}>`,
      //     to: 'chriscrea8@gmail.com',
      //     subject: `Your ShoppingList Reminder`,
      //     html: `Wishing You a <b>Happy birthday ${el.name}</b> On Your 18, Enjoy your day \n <small>this is auto generated</small>`                       
      // };
      // return transporter.sendMail(mailOptions, (error, data) => {
      //     if (error) {
      //         console.log(error)
      //         return
      //     }
      // });
      }
    })
  })

  next();
});

// ROUTES
app.use('/api/v1/mart-bag/users', userRouter);
app.use('/api/v1/mart-bag/userList', userListRouter);
app.use('/api/v1/mart-bag/shoppingList', listRouter);
app.use('/api/v1/mart-bag/store', storeRouter);

module.exports  =app;