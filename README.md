# S3 Upload

Upload files to S3 bucket.

## Inputs

### `source`

Source path(s). Default `"."`.

### `recursive`

Copy directories recursively. Default `"true"`.

### `cleanup`

Remove all files on the destination prefix before uploading. Default `"false"`.

### `s3-acl`

S3 objects ACL. Default `"private"`.

### `s3-bucket`

Destination S3 bucket.

### `s3-prefix`

Destination bucket key prefix.

## Example usage

```yaml
uses: drugscom/s3-upload-action@v1
env:
  AWS_REGION: us-east-1
  AWS_ACCESS_KEY_ID: AAAAAAAAAAAAAAA
  AWS_SECRET_ACCESS_KEY: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
with:
  s3-bucket: mys3bucket
```