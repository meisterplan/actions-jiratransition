import { getInput, setFailed, info } from '@actions/core';
import { execSync } from 'child_process';
import axios from 'axios';

const main = async () => {
  try {
    const transitionName: string = getInput('transition_name', { required: true });
    const serviceBaseUrl: string = getInput('service_base_url', { required: true });
    const searchPattern: string = getInput('search_pattern', { required: false }) || 'KNUTH-[0-9]+';
    const ignorePattern: string = getInput('ignore_pattern', { required: false }) || 'refs?';
    const commitDepth: number = parseInt(getInput('commit_depth', { required: false }) || '10');
    const additionalJql: string = getInput('additional_jql', { required: false }) || "AND status NOT IN ('Ready for Test', 'Ready for Release', 'Closed')";

    const issues = findIssues(searchPattern, ignorePattern, commitDepth);

    if (issues.length === 0) {
      info(`Didn't find any issues in git log matching ${searchPattern}.`);
    } else {
      // we will use a lowercase variant of the issue, this fixes exceptions when an issue is not existing
      // https://community.atlassian.com/t5/Jira-questions/JQL-search-by-issueId-fails-if-issue-key-LIST-has-a-deleted/qaq-p/99570#M242348
      const issueList = issues.map((i) => i.toLowerCase()).join(', ');
      const jql = `key IN (${issueList}) ${additionalJql}`;
      const encodedJql = Buffer.from(jql).toString('base64');
      const url = `${serviceBaseUrl}/transition?selectorJql=${encodedJql}&transitionName=${encodeURIComponent(transitionName)}`;

      info(`${issues.length} issues are matching '${searchPattern}': ${issues.join(', ')}`);
      info(`Built jql search pattern: ${jql}`);
      info(`Transitioning them to '${transitionName}'...`);
      await axios.get(url).catch((e) => setFailed(`Failed to execute transitions:\n${e.response.data}`));
    }
  } catch (err) {
    setFailed(`Failed to transition Jira issues: ${JSON.stringify(err)}`);
  }
};

const findIssues = (searchPattern: string, ignorePattern: string, commitDepth: number): string[] => {
  const commitMessageLines = execSync(`git log -n ${commitDepth} --no-merges --format=%B`).toString().split('\n');
  const issues: string[] = commitMessageLines
    .filter((line) => !line.match(new RegExp(ignorePattern)))
    .flatMap((line) => line.match(new RegExp(`${searchPattern}`, 'g')) || []);
  return issues;
};

main();
