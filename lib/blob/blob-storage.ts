import { del } from "@vercel/blob";

export async function deleteBlob(pathname: string) {
  await del(pathname);
}