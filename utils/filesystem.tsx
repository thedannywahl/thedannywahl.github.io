export async function fileExists(path: string): Promise<boolean> {
  const file = await Deno.stat(path);
  return new Promise((resolve, reject) => {
    (file.isFile) ? resolve(true) : reject(false);
  });
}
