import { getCMSPackages } from './lib/appwrite/api';
import client from './lib/appwrite/config';

async function test() {
  const pkgs = await getCMSPackages();
  console.log("Packages:", pkgs?.length);
  if (pkgs && pkgs.length > 0) {
    console.log("Status of first:", pkgs[0].status);
  }
}

test().catch(console.error);
