-- Semilla: migra a la tabla plantillas_correo el contenido que hoy vive
-- hardcodeado en src/config/plantillasCorreo.ts (las 5 redacciones por
-- defecto, una por escenario de cobranza). Idempotente por escenario.

insert into public.plantillas_correo (escenario, nombre, descripcion, asunto, cuerpo)
values
  (
    'recordatorio_preventivo',
    'Recordatorio preventivo (1-15 días de atraso)',
    'Aviso cordial asumiendo que el atraso puede ser un olvido administrativo.',
    'Recordatorio: factura {{numeroFactura}} pendiente de pago',
    $cuerpo$Estimado(a) {{nombreCliente}},

Le escribimos para recordarle que la factura {{numeroFactura}}, con vencimiento el {{fechaVencimiento}}, presenta un saldo pendiente de {{montoAdeudado}}.

Es posible que este pago haya pasado por alto dentro de sus procesos administrativos habituales, por lo que agradecemos verificarlo a la brevedad.

Si el pago ya fue realizado, por favor descarte este mensaje o compártanos el comprobante para actualizar nuestros registros.

Quedamos atentos ante cualquier consulta.

Saludos cordiales,
{{nombreAgente}}$cuerpo$
  ),
  (
    'recordatorio_plan_pago',
    'Recordatorio con oferta de plan de pago (16-45 días de atraso)',
    'Recordatorio más directo que ofrece plan de pago o descuento por pronto pago.',
    'Su factura {{numeroFactura}} está vencida hace {{diasAtraso}} días',
    $cuerpo$Estimado(a) {{nombreCliente}},

Le informamos que la factura {{numeroFactura}} se encuentra vencida desde el {{fechaVencimiento}}, con un saldo pendiente de {{montoAdeudado}} ({{diasAtraso}} días de atraso).

Para facilitar la regularización de su cuenta, contamos con las siguientes opciones:

- Pago del saldo total con un descuento por pronto pago.
- Un plan de pago en cuotas ajustado a su flujo de caja: {{condicionesPlanPago}}.

Le pedimos indicarnos cuál alternativa prefiere o comunicarse con nosotros para definir los detalles antes de que la cuenta avance a un estado de mayor atraso.

Saludos cordiales,
{{nombreAgente}}$cuerpo$
  ),
  (
    'negociacion_fraccionamiento',
    'Negociación de plan de pago (46-90 días de atraso)',
    'Propuesta formal de fraccionamiento de la deuda para atraso significativo.',
    'Propuesta de plan de pago para su saldo pendiente',
    $cuerpo$Estimado(a) {{nombreCliente}},

Su cuenta presenta un saldo de {{montoAdeudado}} con {{diasAtraso}} días de atraso, correspondiente a la factura {{numeroFactura}} vencida el {{fechaVencimiento}}.

Dada la antigüedad de esta deuda, le proponemos formalizar un plan de pago fraccionado en los siguientes términos: {{condicionesPlanPago}}.

Nuestro objetivo es encontrar una solución viable para ambas partes y evitar que la situación escale. Le solicitamos confirmar su disposición a este plan o proponer una contrapropuesta dentro de los próximos días hábiles.

Quedamos a su disposición para coordinar una llamada si lo prefiere.

Saludos cordiales,
{{nombreAgente}}$cuerpo$
  ),
  (
    'negociacion_prioritaria',
    'Negociación prioritaria (más de 90 días de atraso)',
    'Tono firme pero profesional para atraso crítico; el caso queda marcado para atención manual del agente (sin escalamiento automático a legal/supervisor en v1).',
    'Atención requerida: saldo pendiente con {{diasAtraso}} días de atraso',
    $cuerpo$Estimado(a) {{nombreCliente}},

Su cuenta mantiene un saldo pendiente de {{montoAdeudado}}, correspondiente a la factura {{numeroFactura}}, con {{diasAtraso}} días de atraso desde su vencimiento el {{fechaVencimiento}}.

Esta situación requiere resolverse de manera prioritaria. Le solicitamos comunicarse con nosotros a la brevedad para definir un plan de pago que evite consecuencias mayores para su cuenta y la continuidad del servicio.

Un(a) representante de nuestro equipo se pondrá en contacto con usted en los próximos días para revisar personalmente su caso.

Saludos cordiales,
{{nombreAgente}}$cuerpo$
  ),
  (
    'negociacion_alto_valor',
    'Negociación personalizada para cliente de alto valor',
    'Usar en lugar de la plantilla estándar del nivel de riesgo cuando el cliente es de alto valor (antigüedad/volumen de negocio), priorizando la relación comercial sobre el tono del segmento.',
    'Conversemos sobre el estado de su cuenta',
    $cuerpo$Estimado(a) {{nombreCliente}},

Como uno de nuestros clientes de mayor trayectoria, queremos abordar de forma personal el saldo pendiente de {{montoAdeudado}} en su cuenta ({{diasAtraso}} días de atraso, factura {{numeroFactura}}).

Valoramos la relación comercial que hemos construido y por eso preferimos conversar directamente antes de aplicar un proceso estándar. Estamos en disposición de evaluar condiciones especiales de pago que se ajusten a su situación: {{condicionesPlanPago}}.

Quedo atento(a) para coordinar una llamada o reunión en los próximos días.

Saludos cordiales,
{{nombreAgente}}$cuerpo$
  )
on conflict (escenario) do nothing;
