const util = require('util');
const debug = require('debug')('aws:s3');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const createBucket = util.promisify(s3.createBucket.bind(s3));
const listObjects = util.promisify(s3.listObjectsV2.bind(s3));

/**
 * @param {*} name
 */
async function createServerBucket(name) {
  const params = {
    Bucket: name,
  };

  try {
    const response = await createBucket(params);

    return response;
  } catch (e) {
    debug(e);
  }
}

/**
 * @param {*} name
 */
async function listBackups(name) {
  const files = [];
  const params = {
    Bucket: name,
  };

  try {
    const response = await listObjects(params);
    debug(response);

    const contents = response.Contents;
    contents.forEach((f) => {
      files.push({ filename: f.Key, size: f.Size });
    });

    return files;
  } catch (e) {
    debug(e);
  }
}

module.exports = {
  createServerBucket,
  listBackups,
};
