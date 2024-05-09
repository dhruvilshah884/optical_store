const mongoose = require('mongoose');
let database = 'BigBazaarOpticalShop';


mongoose.connect(`mongodb://localhost:27017/${database}`)
.then((res) => console.log('database connected'))
.catch((error) => console.log(error))