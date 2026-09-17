# PRD — Sistema de Gestión de Cobranzas y Recuperación de Cartera

**Proyecto:** Herramienta de segmentación de morosidad, recomendación de acciones y seguimiento de cobranzas
**Sector:** Servicios de logística
**Preparado para:** Desarrollo en Claude Code
**Fecha:** 23 de agosto de 2026
**Versión:** 1.0

---

## 1. Resumen ejecutivo

La empresa necesita mejorar la gestión de cobranzas de su cartera de clientes de servicios logísticos, priorizando a los clientes con mayor morosidad. El sistema propuesto deberá segmentar automáticamente a los clientes según su nivel de riesgo de impago, recomendar la acción de cobranza más adecuada para cada escenario, automatizar el envío de comunicaciones por correo electrónico y ofrecer un panel de seguimiento (dashboard) que permita a agentes y supervisores monitorear el estado de la cartera y el impacto de las gestiones realizadas.

El proyecto se concibe como una solución completa desde su primera versión (no un MVP mínimo), cubriendo segmentación, motor de recomendación de acciones, automatización de correos y dashboard analítico.

---

## 2. Contexto y problema a resolver

La empresa cuenta con datos estructurados de clientes y facturación (actualmente en archivos Excel/CSV, actualizados de forma semanal o con menor frecuencia), pero no dispone de un proceso sistemático para:

- Identificar de forma objetiva qué clientes representan mayor riesgo de morosidad.
- Determinar qué acción de cobranza aplicar según el escenario específico de cada cliente.
- Dar seguimiento centralizado al avance de las gestiones y su efectividad.

Esto genera una gestión de cobranzas reactiva y poco priorizada, con el consecuente impacto negativo en la recuperación de cartera y en el flujo de caja de la empresa.

---

## 3. Objetivos

### 3.1 Objetivo general

Mejorar la gestión de cobranzas mediante un sistema que segmente a los clientes por nivel de morosidad, recomiende acciones de cobranza específicas por escenario, y automatice y dé seguimiento a dichas gestiones, incrementando la tasa de recuperación de cartera.

### 3.2 Objetivos específicos

- Clasificar automáticamente a los clientes en segmentos de riesgo de morosidad según reglas configurables.
- Recomendar, para cada cliente o segmento, la acción de cobranza más apropiada (recordatorio preventivo o negociación de plan de pago).
- Automatizar el envío de correos electrónicos de cobranza según el escenario del cliente, integrado con Resend.
- Proveer un dashboard con indicadores clave (KPIs) de cartera vencida, días de mora y tasa de recuperación.
- Permitir la carga periódica (semanal o según ciclo definido) de datos de clientes y facturación desde archivos Excel/CSV.

---

## 4. Alcance

### 4.1 Incluido en el alcance (v1)

- Carga e importación de datos desde archivos Excel/CSV.
- Motor de segmentación de morosidad basado en: días de atraso, monto adeudado, y antigüedad/valor del cliente.
- Motor de recomendación de acciones para dos escenarios: recordatorio preventivo y negociación de plan de pago (incluye variantes como fraccionamiento o descuento por pago pronto dentro de la negociación).
- Automatización de envío de correos electrónicos vía Resend según el escenario recomendado.
- Dashboard de seguimiento con KPIs de cartera vencida, días de mora y recuperación, con vista compartida para agentes y supervisores.
- Registro histórico de gestiones realizadas por cliente.

### 4.2 Explícitamente fuera de alcance (v1)

- Escalamiento automático a supervisor o al área legal.
- Suspensión o restricción automática de servicios logísticos por mora.
- Comunicación automatizada por WhatsApp, SMS o llamadas (las llamadas quedan como tarea manual asignada al agente, sin automatización).
- Integración directa con el ERP/TMS logístico (la carga de datos se realiza vía archivos Excel/CSV).
- Roles y permisos diferenciados entre agentes y supervisores (todos los usuarios ven la misma información en v1).

> Estos puntos quedan identificados como candidatos para fases futuras (ver sección 12, Roadmap).

---

## 5. Usuarios del sistema

| Usuario | Uso principal |
|---|---|
| Agentes de cobranza | Consultar cartera priorizada, ejecutar/registrar acciones recomendadas, dar seguimiento a clientes asignados |
| Supervisores/gerentes | Monitorear KPIs globales de cartera, revisar efectividad de las gestiones, tomar decisiones sobre la cartera |

