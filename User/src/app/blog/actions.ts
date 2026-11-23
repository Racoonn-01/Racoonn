"use server";

export async function incrementBlogView(documentId: string, currentViews: number) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
  const collectionId = "blogs";

  if (!projectId || !apiKey) {
    console.warn("Missing Appwrite credentials for view tracking.");
    return;
  }

  try {
    await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
      body: JSON.stringify({
        data: {
          views: currentViews + 1
        }
      })
    });
  } catch (error) {
    console.error("Failed to increment blog views", error);
  }
}
