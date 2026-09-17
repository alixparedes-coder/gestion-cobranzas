// Resuelve el alias "@/" (definido en tsconfig.json para Next.js) al correr
// los tests con el test runner nativo de Node (sin dependencias externas).
// Node no auto-resuelve extensiones para imports absolutos, así que probamos
// .ts/.tsx cuando el specifier no trae extensión explícita.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC_URL = new URL("../src/", import.meta.url);
const TIENE_EXTENSION = /\.[a-zA-Z0-9]+$/;

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) {
    return nextResolve(specifier, context);
  }

  const rutaRelativa = specifier.slice(2);
  let target = new URL(rutaRelativa, SRC_URL);

  if (!TIENE_EXTENSION.test(rutaRelativa)) {
    for (const ext of [".ts", ".tsx"]) {
      const candidata = new URL(rutaRelativa + ext, SRC_URL);
      if (existsSync(fileURLToPath(candidata))) {
        target = candidata;
        break;
      }
    }
  }

  return nextResolve(target.href, context);
}