En esta versión, ambos tipos de usuario acceden a la misma vista e información (sin roles ni permisos diferenciados). La diferenciación de roles queda como mejora futura.

---

## 6. Datos y fuentes de información

### 6.1 Fuente y frecuencia

- **Formato de origen:** archivos Excel / CSV.
- **Frecuencia de actualización:** semanal o menos frecuente (según ciclo de carga definido por el equipo).
- **Volumen estimado:** no especificado con precisión por el negocio; se asume una cartera de tamaño pequeño a mediano (del orden de cientos de clientes). **Este es un supuesto a validar** antes de dimensionar la solución técnica; si el volumen real es significativamente mayor, deberá revisarse el diseño de la base de datos y los tiempos de procesamiento.

### 6.2 Campos disponibles

- **Identificación y contacto:** nombre del cliente, identificación/NIT, correo electrónico, teléfono.
- **Facturación y deuda:** monto facturado, monto pagado, saldo pendiente, fecha de vencimiento.
- **Datos comerciales:** antigüedad como cliente, volumen de negocio, tipo de servicio logístico contratado.

### 6.3 Limitación de datos identificada

No se cuenta actualmente con un **historial detallado de pagos** (fechas de pagos anteriores, atrasos previos, reincidencia). Esto limita la segmentación a datos del estado actual del cliente (deuda vigente) y no permite incorporar comportamiento histórico de pago como criterio.

**Recomendación:** evaluar, en una fase posterior, la incorporación de historial de pagos para mejorar la precisión del modelo de riesgo (ver sección 12, Roadmap).

---

## 7. Segmentación de morosidad

El sistema clasificará a cada cliente combinando tres criterios: días de atraso, monto adeudado y antigüedad/valor del cliente.

### 7.1 Criterio 1 — Días de atraso

| Rango de días de atraso | Nivel |
|---|---|
| 0 (al día) | Sin riesgo |
| 1–15 días | Riesgo bajo |
| 16–45 días | Riesgo medio |
| 46–90 días | Riesgo alto |
| Más de 90 días | Riesgo crítico |

*(Los cortes de días son un valor por defecto propuesto; deben ser configurables para ajustarse a las políticas de crédito del negocio.)*

### 7.2 Criterio 2 — Monto adeudado

Se clasifica el saldo pendiente en terciles o rangos configurables (por ejemplo: bajo / medio / alto), definidos según la distribución real de la cartera al momento de la primera carga de datos.

### 7.3 Criterio 3 — Antigüedad y valor del cliente

Combina antigüedad como cliente y volumen de negocio para estimar el "valor" del cliente (clientes antiguos y de alto volumen se priorizan para negociación en lugar de acciones más agresivas, dado su valor estratégico).

### 7.4 Segmento final

El sistema combina los tres criterios en una matriz de segmentación (por ejemplo: Riesgo × Valor del cliente) que determina tanto la prioridad de gestión como la acción recomendada (sección 8). Las reglas exactas de combinación (pesos, umbrales) deberán definirse y ajustarse con el negocio durante la implementación, idealmente validando contra la experiencia histórica del equipo de cobranzas.

---

## 8. Escenarios y acciones recomendadas

| Segmento (ejemplo) | Escenario | Acción recomendada |
|---|---|---|
| Riesgo bajo, cualquier valor | Atraso reciente (1–15 días) | Recordatorio preventivo por correo |
| Riesgo medio | Atraso moderado (16–45 días) | Recordatorio + oferta de plan de pago o pronto pago con descuento |
| Riesgo alto | Atraso significativo (46–90 días) | Negociación de plan de pago (fraccionamiento) |
| Riesgo crítico | Atraso mayor a 90 días | Negociación de plan de pago prioritaria; el sistema debe destacar el caso para atención manual del agente (sin escalamiento automático a legal/supervisor en v1) |
| Cliente de alto valor (antigüedad/volumen) en cualquier nivel de riesgo | — | Priorizar negociación personalizada antes que acciones estándar |

El motor de recomendación debe ser configurable: los umbrales y el mapeo segmento → acción no deben quedar fijos en el código, sino parametrizables por el negocio.

