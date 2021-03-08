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
        res.status(200).render("reports", { page: 'reports', files: files });
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

router.post('/', async (req, res) => {
    try {
        let reports = req.body.report;
        if (!reports || reports.length === 0) {
            res.status(400).render("crash", { error: "No report selected." });
            return;
        }

        if(!Array.isArray(reports)) {
            // Create one report and send it back
            try {
                console.log(`[INFO] generating the report...`);
                await pdf.createPdf(`./public/documents/raw/${reports}`, `./public/documents/processed/output.pdf`);

                console.log(`[INFO] sending the report...`);
                res.status(200).render("download", { page: 'reports', filename: 'output.pdf' });
            } catch(error) {
                console.log(`[ERROR] ${JSON.stringify(error)}`);
                res.status(500).render("crash", { error: error });
            }
        } else {
            try {
                console.log(`[INFO] creating a batch report...`);
                // Create a batch report and send it back
                let partials = [];
                for (let index in reports) {
                    const name = `partial-${index}-${reports[index]}`;
                    await pdf.createPdf(`./public/documents/raw/${reports[index]}`, `./public/documents/processed/${name}`);
                    partials.push(`./public/documents/processed/${name.replace('docx', 'pdf').replace('xlsx', 'pdf')}`);
                }

                await pdf.combinePdf(partials, `./public/documents/processed/output.pdf`);
                console.log(`[INFO] sending the combined report...`);
                res.status(200).render("download", { page: 'reports', filename: 'output.pdf' });
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

router.get('/download/:documentName', (req, res) => {
    try {
        res.sendFile(path.resolve(`./public/documents/processed/${req.params.documentName}`));
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

module.exports = router;
