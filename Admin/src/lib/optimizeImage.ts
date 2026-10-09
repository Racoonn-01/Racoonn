// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function optimizeAppwriteImage(url: any): any {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('appwrite.io') && url.includes('/view')) {
      let newUrl = url.replace('/view', '/preview');
      if (newUrl.includes('?')) {
        return newUrl + '&output=webp';
      } else {
        return newUrl + '?output=webp';
      }
    }
    return url;
  }