---

## 9. Automatización de comunicaciones (correo electrónico)

- **Canal:** correo electrónico, integrado con **Resend** (API de envío transaccional).
- **Disparo:** el envío se genera automáticamente según el escenario/acción recomendada para cada cliente (por ejemplo, recordatorio preventivo al vencimiento, o propuesta de plan de pago al entrar en riesgo medio/alto).
- **Contenido:** plantillas de correo diferenciadas por escenario (tono preventivo vs. tono de negociación), con variables dinámicas (nombre del cliente, monto adeudado, fecha de vencimiento, condiciones de plan de pago propuesto).
- **Trazabilidad:** cada envío debe quedar registrado (fecha, destinatario, plantilla usada, resultado del envío) para su consulta en el dashboard y como parte del historial de gestiones del cliente.
- **Configuración:** debe existir una forma de habilitar/deshabilitar el envío automático por cliente o por segmento, para permitir intervención manual cuando el agente lo considere necesario.

**Nota técnica:** la integración se implementa vía la API HTTP de Resend (paquete oficial `resend` para Node.js), con un dominio propio de la empresa verificado en Resend para que los correos salgan desde una dirección corporativa y no desde un dominio de pruebas. Requiere una cuenta de Resend y su API key (`RESEND_API_KEY`).

> **Decisión (23 sep 2026):** se reemplazó la integración inicialmente prevista con Outlook/Microsoft 365 (Graph API/SMTP) por Resend, para no depender del licenciamiento de Microsoft 365 de la empresa ni de la complejidad de la autenticación OAuth de Graph API.

---

## 10. Dashboard de seguimiento

### 10.1 Vistas requeridas

- **Vista de cartera general:** listado de clientes con su segmento de riesgo, saldo adeudado, días de atraso y última acción/estado de gestión.
- **Vista de KPIs:** indicadores agregados de la cartera (ver sección 11).
- **Vista de detalle de cliente:** historial de gestiones (correos enviados, negociaciones propuestas, pagos registrados) para un cliente específico.

### 10.2 Filtros y priorización

- Filtrar/ordenar por segmento de riesgo, monto adeudado, días de atraso y valor del cliente.
- Vista priorizada que resalte primero a los clientes de mayor morosidad y/o mayor valor, para enfocar el esfuerzo de cobranza donde más impacto tiene.

---

## 11. Indicadores de éxito (KPIs)

El proyecto se considerará exitoso en la medida en que, tras su implementación, se observe una mejora sostenida en:

- **Tasa de recuperación de cartera:** porcentaje de la deuda morosa efectivamente recuperada en un período determinado. **Meta: 95% del saldo total recuperado, medida por cliente** (no solo como promedio agregado de toda la cartera — cada cliente debe acercarse a ese 95% de su propio saldo).
- **Reducción de días promedio de mora:** tiempo promedio que tardan los clientes en pagar después del vencimiento.
- **% de cartera vencida sobre cartera total:** disminución de la proporción de deuda en mora respecto a la cartera total.

**Nota:** la tasa de recuperación ya tiene meta definida (95% por cliente, ver arriba). Los otros dos KPIs (días promedio de mora, % de cartera vencida) aún no tienen metas numéricas; se recomienda establecer una línea base con los datos actuales apenas el sistema esté operativo, y definirlas en conjunto con el negocio durante las primeras semanas de uso.

---

## 12. Requisitos funcionales (RF)

| ID | Requisito |
|---|---|
| RF-01 | El sistema debe permitir importar datos de clientes y facturación desde archivos Excel/CSV. |
| RF-02 | El sistema debe validar la estructura e integridad básica de los archivos importados (campos requeridos, formatos de fecha y montos) y reportar errores de forma clara. |
| RF-03 | El sistema debe calcular automáticamente el segmento de riesgo de morosidad de cada cliente según los criterios definidos en la sección 7. |
| RF-04 | El sistema debe permitir configurar los umbrales de segmentación (días de atraso, rangos de monto) sin necesidad de modificar código. |
| RF-05 | El sistema debe recomendar una acción de cobranza (recordatorio preventivo o negociación de plan de pago) para cada cliente, según su segmento. |
| RF-06 | El sistema debe generar y enviar correos electrónicos automáticos vía Resend según la acción recomendada. |
| RF-07 | El sistema debe permitir definir y editar plantillas de correo por escenario. |
| RF-08 | El sistema debe registrar el historial de gestiones (envíos, acciones, cambios de estado) por cliente. |
| RF-09 | El sistema debe permitir registrar manualmente el resultado de gestiones no automatizadas (por ejemplo, llamadas telefónicas). |
| RF-10 | El sistema debe mostrar un dashboard con los KPIs definidos en la sección 11, calculados a partir de los datos cargados. |
| RF-11 | El sistema debe permitir filtrar y ordenar la cartera de clientes por segmento, monto, días de atraso y valor del cliente. |
| RF-12 | El sistema debe permitir deshabilitar el envío automático de correos para un cliente o segmento específico. |

