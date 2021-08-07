import express from "express";

const app = express();
const port =  3000;

const handleListener = () => console.log(`Listening on http://localhost:${port}`);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));

app.listen(port, handleListener);