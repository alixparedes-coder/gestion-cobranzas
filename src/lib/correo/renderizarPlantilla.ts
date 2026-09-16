import type { PlantillaCorreo, VariablesCorreo } from "@/types/cobranza";

function interpolar(texto: string, variables: VariablesCorreo): string {
  return texto.replace(/{{\s*(\w+)\s*}}/g, (coincidencia, clave: string) => {
    const valor = variables[clave as keyof VariablesCorreo];
    return valor === undefined ? coincidencia : String(valor);
  });
}

/** Sustituye las variables dinámicas ({{nombreCliente}}, etc.) de una plantilla de correo. */
export function renderizarPlantilla(
  plantilla: PlantillaCorreo,
  variables: VariablesCorreo
): { asunto: string; cuerpo: string } {
  return {
    asunto: interpolar(plantilla.asunto, variables),
    cuerpo: interpolar(plantilla.cuerpo, variables),
  };
}
