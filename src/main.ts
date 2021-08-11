import * as core from '@actions/core'
import * as fs from 'fs'
import * as glob from '@actions/glob'
import * as path from 'path'
import * as s3 from '@aws-sdk/client-s3'
import * as utils from '@actions/utils'

async function run(): Promise<void> {
  try {
    const source = utils.getInputAsArray('source')
    const recursive = core.getBooleanInput('recursive')
    const cleanup = core.getBooleanInput('cleanup')
    const s3ACL = core.getInput('s3-acl')
    const s3Bucket = core.getInput('s3-bucket')
    const s3Prefix = core.getInput('s3-prefix')

    const s3Client = new s3.S3Client({})

    if (cleanup) {
      core.debug(`Clean-up requested, will remove objects from "s3://${path.join(s3Bucket, s3Prefix)}"`)
      const objects: s3.ObjectIdentifier[] = []

      for await (const page of s3.paginateListObjectsV2({client: s3Client}, {
        Bucket: s3Bucket,
        Prefix: s3Prefix,
      })) {
        for (const object of page.Contents ?? []) {
          if (object.Key) {
            core.info(`Removing object "s3://${path.join(s3Bucket, object.Key)}"`)
            objects.push({Key: object.Key})
          }
        }
      }

      if (objects.length > 0) {
        await s3Client.send(new s3.DeleteObjectsCommand({
          Bucket: s3Bucket,
          Delete: {Objects: objects},
        }))
      }
    }

    const globber = await glob.create(source.join('\n'), {matchDirectories: false, implicitDescendants: recursive})
    for await (const file of globber.globGenerator()) {
      const s3Key = path.join(s3Prefix, path.basename(file))
      core.info(`Copying "${file}" to "s3://${path.join(s3Bucket, s3Key)}"`)
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
