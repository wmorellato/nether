const axios = require('axios')

const PAPER_API_URL = 'https://papermc.io/api/v1/paper'

const SERVER_FLAVORS = {
    PAPER: 'paper'
}

/**
 * Returned version info must contain:
 *      - flavor: server flavor (paper, forge etc)
 *      - version: version of the jar
 *      - build: build of the version
 *      - url: url to download the jar
 */

const getPaperVersions = async () => {
    try {
        var response = await axios.get(PAPER_API_URL)

        return response.data
    } catch (e) {
        console.error(e)
    }    
}

const getPaperBuilds = async (version) => {
    try {
        var response = await axios.get(`${PAPER_API_URL}/${version}/`)

        return response.data
    } catch (e) {
        console.error(e)
    }  
}

const getPaperLatestJarUrl = async () => {
    var versionInfo = {}
    const paperVersions = await getPaperVersions()

    try {
        const paperBuilds = await getPaperBuilds(paperVersions.versions[0])

        versionInfo.flavor = 'paper'
        versionInfo.url = `${PAPER_API_URL}/${paperVersions.versions[0]}/${paperBuilds.builds.latest}/download`
        versionInfo.version = paperVersions.versions[0]
        versionInfo.build = paperBuilds.builds.latest

        return versionInfo
    } catch (e) {
        console.error(e)
    }
}

const getLatestVersion = async (flavor) => {
    switch (flavor) {
        case SERVER_FLAVORS.PAPER:
            return await getPaperLatestJarUrl()
    }
}

module.exports = {
    SERVER_FLAVORS,
    getLatestVersion
}