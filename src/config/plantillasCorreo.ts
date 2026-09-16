import type { PlantillaCorreo } from "@/types/cobranza";

/**
 * Redacciones por defecto de correos de cobranza, una por escenario (RF-07).
 * El tono escala con la antigüedad de la deuda: recordatorio amable (1-15 días)
 * hasta negociación prioritaria (>90 días), según la tabla de la sección 8 del PRD.
 * Estos textos son el punto de partida propuesto para revisión del negocio antes
 * de activarse (ver PRD sección 12, riesgo de correos percibidos como agresivos);
 * no están hardcodeados en el motor de envío para poder editarse sin tocar código.
 *
 * Variables disponibles para interpolar: {{nombreCliente}}, {{montoAdeudado}},
 * {{diasAtraso}}, {{fechaVencimiento}}, {{numeroFactura}}, {{condicionesPlanPago}},
 * {{nombreAgente}} (ver `VariablesCorreo` en src/types/cobranza.ts).
 */
export const plantillasCorreo: PlantillaCorreo[] = [
  {
    id: "recordatorio_preventivo",
    nivelRiesgo: "bajo",
    nombre: "Recordatorio preventivo (1-15 días de atraso)",
    descripcion:
      "Aviso cordial asumiendo que el atraso puede ser un olvido administrativo.",
    asunto: "Recordatorio: factura {{numeroFactura}} pendiente de pago",
    cuerpo: `Estimado(a) {{nombreCliente}},

Le escribimos para recordarle que la factura {{numeroFactura}}, con vencimiento el {{fechaVencimiento}}, presenta un saldo pendiente de {{montoAdeudado}}.

Es posible que este pago haya pasado por alto dentro de sus procesos administrativos habituales, por lo que agradecemos verificarlo a la brevedad.

Si el pago ya fue realizado, por favor descarte este mensaje o compártanos el comprobante para actualizar nuestros registros.

Quedamos atentos ante cualquier consulta.

Saludos cordiales,
{{nombreAgente}}`,
  },
  {
    id: "recordatorio_plan_pago",
    nivelRiesgo: "medio",
    nombre: "Recordatorio con oferta de plan de pago (16-45 días de atraso)",
    descripcion:
      "Recordatorio más directo que ofrece plan de pago o descuento por pronto pago.",
    asunto: "Su factura {{numeroFactura}} está vencida hace {{diasAtraso}} días",
    cuerpo: `Estimado(a) {{nombreCliente}},

Le informamos que la factura {{numeroFactura}} se encuentra vencida desde el {{fechaVencimiento}}, con un saldo pendiente de {{montoAdeudado}} ({{diasAtraso}} días de atraso).

Para facilitar la regularización de su cuenta, contamos con las siguientes opciones:

- Pago del saldo total con un descuento por pronto pago.
- Un plan de pago en cuotas ajustado a su flujo de caja: {{condicionesPlanPago}}.

Le pedimos indicarnos cuál alternativa prefiere o comunicarse con nosotros para definir los detalles antes de que la cuenta avance a un estado de mayor atraso.

Saludos cordiales,
{{nombreAgente}}`,
  },
  {
    id: "negociacion_fraccionamiento",
    nivelRiesgo: "alto",
    nombre: "Negociación de plan de pago (46-90 días de atraso)",
    descripcion:
      "Propuesta formal de fraccionamiento de la deuda para atraso significativo.",
    asunto: "Propuesta de plan de pago para su saldo pendiente",
    cuerpo: `Estimado(a) {{nombreCliente}},

Su cuenta presenta un saldo de {{montoAdeudado}} con {{diasAtraso}} días de atraso, correspondiente a la factura {{numeroFactura}} vencida el {{fechaVencimiento}}.

Dada la antigüedad de esta deuda, le proponemos formalizar un plan de pago fraccionado en los siguientes términos: {{condicionesPlanPago}}.

Nuestro objetivo es encontrar una solución viable para ambas partes y evitar que la situación escale. Le solicitamos confirmar su disposición a este plan o proponer una contrapropuesta dentro de los próximos días hábiles.

Quedamos a su disposición para coordinar una llamada si lo prefiere.

Saludos cordiales,
{{nombreAgente}}`,
  },
  {
    id: "negociacion_prioritaria",
    nivelRiesgo: "critico",
    nombre: "Negociación prioritaria (más de 90 días de atraso)",
    descripcion:
      "Tono firme pero profesional para atraso crítico; el caso queda marcado para atención manual del agente (sin escalamiento automático a legal/supervisor en v1).",
    asunto: "Atención requerida: saldo pendiente con {{diasAtraso}} días de atraso",
    cuerpo: `Estimado(a) {{nombreCliente}},

Su cuenta mantiene un saldo pendiente de {{montoAdeudado}}, correspondiente a la factura {{numeroFactura}}, con {{diasAtraso}} días de atraso desde su vencimiento el {{fechaVencimiento}}.

Esta situación requiere resolverse de manera prioritaria. Le solicitamos comunicarse con nosotros a la brevedad para definir un plan de pago que evite consecuencias mayores para su cuenta y la continuidad del servicio.

Un(a) representante de nuestro equipo se pondrá en contacto con usted en los próximos días para revisar personalmente su caso.

Saludos cordiales,
{{nombreAgente}}`,
  },
  {
    id: "negociacion_alto_valor",
    nivelRiesgo: "bajo",
    nombre: "Negociación personalizada para cliente de alto valor",
    descripcion:
      "Usar en lugar de la plantilla estándar del nivel de riesgo cuando el cliente es de alto valor (antigüedad/volumen de negocio), priorizando la relación comercial sobre el tono del segmento.",
    asunto: "Conversemos sobre el estado de su cuenta",
    cuerpo: `Estimado(a) {{nombreCliente}},

Como uno de nuestros clientes de mayor trayectoria, queremos abordar de forma personal el saldo pendiente de {{montoAdeudado}} en su cuenta ({{diasAtraso}} días de atraso, factura {{numeroFactura}}).

Valoramos la relación comercial que hemos construido y por eso preferimos conversar directamente antes de aplicar un proceso estándar. Estamos en disposición de evaluar condiciones especiales de pago que se ajusten a su situación: {{condicionesPlanPago}}.

Quedo atento(a) para coordinar una llamada o reunión en los próximos días.

Saludos cordiales,
{{nombreAgente}}`,
  },
];
