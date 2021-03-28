let express = require("express");
let router = express.Router();
let fs = require("fs");
let pdf = require("../helpers/pdf");
let path = require('path');

router.get('/', (req, res) => {
    try {
        let files = [];
        fs.readdirSync('./public/documents/raw').forEach(file => {
            files.push(file);
        });
        res.status(200).render("students", { page: 'students', files: files });
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

router.post('/', async (req, res) => {
    try {
        let documents = req.body.document;
        if (!documents || documents.length === 0) {
            res.status(400).render("crash", { error: "No report selected." });
            return;
        }

        if(!Array.isArray(documents)) {
            // Create one report and send it back
            try {
                console.log(`[INFO] generating the report...`);
                await pdf.createPdf(`./public/documents/raw/${documents}`, `./public/documents/processed/output.pdf`);

                console.log(`[INFO] sending the report...`);
                res.status(200).render("preview", { page: 'students', filename: 'output.pdf' });
            } catch(error) {
                console.log(`[ERROR] ${JSON.stringify(error)}`);
                res.status(500).render("crash", { error: error });
            }
        } else {
            try {
                console.log(`[INFO] creating a batch report...`);
                // Create a batch report and send it back
                let partials = [];
                for (let index in documents) {
                    const name = `partial-${index}-${documents[index]}`;
                    await pdf.createPdf(`./public/documents/raw/${documents[index]}`, `./public/documents/processed/${name}`);
                    partials.push(`./public/documents/processed/${name.replace('docx', 'pdf').replace('xlsx', 'pdf')}`);
                }

                await pdf.combinePdf(partials, `./public/documents/processed/output.pdf`);
                console.log(`[INFO] sending the combined report...`);
                res.status(200).render("preview", { page: 'students', filename: 'output.pdf' });
            } catch(error) {
                console.log(`[ERROR] ${JSON.stringify(error)}`);
                res.status(500).render("crash", { error: error });
            }
        }
    } catch (error) {
        console.log(`[ERROR] ${JSON.stringify(error)}`);
        res.status(500).render("crash", { error: error });
    }
});

router.get('/preview/:documentName', (req, res) => {
    res.status(200).render("preview", { page: 'students', filename: 'output.pdf' });
});

router.get('/download/:documentName', (req, res) => {
    try {
        res.sendFile(path.resolve(`./public/documents/processed/${req.params.documentName}`));
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

module.exports = router;
