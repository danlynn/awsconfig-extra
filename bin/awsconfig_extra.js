'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = awsConfig;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get aws config attributes for accessKeyId, secretAccessKey, region by
 * looking in the following places starting at the top then falling back
 * the following locations until found:
 *
 *   1. command line options: --accessKeyId, --secretAccessKey, --region
 *   2. ENV vars: ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION
 *   3. standard files in workdir: .aws/credentials, .aws/config
 *   4. standard files in home: ~/.aws/credentials, ~/.aws/config
 *
 * @param options {{accessKeyId: string, secretAccessKey: string, region: string}} command line options object
 * @returns {{accessKeyId: string, secretAccessKey: string, region: string}} object with aws config attributes
 */
function awsConfig(options) {
  var credentialsFile = void 0;
  try {
    credentialsFile = _fs2.default.readFileSync('.aws/credentials', "utf8");
  } catch (error) {
    try {
      credentialsFile = _fs2.default.readFileSync(process.env['HOME'] + '/.aws/credentials', "utf8");
    } catch (error) {}
  }
  var accessKeyIdMatch = credentialsFile && credentialsFile.match(/aws_access_key_id\s*=\s*(.*)/);
  var secretAccessKeyMatch = credentialsFile && credentialsFile.match(/aws_secret_access_key\s*=\s*(.*)/);

  var configFile = void 0;
  try {
    configFile = _fs2.default.readFileSync('.aws/config', "utf8");
  } catch (error) {
    try {
      configFile = _fs2.default.readFileSync(process.env['HOME'] + '/.aws/config', "utf8");
    } catch (error) {}
  }
  var regionMatch = configFile && configFile.match(/region\s*=\s*(.*)/);

  var accessKeyId = options.accessKeyId || process.env.ACCESS_KEY_ID || accessKeyIdMatch && accessKeyIdMatch[1];
  var secretAccessKey = options.secretAccessKey || process.env.SECRET_ACCESS_KEY || secretAccessKeyMatch && secretAccessKeyMatch[1];
  var region = options.region || process.env.REGION || regionMatch && regionMatch[1];
  var awsAuth = {}; // not needed if running within aws environment already
  if (accessKeyId && secretAccessKey) {
    awsAuth = {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey
    };
  }
  if (region) Object.assign(awsAuth, { region: region });
  return awsAuth;
}