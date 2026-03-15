import { Octokit } from "@octokit/rest";
import "dotenv/config";

const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

// error hancling with ai
function buildGithubErrorDetails(error, owner, repo) {
  const responseData = error?.response?.data || {};
  const request = error?.request || {};

  return {
    message: error?.message || "Unknown GitHub API error",
    status: error?.status || error?.response?.status || 500,
    owner,
    repo,
    request: {
      method: request.method || "GET",
      url: request.url || null,
    },
    github: {
      apiMessage: responseData.message || null,
      documentationUrl: responseData.documentation_url || null,
      errors: Array.isArray(responseData.errors) ? responseData.errors : [],
      requestId: error?.response?.headers?.["x-github-request-id"] || null,
    },
  };
}

// Logs the error details and re-throws as a typed GitHubServiceError.
function throwGithubError(error, owner, repo) {
  const details = buildGithubErrorDetails(error, owner, repo);

  console.error(
    `[GitHubService] ${details.status} ${details.request.method} ${details.request.url ?? ""} — ${details.message}`,
    "\nDetails:",
    JSON.stringify(details, null, 2),
  );

  const enhanced = new Error(details.message);
  enhanced.name = "GitHubServiceError";
  enhanced.status = details.status;
  enhanced.details = details;
  enhanced.cause = error;

  throw enhanced;
}

export async function getLatestCommitSHA(owner, repo) {
  try {
    // repo ka metadata
    const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
    const default_branch = repoInfo.default_branch;

    // fetch branch an the sha (commits)
    const { data: branchInfo } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: default_branch,
    });

    return branchInfo.commit.sha;
  } catch (error) {
    throwGithubError(error, owner, repo);
  }
}

export async function getRepoTree(owner, repo, commitSha) {
  try {
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: commitSha,
      recursive: 1,
    });
    return tree;
  } catch (error) {
    throwGithubError(error, owner, repo);
  }
}

export async function getFileContent(owner, repo, filePath) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    const cleanBas64 = data.content.replace(/\n/g, "");

    const fileText = Buffer.from(cleanBas64, "base64").toString("utf8");

    return fileText;
  } catch (error) {
    throwGithubError(error, owner, repo);
    return null;
  }
}
