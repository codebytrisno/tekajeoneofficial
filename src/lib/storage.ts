const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

export function getCloudinaryUrl(publicId: string, options?: { width?: number; height?: number; quality?: number }) {
  const { width, height, quality = 80 } = options || {}
  let base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`
  const transformations: string[] = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (quality) transformations.push(`q_${quality}`)
  transformations.push("f_auto")
  const txStr = transformations.join(",")
  if (txStr) base += `/${txStr}`
  return `${base}/${publicId}`
}

export function getPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/)
  return match ? match[1] : null
}
