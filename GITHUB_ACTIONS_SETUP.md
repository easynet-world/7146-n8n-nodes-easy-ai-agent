# GitHub Actions Setup for NPM Publishing

This project is configured with GitHub Actions for automated npm package publishing using semantic-release.

## Required GitHub Secrets

To enable automated publishing, you need to configure the following secrets in your GitHub repository:

### 1. NPM_TOKEN
- **Purpose**: Authenticates with npm registry for publishing
- **How to get**: 
  1. Go to [npmjs.com](https://www.npmjs.com) and log in
  2. Go to Access Tokens: https://www.npmjs.com/settings/tokens
  3. Click "Generate New Token" → "Automation"
  4. Copy the token and add it as `NPM_TOKEN` in GitHub repository secrets

### 2. GITHUB_TOKEN
- **Purpose**: Creates GitHub releases and commits version changes
- **How to get**: 
  1. Go to [GitHub Settings](https://github.com/settings/tokens)
  2. Click "Generate new token" → "Generate new token (classic)"
  3. Select scopes: `repo`, `write:packages`, `read:org`
  4. Copy the token and add it as `GITHUB_TOKEN` in GitHub repository secrets
- **Note**: This is different from the automatically provided GITHUB_TOKEN in GitHub Actions

## How to Add Secrets

1. Go to your GitHub repository: `https://github.com/easynet-world/7146-n8n-nodes-easy-ai-agent`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the secrets as described above

## Workflow Configuration

The workflow (`.github/workflows/release.yml`) is based on the [easy-mcp-server example](https://raw.githubusercontent.com/easynet-world/7134-easy-mcp-server/refs/heads/master/.github/workflows/release.yml) and includes:

- **Trigger**: Runs on every push to `master` branch
- **Self-hosted runner**: Uses `runs-on: self-hosted`
- **Steps**:
  1. Checkout code with full history
  2. Install dependencies with `npm ci`
  3. Run tests with `npm test`
  4. Run linting with `npm run lint`
  5. Setup npm authentication
  6. Run semantic-release for automated versioning and publishing

## Semantic Release Configuration

The project uses semantic-release with the following plugins:
- `@semantic-release/commit-analyzer`: Analyzes commits to determine version bump
- `@semantic-release/release-notes-generator`: Generates release notes
- `@semantic-release/changelog`: Updates CHANGELOG.md
- `@semantic-release/npm`: Publishes to npm registry
- `@semantic-release/github`: Creates GitHub releases
- `@semantic-release/git`: Commits version changes back to repository

## Commit Convention

The workflow uses [Conventional Commits](https://conventionalcommits.org) to determine version bumps:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

## Publishing Process

1. **Push to master**: Any push to the master branch triggers the workflow
2. **Automatic analysis**: semantic-release analyzes commits since last release
3. **Version bump**: If changes are detected, version is automatically bumped
4. **Publishing**: New version is published to npm registry
5. **GitHub release**: GitHub release is created with changelog
6. **Changelog update**: CHANGELOG.md is updated and committed back

## Manual Testing

To test the workflow locally:

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Run linting
npm run lint

# Test semantic-release (dry run)
npx semantic-release --dry-run
```

## Troubleshooting

### Common Issues

1. **NPM_TOKEN not found**: Ensure the secret is properly configured in GitHub
2. **GITHUB_TOKEN not found**: Create a personal access token with repo permissions
3. **Permission denied**: Check that the npm token has publish permissions
4. **Version already exists**: The workflow will skip publishing if version already exists
5. **Tests failing**: Fix any failing tests before the workflow can proceed

### Error: "No GitHub token specified"

If you see this error in the GitHub Actions logs:

```
SemanticReleaseError: No GitHub token specified.
A GitHub personal token must be created and set in the GH_TOKEN or GITHUB_TOKEN environment variable
```

**Solution:**
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "n8n-nodes-easy-ai-agent-release"
4. Select scopes: `repo`, `write:packages`, `read:org`
5. Click "Generate token"
6. Copy the token
7. Go to your repository Settings > Secrets and variables > Actions
8. Click "New repository secret"
9. Name: `GITHUB_TOKEN`
10. Value: Paste the token you copied
11. Click "Add secret"

### Workflow Status

Check the workflow status in the **Actions** tab of your GitHub repository to see:
- Workflow execution logs
- Test results
- Publishing status
- Any errors that need to be addressed
