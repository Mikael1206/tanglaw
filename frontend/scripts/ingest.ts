import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const dataPath = path.join(__dirname, "..", "data");
  const outputPath = path.join(__dirname, "..", "public", "hnsw_index");

  if (!fs.existsSync(dataPath)) {
    console.error("Data directory not found. Please create 'frontend/data' and add PDF files.");
    return;
  }

  const docs: any[] = [];
  const files = fs.readdirSync(dataPath);
  
  if (files.length === 0) {
    console.warn("No files found in data directory.");
    return;
  }

  for (const file of files) {
    if (file.toLowerCase().endsWith(".pdf")) {
      console.log(`Loading document: ${file}`);
      const loader = new PDFLoader(path.join(dataPath, file));
      docs.push(...(await loader.load()));
    }
  }

  if (docs.length === 0) {
    console.error("No PDF documents were loaded.");
    return;
  }

  console.log(`Loaded ${docs.length} document pages.`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`Split into ${splitDocs.length} chunks.`);

  console.log("Generating embeddings and creating HNSW index (this may take a minute)...");
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  const vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
  
  await vectorStore.save(outputPath);
  console.log(`Vector store successfully saved to: ${outputPath}`);
}

run().catch((err) => {
  console.error("Ingestion failed:", err);
});
