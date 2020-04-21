import process from 'process';
import cp from 'child_process';
import path from 'path';
import fs from 'fs';

test('test runs', () => {
  const gitRepoDir = path.join(__dirname, '..', 'test-git-repo');

  if (!process.env.JIRAJELLYFISH_BASE_URL) {
    fail('You need to configure the environment variable JIRAJELLYFISH_BASE_URL before you run the test.');
    return;
  }

  if (!fs.existsSync(gitRepoDir)) {
    fail('You need to create a git repository under ./test-git-repo to run this test, you may use "init-test-git-repo.sh" to create a repository.');
    return;
  }

  const ip = path.join(__dirname, '..', 'lib', 'main.js');
  const options: cp.ExecSyncOptions = {
    env: {
      INPUT_TRANSITION_NAME: 'In Build',
      INPUT_JIRAJELLYFISH_BASE_URL: process.env.JIRAJELLYFISH_BASE_URL,
    },
    cwd: gitRepoDir,
  };
  try {
    // eslint-disable-next-line no-console
    console.log(cp.execSync(`node ${ip}`, options).toString());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error.stdout.toString());
    fail(`execSync threw an error: ${error.stdout.toString()}`);
  }
});
