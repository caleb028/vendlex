import fs from "fs";
import path from "path";
import { DocumentStore } from "../lib/documents/store";
import { VendLexPDFEngine } from "../lib/documents/pdf-engine";

async function exportAllSamplePdfs() {
  console.log("\n=======================================================");
  console.log("📄 EXPORTING ALL VENDLEX OFFICIAL SAMPLE DOCUMENTS");
  console.log("=======================================================\n");

  const outputDir = path.resolve(__dirname, "../sample-documents");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allDocs = DocumentStore.getAll();
  console.log(`Found ${allDocs.length} authoritative document records in database.\n`);

  for (const doc of allDocs) {
    try {
      console.log(`Generating: ${doc.publicDocumentId} (${doc.documentType}) - ${doc.title}...`);
      const result = await VendLexPDFEngine.renderDocumentPDF(doc);
      
      const fileName = `${doc.publicDocumentId}_${doc.documentType}.pdf`;
      const filePath = path.join(outputDir, fileName);

      fs.writeFileSync(filePath, Buffer.from(result.pdfBytes));
      console.log(`  ✓ Saved: ${filePath} (${result.pdfBytes.length} bytes)\n`);
    } catch (err) {
      console.error(`  ✗ Error rendering ${doc.publicDocumentId}:`, err);
    }
  }

  console.log("=======================================================");
  console.log(`🎉 ALL SAMPLE DOCUMENTS SUCCESSFULLY EXPORTED TO:`);
  console.log(`${outputDir}`);
  console.log("=======================================================\n");
}

exportAllSamplePdfs();
