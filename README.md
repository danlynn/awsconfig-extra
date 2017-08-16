# awsconfig-extra

awsconfig-extra is a simple JavaScript module function that provides an easy and flexible way to obtain the aws config attributes for accessKeyId, secretAccessKey, and region for use in instantiating connections to aws services.

## Install

awsconfig-extra can be installed into your project's `package.json` via:

```bash
$ npm install 'danlynn/awsconfig-extra' --save
```

...or if you want a specific tagged version:

```bash
$ npm install 'danlynn/awsconfig-extra#1.0.0' --save
```

This will pull the code from this git repo and install it into your project's node_modules directory.  Your `package.json` file's dependencies will be updated with:

```json
"dependencies": {
  "awsconfig-extra": "danlynn/awsconfig-extra#1.0.0"
}
```

## Usage - Including in your source

If using ES6 then the awsConfig module method can be imported into your JavaScript source via:

```javascript
import awsConfig from 'awsconfig-extra'
```

If using ES5 then require it into your JavaScript source via:

```javascript
const awsConfig = require('awsconfig-extra').default
```

## Usage

Note that in the following example, we have a node script that we can call directly and pass command-line options to for the aws config (via the command-line-args module).  Then when deployed to an aws ecs docker host, since no command-line options are passed, it will simply assume the credentials of the account.

```javascript
import commandLineArgs from 'command-line-args'  // https://github.com/75lb/command-line-args
import AWS             from 'aws-sdk'            // https://github.com/aws/aws-sdk-js
import awsConfig       from 'awsconfig-extra'

// define command-line options
const optionDefinitions = [
  {name: 'region',          type: String},
  {name: 'accessKeyId',     type: String},
  {name: 'secretAccessKey', type: String}
]

const options = getOptions()

const sqs = new AWS.SQS(awsConfig(options))
const params = {
  QueueUrl: queueUrl,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 20
}
sqs.receiveMessage(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
})
```

## Usage - passing config

The aws config attributes for accessKeyId, secretAccessKey, and region can be passed in a number of ways.  The awsconfig-extra module function will look in the following places starting at the top then falling back to following locations until found.  It will perform this search for each attribute individually:

1. command line options: 

  + `--accessKeyId`
  + `--secretAccessKey`
  + `--region`

2. ENV vars: 

  + `ACCESS_KEY_ID`
  + `SECRET_ACCESS_KEY`
  + `REGION`

3. standard config files in current workdir: 

  + `.aws/credentials`
  + `.aws/config`

4. standard config files in home: 

  + `~/.aws/credentials`
  + `~/.aws/config`

For example, you may create a standard `.aws` config dir in your current project dir to be shared with your docker container when testing locally.  The `.aws` dir should contain 2 files:

+ `.aws/config:`

  ```
  [profile default]
  output = json
  region = us-east-1
  ```

+ `.aws/credentials`

  ```
  [default]
  aws_access_key_id = YOUR_ACCESS_KEY
  aws_secret_access_key = YOUR_ACCESS_SECRET
  ```

Just be sure to remember to add the `.aws` dir to your `.gitignore`.

After creating these standard aws config files, you can make them available to your code running in docker via host volumes like:

```bash
$ docker run --rm -it -v "$(pwd)/.aws:/root/.aws" -v $(pwd):/myapp -w /myapp node:6.11.2 bash
```

Note, however, that you won't want to "bake" the .aws dir into any images that you build.  So, to pass it into a built image, try something like:

```bash
$ docker run --rm -it -v "$(pwd)/.aws:/root/.aws" -w /myapp my_image:latest
```

Alternatively, you could pass the attributes in via ENV vars:

```bash
$ docker run --rm -it -e ACCESS_KEY_ID=abcdefg -e SECRET_ACCESS_KEY=0123456789 -e REGION=us-east-1 -w /myapp my_image:latest
```

And if you code supports command-line arguments, then they can be passed to your docker container like:

```bash
$ docker run --rm -it -w /myapp my_image:latest --accessKeyId=abcdefg --secretAccessKey=0123456789 --region=us-east-1
```

## Development on this project

If you want to contribute changes or just tweak the code a bit then you can easily work with the source by launching a bash shell as follows:

```bash
$ docker run --rm -it -v $(pwd):/myapp -w /myapp node:6.11.2 bash
```

This will open a new bash shell in a docker container with all the node tools available - no need to install anything on your local machine (except Docker).

```bash
root@eddd90d66ba5:/myapp# npm install
...
root@eddd90d66ba5:/myapp# npm run transpile
...
root@eddd90d66ba5:/myapp# export REGION='us-west-1'
root@eddd90d66ba5:/myapp# node
> const awsConfig = require('./bin/awsconfig_extra.js').default
> awsConfig({accessKeyId: 'abcdefghijklmnop'})
{ accessKeyId: 'abcdefghijklmnop', region: 'us-west-1' }
```
