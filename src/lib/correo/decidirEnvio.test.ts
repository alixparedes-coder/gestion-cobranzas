import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { decidirEnvioParaCliente } from "./decidirEnvio.ts";
import type { Cliente, Factura } from "@/types/cobranza";

const HOY = new Date("2026-09-15");

function cliente(parcial: Partial<Cliente> = {}): Cliente {
  return {
    id: "c1",
    codigoExterno: "C1",
    nombre: "Cliente Uno",
    correo: "cliente@ejemplo.com",
    analistaAsignado: "Analista 1",
    antiguedadClienteMeses: 0,
    volumenNegocio: 0,
    envioAutomaticoHabilitado: true,
    ...parcial,
  };
}

const FACTURA_VENCIDA: Factura = {
  id: "f1",
  clienteId: "c1",
  numeroFactura: "F-001",
  saldoPendiente: 1000,
  fechaVencimiento: "2026-09-01",
};

describe("decidirEnvioParaCliente", () => {
  it("sin facturas pendientes: sin acción", () => {
    const decision = decidirEnvioParaCliente(cliente(), [], false, HOY);
    assert.deepEqual(decision, { tipo: "sin_accion" });
  });

  it("con atraso, todo en orden: decide enviar con el escenario correcto", () => {
    const decision = decidirEnvioParaCliente(cliente(), [FACTURA_VENCIDA], false, HOY);
    assert.equal(decision.tipo, "enviar");
    if (decision.tipo === "enviar") {
      assert.equal(decision.escenario, "recordatorio_preventivo"); // 14 días de atraso -> riesgo bajo
      assert.equal(decision.facturaMasAntigua?.numeroFactura, "F-001");
    }
  });

  it("envío deshabilitado (RF-12): omite sin importar el escenario", () => {
    const decision = decidirEnvioParaCliente(
      cliente({ envioAutomaticoHabilitado: false }),
      [FACTURA_VENCIDA],
      false,
      HOY
    );
    assert.deepEqual(decision, { tipo: "omitido_envio_deshabilitado", escenario: "recordatorio_preventivo" });
  });

  it("sin correo registrado: omite", () => {
    const decision = decidirEnvioParaCliente(cliente({ correo: null }), [FACTURA_VENCIDA], false, HOY);
    assert.deepEqual(decision, { tipo: "omitido_sin_correo", escenario: "recordatorio_preventivo" });
  });

  it("ya se envió algo recientemente: omite para no ser repetitivo (PRD 17)", () => {
    const decision = decidirEnvioParaCliente(cliente(), [FACTURA_VENCIDA], true, HOY);
    assert.deepEqual(decision, { tipo: "omitido_reciente", escenario: "recordatorio_preventivo" });
  });

  it("cliente de alto valor con atraso: escenario de negociación personalizada al enviar", () => {
    const decision = decidirEnvioParaCliente(
      cliente({ volumenNegocio: 100000 }),
      [FACTURA_VENCIDA],
      false,
      HOY
    );
    assert.equal(decision.tipo, "enviar");
    if (decision.tipo === "enviar") {
      assert.equal(decision.escenario, "negociacion_alto_valor");
      assert.equal(decision.facturaMasAntigua?.id, "f1");
    }
  });
});
