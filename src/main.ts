import * as core from '@actions/core'
import * as fs from 'fs'
import * as glob from '@actions/glob'
import * as path from 'path'
import * as s3 from '@aws-sdk/client-s3'
import * as utils from '@actions/utils'

async function run(): Promise<void> {
  try {
    const source = utils.getInputAsArray('source')
    const recursive = utils.getInputAsBool('recursive')
    const s3ACL = utils.getInputAsString('s3-acl')
    const s3Bucket = utils.getInputAsString('s3-bucket')
    const s3Prefix = utils.getInputAsString('s3-prefix')

    const s3Client = new s3.S3Client({})

    const globber = await glob.create(source.join('\n'), {implicitDescendants: recursive})
    for await (const file of globber.globGenerator()) {
      if (!utils.fileExist(file)) {
        core.debug(`Ignoring "${file}": not a file`)
        continue
      }

      const s3Key = path.join(s3Prefix, path.basename(file))
      core.info(`Copying "${file}" to "s3://${s3Bucket}/${s3Key}"`)
      try {
        await s3Client.send(new s3.PutObjectCommand({
          Bucket: s3Bucket,
          Key: s3Key,
          Body: fs.createReadStream(file),
          ACL: s3ACL,
        }))
      } catch (error) {
        core.setFailed(error.message)
      }
    }

  } catch (error) {
    core.setFailed(error.message)
  }
}

void run()
