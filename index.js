import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

(async () => {
  // Fetch and Render Latest Projects
  const projects = await fetchJSON('./lib/projects.json');
  const latestProjects = projects.slice(0, 3); // First 3 projects
  const projectsContainer = document.querySelector('.projects');
  renderProjects(latestProjects, projectsContainer, 'h2');

  // Fetch and Display GitHub Data
  const githubData = await fetchGitHubData('boruilin');
  const profileStats = document.querySelector('#profile-stats');

  if (profileStats) {
    if (document.body.classList.contains('dark-mode')) {
      profileStats.classList.add('dark-mode');
    }

    profileStats.innerHTML = `
      <h2>GitHub Profile Stats</h2>
      <dl>
        <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
        <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
        <dt>Followers:</dt><dd>${githubData.followers}</dd>
        <dt>Following:</dt><dd>${githubData.following}</dd>
      </dl>
    `;  
  }
})();

