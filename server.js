const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

global.__basedir = __dirname;
// const path = require('path');
var fs = require('fs');
var multer = require('multer');
const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './upload');
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}_${file.originalname}`);
  },
});
var upload = multer({
  storage: Storage
}); //setting the default folder for multer

const app = express();

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(cors());

app.use(cors({
    origin: '*'
}));

let corsOptions = {
  origin: 'https://admin.scouthippo.com',
};

// app.use(express.static(path.join(__dirname, 'public')));

// simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to bezkoder application." });
// });
app.use('/upload', express.static(__dirname + '/upload'));
app.use('/pdf', express.static(__dirname + '/pdf'));
app.use('/signature', express.static(__dirname + '/signature'));

app.post('/upload', upload.single('fileData'), (req, res, next) => {
res.send({name: req.file.filename})
   // console.log(req.body);
  //below code will read the data from the upload folder. Multer     will automatically upload the file in that folder with an  autogenerated name
 });


app.post('/signature', (req, res, next) => {
  let fileName = `${Date.now()}_signature.png`
  fs.writeFile(`./signature/${fileName}`, req.body.uri, { encoding: 'base64' }, function (err) {
    console.log('File created');
  });
  res.send({ name: fileName })
});

require("./routes/user.routes.js")(app);
require("./routes/company.routes.js")(app);
require("./routes/branch.routes.js")(app);
require("./routes/client.routes.js")(app);
require("./routes/salesclient.routes.js")(app);
require("./routes/schedule.routes.js")(app);
require("./routes/file.routes.js")(app);
require("./routes/map_tracker.routes.js")(app);
require("./routes/setting.routes")(app);
require("./routes/visiting_reason.routes")(app);
require("./routes/product.routes")(app);
require("./routes/outcome.routes")(app);
require("./routes/landing_page.routes")(app);
require("./routes/absent.routes.js")(app);
require("./routes/custom_form.routes.js")(app);
 app.listen(4000, () => {
   console.log("Server is running on port 4000.");
 });