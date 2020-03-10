/**
 * Utils for parsing and editing properties in
 * server.properties
 */
class ServerProperties {
  /**
   * Text content of server.properties file.
   * @param {*} fileContent
   */
  constructor(fileContent) {
    this.properties = {};

    fileContent.split('\n').forEach((line) => {
      if (line.startsWith('#') || line === '') {
        return;
      }

      const kvPair = line.split('=');
      this.properties[kvPair[0]] = kvPair[1];
    });
  }

  /**
   * Get value for key.
   * @param {*} key
   * @return {*} value from server.properties
   */
  get(key) {
    if (this.properties.hasOwnProperty(key)) {
      return this.properties[key];
    }
  }

  /**
   * Dump the current instance to a text representation.
   * @return {*} text representation for server.properties
   */
  dump() {
    let fileContent = '';

    for (const [key, value] of Object.entries(this.properties)) {
      fileContent += `${key}=${value}\n`;
    }

    fileContent += '\n';

    return fileContent;
  }
}

module.exports = ServerProperties;
