import fs from 'fs'


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
export default function awsConfig(options) {
  let credentialsFile
  try {
    credentialsFile = fs.readFileSync('.aws/credentials', "utf8")
  }
  catch (error) {
    try {
      credentialsFile = fs.readFileSync(`${process.env['HOME']}/.aws/credentials`, "utf8")
    }
    catch (error) {}
  }
  const accessKeyIdMatch = credentialsFile && credentialsFile.match(/aws_access_key_id\s*=\s*(.*)/)
  const secretAccessKeyMatch = credentialsFile && credentialsFile.match(/aws_secret_access_key\s*=\s*(.*)/)

  let configFile
  try {
    configFile = fs.readFileSync('.aws/config', "utf8")
  }
  catch (error) {
    try {
      configFile = fs.readFileSync(`${process.env['HOME']}/.aws/config`, "utf8")
    }
    catch (error) {}
  }
  const regionMatch = configFile && configFile.match(/region\s*=\s*(.*)/)

  const accessKeyId = options.accessKeyId || process.env.ACCESS_KEY_ID || (accessKeyIdMatch && accessKeyIdMatch[1])
  const secretAccessKey = options.secretAccessKey || process.env.SECRET_ACCESS_KEY || (secretAccessKeyMatch && secretAccessKeyMatch[1])
  const region = options.region || process.env.REGION || (regionMatch && regionMatch[1])
  let awsAuth = {} // not needed if running within aws environment already
  if (accessKeyId && secretAccessKey) {
    awsAuth = {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey
    }
  }
  if (region)
    Object.assign(awsAuth, {region: region})
  return awsAuth
}
