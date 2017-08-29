'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = awsConfig;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get aws config attributes for accessKeyId, secretAccessKey, and region
 * by looking in the following places starting at the top then falling
 * back to the following locations until found.  It will perform this
 * search for each attribute individually:
 *
 *   1. command line options: --accessKeyId, --secretAccessKey, --region
 *   2. ENV vars: ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION
 *   3. standard files in workdir: .aws/credentials, .aws/config
 *   4. standard files in home: ~/.aws/credentials, ~/.aws/config
 *
 * Note that "command-line-args" node module works well for generating
 * the command-line 'options' arg.  The 'options' arg is optional as are
 * the attributes found within it.
 *
 * If no values can be determined for any of the three attributes then
 * null will be returned.  This is convenient for use with the aws sdk
 * since most aws service client instances accept null when the code is
 * running within aws.  Thus, the following code will work fine in both
 * local development and in the aws cloud:
 *
 *   const sqs = new AWS.SQS(awsConfig(options))
 *
 * ...in local dev, you could have ENV vars set - then in aws cloud prod,
 * you simply don't set any ENV vars and the AWS.SQS will derive your
 * credentials from the account that it is running within.
 *
 * @param [options] {{[accessKeyId]: string, [secretAccessKey]: string, [region]: string}} command line options object
 * @param [verbose] {boolean} true to output all the config it found and where
 * @returns {{accessKeyId: string, secretAccessKey: string, region: string}} object with aws config attributes
 */
function awsConfig() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var verbose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var credentialsFile = void 0;
  try {
    credentialsFile = _fs2.default.readFileSync('.aws/credentials', "utf8");
    if (verbose) console.log('=== read .aws/credentials: success:\n' + credentialsFile);
  } catch (error) {
    try {
      credentialsFile = _fs2.default.readFileSync(process.env['HOME'] + '/.aws/credentials', "utf8");
      if (verbose) console.log('=== read ' + process.env['HOME'] + '/.aws/credentials: success:\n' + credentialsFile);
    } catch (error) {}
  }
  var accessKeyIdMatch = credentialsFile && credentialsFile.match(/aws_access_key_id\s*=\s*(.*)/);
  var secretAccessKeyMatch = credentialsFile && credentialsFile.match(/aws_secret_access_key\s*=\s*(.*)/);

  var configFile = void 0;
  try {
    configFile = _fs2.default.readFileSync('.aws/config', "utf8");
    if (verbose) console.log('=== read .aws/config: success:\n' + configFile);
  } catch (error) {
    try {
      configFile = _fs2.default.readFileSync(process.env['HOME'] + '/.aws/config', "utf8");
      if (verbose) console.log('=== read ' + process.env['HOME'] + '/.aws/config: success:\n' + configFile);
    } catch (error) {}
  }
  var regionMatch = configFile && configFile.match(/region\s*=\s*(.*)/);

  var accessKeyId = options && options.accessKeyId || process.env.ACCESS_KEY_ID || accessKeyIdMatch && accessKeyIdMatch[1];
  var secretAccessKey = options && options.secretAccessKey || process.env.SECRET_ACCESS_KEY || secretAccessKeyMatch && secretAccessKeyMatch[1];
  var region = options && options.region || process.env.REGION || regionMatch && regionMatch[1];

  if (verbose) {
    console.log('=== accessKeyId:\n      cli:  ' + (options && options.accessKeyId) + '\n      env:  ' + process.env.ACCESS_KEY_ID + '\n      file: ' + (accessKeyIdMatch && accessKeyIdMatch[1]) + '\n      pick: ' + accessKeyId);
    console.log('=== secretAccessKey:\n      cli:  ' + (options && options.secretAccessKey) + '\n      env:  ' + process.env.SECRET_ACCESS_KEY + '\n      file: ' + (secretAccessKeyMatch && secretAccessKeyMatch[1]) + '\n      pick: ' + secretAccessKey);
    console.log('=== region:\n      cli:  ' + (options && options.region) + '\n      env:  ' + process.env.REGION + '\n      file: ' + (regionMatch && regionMatch[1]) + '\n      pick: ' + region);
  }

  var awsAuth = {};
  if (accessKeyId) Object.assign(awsAuth, { accessKeyId: accessKeyId });
  if (secretAccessKey) Object.assign(awsAuth, { secretAccessKey: secretAccessKey });
  if (region) Object.assign(awsAuth, { region: region });
  if (Object.keys(awsAuth).length === 0) awsAuth = null; // not needed if running within aws environment already
  if (verbose) console.log('=== returning:\n' + JSON.stringify(awsAuth, null, 2));
  return awsAuth;
}