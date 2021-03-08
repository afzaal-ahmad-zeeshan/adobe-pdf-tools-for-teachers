const express = require("express");
let router = express.Router();

// read the files
let fs = require('fs');

router.get("/", (req, res) => {
    try {
        let files = [];
        fs.readdirSync('./public/documents/raw').forEach(file => {
            files.push(file);
        });
        res.status(200).render("admin", { page: 'admin', files: files });
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

router.post('/', (req, res) => {
    try {
        if(!req.files) {
            res.status(400).render("crash", { error: "No files uploaded." });
        } else {
            let file = req.files.report;
            file.mv('./public/documents/raw/' + file.name);
            res.redirect("/admin");
        }
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

module.exports = router;
