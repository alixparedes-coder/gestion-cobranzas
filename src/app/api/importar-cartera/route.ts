import { NextResponse } from "next/server";
import { importarCartera } from "@/lib/importacion/importarCartera";
import { parsearArchivoCartera } from "@/lib/importacion/parsearArchivoCartera";

/**
 * Importa cartera desde un Excel/CSV (RF-01/RF-02). Espera un
 * multipart/form-data con el archivo en el campo "archivo".
 * Todo-o-nada: si hay algún error de validación, no se importa nada y se
 * devuelven los errores para corregir el archivo.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const archivo = formData.get("archivo");

  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo en el campo "archivo".' }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const { filasValidas, errores } = await parsearArchivoCartera(buffer, archivo.name);

  if (errores.length > 0) {
    return NextResponse.json({ errores }, { status: 422 });
  }

  const resultado = await importarCartera(filasValidas);
  return NextResponse.json(resultado);
}
