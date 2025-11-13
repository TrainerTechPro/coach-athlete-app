import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  })

  await s3Client.send(command)
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`
}

export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export async function getSignedDownloadUrl(
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export function generateVideoFileName(
  athleteId: string,
  eventType: string,
  originalName: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const extension = originalName.split('.').pop()
  return `videos/${athleteId}/${eventType}/${timestamp}.${extension}`
}

export function generateThumbnailFileName(videoFileName: string): string {
  return videoFileName.replace(/\.[^.]+$/, '-thumbnail.jpg')
}

export function generateAnnotationFileName(
  videoId: string,
  timestamp: number
): string {
  const formattedTimestamp = timestamp.toFixed(2).replace('.', '_')
  return `annotations/${videoId}/annotation-${formattedTimestamp}.png`
}