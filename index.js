const core = require("@actions/core");
const github = require("@actions/github");

const githubToken = core.getInput("github-token");
const octokit = github.getOctokit(githubToken);

function issueHasLabel(labelName, payload) {
  return payload.issue.labels.some((label) => label.name === labelName);
}

async function process(dataMap, payload) {
  for (let item in dataMap) {
    if (issueHasLabel(dataMap[item].label, payload)) {
      const projectList = await getAllProjects(dataMap, item);
      const projectId = getProjectIdByName(dataMap[item].project, projectList);
      if (!projectId) {
        throw new Error(`Unable to retrieve project ID.`);
      }
      const columnList = await getAllColumns(projectId);
      const columnId = getColumnIdByName(dataMap[item].column, columnList);
      if (!columnId) {
        throw new Error(`Unable to retrieve column ID.`);
      }
      const createIssue = await octokit.rest.projects.createCard({
        column_id: columnId,
        content_type: "Issue",
        content_id: payload.issue.id,
      });
      if (!createIssue) {
        console.error(
          "Something went wrong when attempting to create the card."
        );
      }
    }
  }
}

async function getAllProjects(dataMap, index) {
  if (dataMap[index].project_type == "repo") {
    console.log(`Getting all projects for repo: ${dataMap[index].repo}`);
    return await octokit.rest.projects.listForRepo({
      owner: github.context.payload.repository.owner.login,
      repo: dataMap[index].repo,
    });
  } else if (dataMap[index].project_type == "org") {
    console.log(`Getting all projects for organization: ${dataMap[index].org}`);
    return await octokit.rest.projects.listForOrg({
      org: dataMap[index].org,
    });
  } else {
    console.error("You provided an invalid `project_type`.");
  }
}

function getProjectIdByName(name, projectList) {
  console.log(`Searching for project with name: ${name}.`);
  for (let project in projectList.data) {
    if (projectList[project].name == name) {
      return projectList[project].id;
    }
  }
  return false;
}

async function getAllColumns(project_id) {
  console.log(`Getting all columns for Project #${project_id}.`);
  return await octokit.rest.projects.listColumns({
    project_id: project_id,
  });
}

function getProjectIdByName(name, projectList) {
  for (let project in projectList.data) {
    project = projectList.data[project];
    if (project.name == name) {
      return project.id;
    }
  }
  return false;
}

function getColumnIdByName(name, columnList) {
  for (let column in columnList.data) {
    column = columnList.data[column];
    if (column.name == name) {
      return column.id;
    }
  }
  return false;
}

try {
  (async () => {
    const data = JSON.parse(core.getInput("actions")).data;
    await process(data, github.context.payload);
  })();
} catch (error) {
  core.setFailed(error.message);
}
