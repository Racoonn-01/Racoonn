import { Client, Databases, Users } from "node-appwrite";

const createAdminClient = () => {
  const endpoint =
    process.env.APPWRITE_ENDPOINT ||
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
    "https://cloud.appwrite.io/v1";
  const projectId =
    process.env.APPWRITE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
    "6a3bce6900381359c3ce";
  const apiKey = process.env.APPWRITE_API_KEY || "";

  const client = new Client();
  if (endpoint) client.setEndpoint(endpoint);
  if (projectId) client.setProject(projectId);
  if (apiKey) client.setKey(apiKey);

  return {
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
};

export const appwriteServer = createAdminClient();

