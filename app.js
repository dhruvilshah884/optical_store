const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

const basicRouter = require('./routers/basicRouter');
const userRouter = require('./routers/userRouter');
const productRouter = require('./routers/productRouter');
const paymentRouter = require('./routers/paymentRouter');


app.use(express.static("./assets"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: 'tusharKothiya',
    resave: false,
    saveUninitialized: false
}));
app.use('/uploads', express.static('uploads'));

const template_path = path.join(__dirname, '/templates/views');
app.set('view engine', 'ejs');
app.set('views', template_path);


app.use('/', basicRouter);
app.use('/', userRouter);
app.use('/', productRouter);
app.use('/', paymentRouter);


app.get('*', (req,res) => {
    res.render('errorPage' );
})

app.listen(3000, () => {
    console.log('http://localhost:3000');
})