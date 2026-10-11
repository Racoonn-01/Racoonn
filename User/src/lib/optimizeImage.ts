// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function optimizeAppwriteImage(url: any): any {
    if (!url || typeof url !== 'string') return url;

    // Handle raw Appwrite File IDs (not full URLs)
    if (!url.startsWith('http') && !url.startsWith('/') && url.length > 10) {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce';
      // Defaulting to the common bucket ID used for properties/rooms
      const bucketId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_IMAGES_BUCKET_ID || '6a3e398000280b2b3d20';
      
      return `${endpoint}/storage/buckets/${bucketId}/files/${url}/preview?project=${projectId}&output=webp&v=2`;
    }

    if (url.includes('appwrite.io') && url.includes('/view')) {
      let newUrl = url.replace('/view', '/preview');
      if (newUrl.includes('?')) {
        return newUrl + '&output=webp&v=2';
      } else {
        return newUrl + '?output=webp&v=2';
      }
    }
    
    return url;
  }
