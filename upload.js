const upload = require("./storage");
const express = require('express');
const app = express();

app.post("/addproperties", upload.single("image"), async (req, res) => {
    if (req.file === undefined) return res.send("YOU MUST SELECT A FILE");
    const imgUrl = `http://localhost:3000/file/${req.file.filename}`;
    return res.send(imgUrl);
});
