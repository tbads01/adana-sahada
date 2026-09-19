import path from "node:path";

export function persistFile(name: string) {
  if (process.env.PUSH_STORE_PATH) {
    return path.join(path.dirname(process.env.PUSH_STORE_PATH), name);
  }
  if (process.cwd().includes(`${path.sep}hbuilds${path.sep}`)) {
    return path.resolve(process.cwd(), "../../../persist", name);
  }
  return path.join(process.cwd(), "data", name);
}
