import pLimit from "p-limit";
import {
  getLatestCommitSHA,
  getRepoTree,
  getFileContent,
} from "./github.service.js";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { codeFiles } from "../db/schema.js";

const OWNER = "Upadhyay-Om";
const REPO = "CRUD-postgresssql";

const allowedExtensions = [
  // JavaScript / TypeScript
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  // Web
  ".html",
  ".css",
  // Docs
  ".md",
  ".mdx",
  ".rst",
  ".txt",
  // Config / Data
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  // Backend languages
  ".py",
  ".go",
  ".rs",
  ".java",
  ".rb",
  ".php",
  ".cs",
  ".kt",
  ".swift",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  // DB / Schema
  ".sql",
  ".prisma",
  ".graphql",
  ".gql",
  // Scripts & env templates
  ".sh",
  ".bash",
  ".env.example",
];
const excludedDirs = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  "coverage",
  ".turbo",
  ".vscode",
  ".idea",
  "__pycache__",
  "vendor",
  "tmp",
  "logs",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
];

const BATCH_SIZE = 5;

function shouldIncludeFile(item) {
  const fileType = item.type === "blob";
  const isAllowedExt = allowedExtensions.some(
    (ext) => item.path.toLowerCase().endsWith(ext.toLowerCase()), // chks that is the ext allowed or not
  );
  const exludeDir = excludedDirs.some((dir) => item.path.startsWith(dir));

  return fileType && isAllowedExt && !exludeDir;
}

async function fetchFilesWithConcurrency(files, concurrency = BATCH_SIZE) {
  const limit = pLimit(concurrency);

  const results = await Promise.all(
    files.map((file) => {
      return limit(async () => {
        process.stdout.write(`  Fetching: ${file.path} ... `);
        const code = await getFileContent(OWNER, REPO, file.path);

        if (code) {
          process.stdout.write("✓\n");
          return {
            path: file.path,
            code,
          };
        }
        return null;
      });
    }),
  );
  return results.filter(Boolean);
}

async function runIngestion({ limit = Infinity } = {}) {
  const SEPARATOR = "======================================";
  console.log(`\n🚀 Starting ingestion for ${OWNER}/${REPO}\n`);

  // step 1 getLatestCommitSHA
  const LatestSha = await getLatestCommitSHA(OWNER, REPO);
  console.log(`The Commit Sha is ${LatestSha}`);

  // Step 2: Get a flat list of every file and folder in the repo at that SHA
  const treeData = await getRepoTree(OWNER, REPO, LatestSha);
  const allItems = treeData.tree || []; // get the inner tree array
  console.log(`✓ Total items in repo (files + folders): ${allItems.length}`);
  // step 3
  const filesToFetch = allItems.filter(shouldIncludeFile).slice(0, limit);
  console.log(`✓ Files to ingest: ${filesToFetch.length}\n`);

  console.log(
    `Fetching ${filesToFetch.length} files (${BATCH_SIZE} at a time)...\n`,
  );
  const ingestedFiles = await fetchFilesWithConcurrency(filesToFetch);

  console.log(`\n${SEPARATOR}`);
  console.log(
    `✅ Done! Fetched ${ingestedFiles.length} / ${filesToFetch.length} files.`,
  );
  console.log(`${SEPARATOR}\n`);

  // Save to database
  if (ingestedFiles.length > 0) {
    const rows = ingestedFiles.map((file) => ({
      owner: OWNER,
      repo: REPO,
      commitSha: LatestSha,
      filePath: file.path,
      content: file.code,
    }));

    const inserted = await db.insert(codeFiles).values(rows).returning();
    console.log(`Saved ${inserted.length} files to database.`);

    const firstFile = inserted[0];
    if (firstFile) {
      console.log(`Preview of "${firstFile.filePath}":\n`);
      console.log(firstFile.content.slice(0, 200) + "\n...");
    }

    return inserted;
  }

  return [];
}

export const ingestRepo = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : Infinity;

    // Optional: Make owner/repo dynamic from request body or query params
    // const { owner = OWNER, repo = REPO } = req.body;

    const ingestedFiles = await runIngestion({ limit });

    res.status(200).json({
      success: true,
      message: "Repo ingested successfully",
      count: ingestedFiles.length,
      data: ingestedFiles,
    });
  } catch (error) {
    next(error); // This skips directly to your error handler in server.js
  }
};
