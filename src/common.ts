export async function importModule(path) {
  return await import(path);
}
