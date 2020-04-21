import { getInput, setFailed, info } from '@actions/core';
import { execSync } from 'child_process';
import axios from 'axios';

const main = async () => {
  try {
    const transitionName: string = getInput('transition_name', { required: true });
    const serviceBaseUrl: string = getInput('service_base_url', { required: true });
    const searchPattern: string = getInput('search_pattern', { required: false }) || 'KNUTH-[0-9]+';
    const commitDepth: number = parseInt(getInput('commit_depth', { required: false }) || '10');
    const additionalJql: string = getInput('additional_jql', { required: false }) || "AND status NOT IN ('Ready for Test', 'Ready for Release', 'Closed')";

    const issues = findIssues(searchPattern, commitDepth);

    if (issues.length === 0) {
      info(`Didn't find any issues in git log matching ${searchPattern}.`);
    } else {
      // we will use a lowercase variant of the issue, this fixes exceptions when an issue is not existing
      // https://community.atlassian.com/t5/Jira-questions/JQL-search-by-issueId-fails-if-issue-key-LIST-has-a-deleted/qaq-p/99570#M242348
      const issueList = issues.map((i) => i.toLowerCase()).join(', ');
      const jql = `key IN (${issueList}) ${additionalJql}`;
      const url = `${serviceBaseUrl}/transition?selectorJql=${encodeURIComponent(jql)}&transitionName=${encodeURIComponent(transitionName)}`;

      info(`${issues.length} issues are matching '${searchPattern}': ${issues.join(', ')}`);
      info(`Built jql search pattern: ${jql}`);
      info(`Transitioning them to '${transitionName}'...`);
      await axios.get(url).catch((e) => setFailed(`Failed to execute transitions:\n${e.response.data}`));
    }
  } catch (err) {
    setFailed(`Failed to transition Jira issues: ${err.message}`);
  }
};

const findIssues = (searchPattern: string, commitDepth: number): string[] => {
  const commitMessages = execSync(`git log -n ${commitDepth} --no-merges --format=%B`).toString();
  const issues: string[] = commitMessages.match(new RegExp(`${searchPattern}`, 'g')) || [];
  return issues;
};

main();