---

## 13. Requisitos no funcionales (RNF)

| ID | Requisito |
|---|---|
| RNF-01 | El sistema debe poder procesar cargas semanales de datos sin degradación perceptible de rendimiento, para el volumen de cartera estimado (a validar, ver 6.1). |
| RNF-02 | Los datos personales y financieros de los clientes deben almacenarse y transmitirse de forma segura (cifrado en tránsito para el envío de correos e integración con Resend; control de acceso a la base de datos). |
| RNF-03 | El sistema debe manejar de forma responsable datos personales de clientes, en línea con la normativa de protección de datos aplicable en la jurisdicción de operación de la empresa. |
| RNF-04 | El sistema debe ser mantenible: reglas de segmentación y mapeo de acciones deben poder actualizarse por el negocio sin depender de un desarrollador para cada ajuste menor. |
| RNF-05 | El sistema debe registrar logs de auditoría de los envíos automáticos de correo (qué se envió, a quién y cuándo) para trazabilidad. |
| RNF-06 | La interfaz del dashboard debe ser utilizable por perfiles no técnicos (agentes y supervisores), priorizando claridad sobre complejidad visual. |

---

## 14. Arquitectura técnica (propuesta orientativa)

El negocio no tiene una preferencia de stack definida y delega esta decisión al equipo de desarrollo en Claude Code. Se propone la siguiente orientación, a validar/ajustar durante la implementación:

- **Tipo de solución:** aplicación web ligera (backend + base de datos + frontend de dashboard), dado que se requiere una vista compartida persistente (dashboard) y automatización programada de envíos de correo, lo cual excede lo que un script local puede sostener de forma confiable.
- **Backend:** framework ligero (por ejemplo, Python con FastAPI, o Node.js con Express), responsable de: ingestión de archivos, cálculo de segmentación, motor de reglas de acciones, integración con la API de Resend para envío de correos.
- **Base de datos:** base de datos relacional (por ejemplo, PostgreSQL o SQLite si el volumen es reducido) para almacenar clientes, historial de gestiones y configuración de reglas.
- **Frontend/Dashboard:** interfaz web simple (por ejemplo, un framework ligero de UI o un dashboard basado en tablas y gráficos) que consuma los datos calculados por el backend.
- **Procesamiento de cargas:** un proceso de importación (manual, disparado por el usuario al subir el archivo) que valide y transforme los Excel/CSV en los registros del sistema.
- **Automatización de correos:** proceso programado (scheduler/cron interno de la aplicación) que evalúe diariamente qué clientes requieren una comunicación según su segmento y estado, y dispare el envío vía la API de Resend.

Esta sección es una guía de partida, no una decisión cerrada: el equipo de desarrollo puede proponer alternativas siempre que se cumplan los requisitos funcionales y no funcionales anteriores.

---

## 15. Integraciones

| Integración | Estado |
|---|---|
| Resend (envío de correos) | Requerida en v1 |
| ERP/TMS logístico | Fuera de alcance en v1 (carga de datos vía Excel/CSV) |
| WhatsApp/SMS | Fuera de alcance en v1 |

---

## 16. Supuestos y restricciones

