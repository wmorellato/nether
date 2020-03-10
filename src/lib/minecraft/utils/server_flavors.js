/* eslint-disable max-len */
const axios = require('axios');

const PAPER_API_URL = 'https://papermc.io/api/v1/paper';

const SERVER_FLAVORS = {
  PAPER: 'paper',
};

/**
 * Returned version info must contain:
 *      - flavor: server flavor (paper, forge etc)
 *      - version: version of the jar
 *      - build: build of the version
 *      - url: url to download the jar
 */
async function getPaperVersions() {
  try {
    const response = await axios.get(PAPER_API_URL);

    return response.data;
  } catch (e) {
    console.error(e);
  }
};

/**
 * Get build versions from papermc.io
 * @param {*} version
 */
async function getPaperBuilds(version) {
  try {
    const response = await axios.get(`${PAPER_API_URL}/${version}/`);

    return response.data;
  } catch (e) {
    console.error(e);
  }
}

/**
 * Return latest Paper latest jar url.
 */
async function getPaperLatestJarUrl() {
  const versionInfo = {};
  const paperVersions = await getPaperVersions();

  try {
    const paperBuilds = await getPaperBuilds(paperVersions.versions[0]);

    versionInfo.flavor = 'paper';
    versionInfo.url = `${PAPER_API_URL}/${paperVersions.versions[0]}/${paperBuilds.builds.latest}/download`;
    versionInfo.version = paperVersions.versions[0];
    versionInfo.build = paperBuilds.builds.latest;

    return versionInfo;
  } catch (e) {
    console.error(e);
  }
}

/**
 * Get latest available version for the given flavor.
 * @param {*} flavor
 */
async function getLatestVersion(flavor) {
  switch (flavor) {
    case SERVER_FLAVORS.PAPER:
      return await getPaperLatestJarUrl();
  }
}

module.exports = {
  SERVER_FLAVORS,
  getLatestVersion,
};
