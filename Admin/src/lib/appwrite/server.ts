import { Client, Databases, Users } from "node-appwrite";

const createAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

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