- Se asume un volumen de cartera pequeño a mediano; debe validarse con datos reales antes de finalizar decisiones de arquitectura (ver 6.1 y RNF-01).
- No se cuenta con historial de pagos detallado; la segmentación se basa en el estado actual de la deuda, no en comportamiento histórico (ver 6.3).
- La tasa de recuperación de cartera tiene meta definida (95% del saldo por cliente); los otros dos KPIs aún no la tienen y se recomienda establecerla tras contar con una línea base (ver sección 11).
- La empresa debe contar con una cuenta de Resend y un dominio propio verificado en Resend, necesario para la integración de envío de correos.
- En v1 no habrá diferenciación de roles/permisos entre agentes y supervisores.

---

## 17. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Volumen real de cartera mayor al asumido | Problemas de rendimiento o de diseño de datos | Validar volumen real antes de fijar la arquitectura definitiva; diseñar con capacidad de escalar la base de datos |
| Falta de historial de pagos limita la precisión de la segmentación | Clasificación de riesgo menos precisa | Evaluar en fase 2 la incorporación de historial de pagos; mientras tanto, comunicar al negocio que la segmentación es de "estado actual", no predictiva |
| Calidad de los datos en los archivos Excel/CSV (campos faltantes, formatos inconsistentes) | Errores de segmentación o envíos incorrectos | Validación estricta en la importación (RF-02) con reporte de errores claro |
| Envíos automáticos de correo percibidos como agresivos o inoportunos por el cliente | Deterioro de la relación comercial | Permitir deshabilitar envíos por cliente/segmento (RF-12) y revisión de plantillas por el negocio antes de activarlas |
| Ausencia de escalamiento automático a legal/supervisor para casos críticos | Casos de mora muy alta podrían no recibir atención oportuna | El dashboard debe resaltar visualmente los casos de riesgo crítico para que el equipo los atienda manualmente mientras esta función no esté automatizada |

---

## 18. Roadmap propuesto

### Fase 1 (alcance de este PRD)
Segmentación, motor de recomendación (recordatorio/negociación), automatización de correo vía Resend, dashboard con KPIs, sin roles diferenciados.

### Fase 2 (mejoras futuras candidatas)
- Incorporar historial de pagos para mejorar la precisión del modelo de riesgo.
- Roles y permisos diferenciados entre agentes y supervisores.
- Escalamiento automático a supervisor/legal para casos críticos.
- Suspensión/restricción de servicio por mora, si el negocio lo decide.
- Canales adicionales de comunicación (WhatsApp/SMS).
- Integración directa con el ERP/TMS logístico (eliminar la carga manual de Excel/CSV).
- Definición de metas numéricas para los otros dos KPIs (días promedio de mora, % de cartera vencida) y reportes comparativos período a período.

---

## 19. Criterios de aceptación (Definition of Done — v1)

- Se puede importar un archivo Excel/CSV de clientes/facturación y el sistema calcula correctamente el segmento de riesgo de cada cliente según las reglas configuradas.
- El sistema recomienda una acción (recordatorio o negociación) coherente con el segmento de cada cliente.
- El sistema envía correos automáticos vía Resend para al menos los dos escenarios definidos, con registro de trazabilidad.
- El dashboard muestra correctamente los tres KPIs definidos (tasa de recuperación, días promedio de mora, % de cartera vencida) calculados a partir de los datos cargados.
- Es posible filtrar/ordenar la cartera por segmento, monto y días de atraso desde el dashboard.
- Es posible deshabilitar el envío automático para un cliente o segmento específico.

---

## 20. Glosario

- **Cartera:** conjunto total de clientes con saldos pendientes de cobro.
- **Cartera vencida:** parte de la cartera cuyo pago está atrasado respecto a la fecha de vencimiento.
- **Morosidad:** condición de un cliente que no ha pagado dentro del plazo establecido.
- **Segmento de riesgo:** clasificación de un cliente según su probabilidad/nivel de morosidad.
- **Recuperación de cartera:** proceso y resultado de cobrar la deuda pendiente de clientes morosos.
Quiero crear un PRD (Product Requirements Document) para mi proyecto que voy a desarrollar en Claude Code. Te voy a explicar mi idea y tú me vas a hacer preguntas hasta que tengamos un documento completo con todos los requisitos para finalmente entregarme un PRD en formato Markdown (.md). Mi idea es mejorar la gestion de cobranzas enfocada en los cliente que puedan presentar mayor morosidad, asimismo necesito las posibles acciones a seguir en los diferentes escenarios y poder obtener mejor resultado en la recupercion de la cartera de clientes 