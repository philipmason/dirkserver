var createError = require("http-errors"),
  express = require("express"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  logger = require("morgan"),
  sqlite3 = require("sqlite3").verbose(),
  wedding = new sqlite3.Database("./data/wedding.db");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.get("/api", (req, res) => {
  console.log("req", req, "req.query", req.query);
  res.json({ message: "API call OK", req: req.query.x }); // picks up ?x=123
});

// http://localhost:3000/sql/wedding/insert%20into%20responses(name)%20values('%20dirk')
app.get("/sql/:db/:code", (req, res) => {
  console.log("db", req.params.db, "code", req.params.code);
  const db = eval(req.params.db),
    sql = req.params.code,
    params = [];
  console.log("db: ", db, "req.params.db", req.params.db, "sql: ", sql);
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// http://localhost:3000/guests
app.get("/guests", (req, res) => {
  const db = eval(wedding),
    sql = "select * from guests",
    params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
