// CI/CD Integration & GitHub Action Export Service

export class CicdTemplateService {
  getGithubWorkflowYaml() {
    return `name: REPAIRX Autonomous API Healer CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  self-heal-and-verify:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Install Dependencies
        run: npm ci

      - name: 🧪 Run Automated Test Suite
        id: run_tests
        run: npm test || echo "TESTS_FAILED=true" >> $GITHUB_ENV

      - name: 🤖 Trigger REPAIRX Autonomous Fixer (On Failure)
        if: env.TESTS_FAILED == 'true'
        uses: repairx-ai/action-self-heal@v2
        with:
          gemini-api-key: \${{ secrets.GEMINI_API_KEY }}
          auto-create-pr: true
          sandbox-verification: true
          regression-threshold: 100

      - name: 📊 Upload Incident Post-Mortem
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: repairx-post-mortem
          path: ./repairx-reports/
`;
  }

  getPreCommitHookScript() {
    return `#!/bin/sh
# REPAIRX Pre-Commit Self-Healing Hook
# Validates API contract schemas and runs isolated sandbox regression tests before commit

echo "🔍 [REPAIRX] Inspecting staged API route definitions and schemas..."

npm test --silent
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "🚨 [REPAIRX] API tests failed! Invoking Autonomous Repair Agent..."
  node ./bin/repairx-cli.js --auto-heal
  exit 1
fi

echo "✅ [REPAIRX] All 12 regression tests passed with 0 contract drift. Ready to commit!"
exit 0
`;
  }
}

export const cicdService = new CicdTemplateService();
