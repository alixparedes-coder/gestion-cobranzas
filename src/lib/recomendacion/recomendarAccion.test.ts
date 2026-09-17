import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recomendarAccion } from "./recomendarAccion.ts";
import { calcularSegmentoCliente } from "../segmentacion/calcularSegmento.ts";
import type { Cliente, Factura, SegmentoCliente } from "@/types/cobranza";

function segmento(parcial: Partial<SegmentoCliente>): SegmentoCliente {
  return {
    nivelRiesgo: "bajo",
    nivelMonto: "bajo",
    esAltoValor: false,
    diasAtraso: 5,
    saldoPendienteTotal: 100,
    ...parcial,
  };
}

describe("recomendarAccion", () => {
  it("sin atraso: no recomienda ninguna acción", () => {
    const resultado = recomendarAccion(segmento({ nivelRiesgo: "sin_riesgo" }));
    assert.deepEqual(resultado, { escenario: null, requiereAtencionManual: false });
  });

  it("riesgo bajo -> recordatorio preventivo", () => {
    const resultado = recomendarAccion(segmento({ nivelRiesgo: "bajo" }));
    assert.equal(resultado.escenario, "recordatorio_preventivo");
    assert.equal(resultado.requiereAtencionManual, false);
  });

  it("riesgo medio -> recordatorio con oferta de plan de pago", () => {
    const resultado = recomendarAccion(segmento({ nivelRiesgo: "medio" }));
    assert.equal(resultado.escenario, "recordatorio_plan_pago");
  });

  it("riesgo alto -> negociación de fraccionamiento", () => {
    const resultado = recomendarAccion(segmento({ nivelRiesgo: "alto" }));
    assert.equal(resultado.escenario, "negociacion_fraccionamiento");
  });

  it("riesgo crítico -> negociación prioritaria y requiere atención manual", () => {
    const resultado = recomendarAccion(segmento({ nivelRiesgo: "critico" }));
    assert.equal(resultado.escenario, "negociacion_prioritaria");
    assert.equal(resultado.requiereAtencionManual, true);
  });

  it("cliente de alto valor: siempre negociación personalizada, sin importar el riesgo", () => {
    for (const nivelRiesgo of ["bajo", "medio", "alto", "critico"] as const) {
      const resultado = recomendarAccion(segmento({ nivelRiesgo, esAltoValor: true }));
      assert.equal(resultado.escenario, "negociacion_alto_valor");
    }
  });

  it("alto valor + riesgo crítico: sigue marcando atención manual aunque cambie el escenario", () => {
    const resultado = recomendarAccion(segmento({ nivelRiesgo: "critico", esAltoValor: true }));
    assert.equal(resultado.escenario, "negociacion_alto_valor");
    assert.equal(resultado.requiereAtencionManual, true);
  });

  it("alto valor pero sin atraso: sigue sin recomendar nada (no hay deuda que negociar)", () => {
    const resultado = recomendarAccion(segmento({ nivelRiesgo: "sin_riesgo", esAltoValor: true }));
    assert.deepEqual(resultado, { escenario: null, requiereAtencionManual: false });
  });
});

describe("segmentación + recomendación combinadas (casos reales de la prueba de antigüedad)", () => {
  const HOY = new Date("2026-09-15");

  it("Cliente 6920: 1 tramo de 1-15 días -> recordatorio preventivo", () => {
    const cliente: Cliente = {
      id: "6920",
      codigoExterno: "6920",
      nombre: "Cliente 6920",
      antiguedadClienteMeses: 0,
      volumenNegocio: 0,
    };
    const facturas: Factura[] = [
      { id: "f1", clienteId: "6920", saldoPendiente: 2503.46, fechaVencimiento: "2026-09-05" },
    ];
    const resultado = recomendarAccion(calcularSegmentoCliente(cliente, facturas, HOY));
    assert.equal(resultado.escenario, "recordatorio_preventivo");
    assert.equal(resultado.requiereAtencionManual, false);
  });

  it("Cliente 17219: tramos de 1-15 y 16-30 días -> manda el más antiguo (recordatorio + plan de pago)", () => {
    const cliente: Cliente = {
      id: "17219",
      codigoExterno: "17219",
      nombre: "Cliente 17219",
      antiguedadClienteMeses: 0,
      volumenNegocio: 0,
    };
    const facturas: Factura[] = [
      { id: "f1", clienteId: "17219", saldoPendiente: 4215.3, fechaVencimiento: "2026-09-05" },
      { id: "f2", clienteId: "17219", saldoPendiente: 1099.7, fechaVencimiento: "2026-08-28" },
    ];
    const resultado = recomendarAccion(calcularSegmentoCliente(cliente, facturas, HOY));
    assert.equal(resultado.escenario, "recordatorio_plan_pago");
  });

  it("Cliente 1009: tramos de 1-15 y 31+ días -> manda el más antiguo (45 días, riesgo medio)", () => {
    const cliente: Cliente = {
      id: "1009",
      codigoExterno: "1009",
      nombre: "Cliente 1009",
      antiguedadClienteMeses: 0,
      volumenNegocio: 0,
    };
    const facturas: Factura[] = [
      { id: "f1", clienteId: "1009", saldoPendiente: 86047.38, fechaVencimiento: "2026-09-05" },
      { id: "f2", clienteId: "1009", saldoPendiente: 44052.35, fechaVencimiento: "2026-08-01" },
    ];
    const segmento = calcularSegmentoCliente(cliente, facturas, HOY);
    const resultado = recomendarAccion(segmento);
    assert.equal(segmento.nivelRiesgo, "medio");
    assert.equal(resultado.escenario, "recordatorio_plan_pago");
  });
});
