// basic auth
const gh = new GitHub({
  username: '___USERNAME___',
  token: '___TOKEN___',
});
const search = gh.search();

const interactionCache = new Map();
async function getUserInteractions(username) {
  if (interactionCache.has(username)) return interactionCache.get(username);

  const user = gh.getUser(username);
  const starred = (await user.listStarredRepos()).data.map(repo => {
    return {
      id: repo.id,
      full_name: repo.full_name,
    }
  });
  const createdIssues = (await search.forIssues({q: `author:${username}`})).data.map(issue => {
    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      association: ['created', 'commented'],
    };
  });
  const commentedIssues = (await search.forIssues({q: `-author:${username} commenter:${username}`})).data.map(issue => {
    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      association: ['commented'],
    };
  });
  const interactions = {
    starred,
    issues: [...createdIssues, ...commentedIssues],
  };

  interactionCache.set(username, interactions);
  return interactions;
}

async function findCommonInteractions(otherUsername) {
  const selfInteractions = await getUserInteractions(gh.__auth.username);
  const otherInteractions = await getUserInteractions(otherUsername);
  console.log(selfInteractions, otherInteractions);

  const starredSet = new Set(selfInteractions.starred.map(repo => repo.id));
  const starred = otherInteractions.starred.filter(repo => starredSet.has(repo.id));

  const issueSet = new Set(selfInteractions.issues.map(issue => issue.id));
  const commonIssues = otherInteractions.issues.filter(issue => issueSet.has(issue.id));
  console.log(issueSet, commonIssues);
  const issues = commonIssues.map(issue => {
    const selfIssue = selfInteractions.issues.find(i => i.id === issue.id);
    const otherIssue = otherInteractions.issues.find(i => i.id === issue.id);
    let association = 'both-commented';
    if (selfIssue.association.includes('created')) association = 'self-created';
    if (otherIssue.association.includes('created')) association = 'other-created';

    return {
      ...issue,
      association,
    }
  });

  return {
    starred,
    issues,
  };
}

(async function() {
  console.log('common', await findCommonInteractions('paulirish'));
})();
