let adobe = require("@adobe/documentservices-pdftools-node-sdk");

async function createPdf(rawFile, outputPdf) {
    try {
        // configurations
        const credentials =  adobe.Credentials
            .serviceAccountCredentialsBuilder()
            .fromFile("./src/pdftools-api-credentials.json")
            .build();

        // Capture the credential from app and show create the context
        const executionContext = adobe.ExecutionContext.create(credentials),
            operation = adobe.CreatePDF.Operation.createNew();

        // Pass the content as input (stream)
        const input = adobe.FileRef.createFromLocalFile(rawFile);
        operation.setInput(input);

        // Async create the PDF
        let result = await operation.execute(executionContext);
        await result.saveAsFile(outputPdf);
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    }
}

async function combinePdf(pdfs, outputPdf) {
    try {
        // configurations
        const credentials = adobe.Credentials
            .serviceAccountCredentialsBuilder()
            .fromFile("./src/pdftools-api-credentials.json")
            .build();

        // Capture the credential from app and show create the context
        const executionContext = adobe.ExecutionContext.create(credentials),
            operation = adobe.CombineFiles.Operation.createNew();

        // Pass the PDF content as input (stream)
        for (let pdf of pdfs) {
            const source = adobe.FileRef.createFromLocalFile(pdf);
            operation.addInput(source);
        }

        // Async create the PDF
        let result = await operation.execute(executionContext);
        await result.saveAsFile(outputPdf);
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    }
}

module.exports = {
    createPdf: createPdf,
    combinePdf: combinePdf
}
