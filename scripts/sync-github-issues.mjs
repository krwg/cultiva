#!/usr/bin/env node
/**
 * Create or close GitHub issues from scripts/github-issues.json
 * Usage: GITHUB_TOKEN=... node scripts/sync-github-issues.mjs [--dry-run]
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

function getToken() {
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN.trim();
  }
  try {
    return execSync('security find-internet-password -s github.com -a krwg -w', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

async function ghRequest(token, repo, method, path, body) {
  const res = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return data;
}

async function findOpenIssue(token, repo, title) {
  const q = encodeURIComponent(`repo:${repo} is:issue "${title.replace(/"/g, '')}" in:title`);
  const res = await fetch(`https://api.github.com/search/issues?q=${q}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });
  const data = await res.json();
  return data.items?.find((i) => i.title === title) || null;
}

async function main() {
  const config = JSON.parse(readFileSync(join(__dirname, 'github-issues.json'), 'utf8'));
  const token = getToken();
  if (!token && !dryRun) {
    console.error('[issues] No GITHUB_TOKEN — set env or add github.com credential for krwg');
    process.exit(1);
  }

  const repo = config.repo;
  console.log(`[issues] ${repo} — ${config.issues.length} definitions${dryRun ? ' (dry-run)' : ''}`);

  for (const item of config.issues) {
    const labels = item.labels || [];
    const body = item.body.trim();

    if (dryRun) {
      console.log(`  ${item.action || 'open'}: ${item.title}`);
      continue;
    }

    let issue = await findOpenIssue(token, repo, item.title);
    if (!issue) {
      issue = await ghRequest(token, repo, 'POST', 'issues', {
        title: item.title,
        body,
        labels
      });
      console.log(`[issues] created #${issue.number}: ${item.title}`);
    } else {
      console.log(`[issues] found #${issue.number}: ${item.title}`);
    }

    if (item.action === 'close') {
      const closeBody = item.closeBody
        ? item.closeBody.replace('{{COMMIT}}', item.commit || 'main')
        : `Fixed in ${item.commit || 'latest commit'}.`;
      await ghRequest(token, repo, 'POST', `issues/${issue.number}/comments`, { body: closeBody });
      await ghRequest(token, repo, 'PATCH', `issues/${issue.number}`, { state: 'closed', state_reason: 'completed' });
      console.log(`[issues] closed #${issue.number}`);
    }
  }
}

main().catch((err) => {
  console.error('[issues] failed:', err.message);
  process.exit(1);
});
