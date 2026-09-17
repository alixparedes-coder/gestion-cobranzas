import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calcularDiasAtraso,
  calcularNivelMonto,
  calcularNivelRiesgoPorDias,
  calcularSegmentoCliente,
  esClienteAltoValor,
  obtenerFacturaMasAntigua,
} from "./calcularSegmento.ts";
import type { Cliente, Factura } from "@/types/cobranza";

const HOY = new Date("2026-09-15");

describe("calcularDiasAtraso", () => {
  it("devuelve 0 si la factura todavía no vence", () => {
    assert.equal(calcularDiasAtraso("2026-09-20", HOY), 0);
  });

  it("devuelve 0 el mismo día del vencimiento", () => {
    assert.equal(calcularDiasAtraso("2026-09-15", HOY), 0);
  });

  it("cuenta los días de atraso cuando ya venció", () => {
    assert.equal(calcularDiasAtraso("2026-09-01", HOY), 14);
  });
});

describe("calcularNivelRiesgoPorDias", () => {
  const casos: Array<[number, string]> = [
    [0, "sin_riesgo"],
    [1, "bajo"],
    [15, "bajo"],
    [16, "medio"],
    [45, "medio"],
    [46, "alto"],
    [90, "alto"],
    [91, "critico"],
    [365, "critico"],
  ];

  for (const [dias, esperado] of casos) {
    it(`${dias} días de atraso -> ${esperado}`, () => {
      assert.equal(calcularNivelRiesgoPorDias(dias), esperado);
    });
  }
});

describe("calcularNivelMonto", () => {
  const casos: Array<[number, string]> = [
    [0, "bajo"],
    [5000, "bajo"],
    [5001, "medio"],
    [20000, "medio"],
    [20001, "alto"],
  ];

  for (const [saldo, esperado] of casos) {
    it(`saldo ${saldo} -> ${esperado}`, () => {
      assert.equal(calcularNivelMonto(saldo), esperado);
    });
  }
});

describe("esClienteAltoValor", () => {
  const base: Cliente = {
    id: "c1",
    codigoExterno: "C1",
    nombre: "Cliente",
    antiguedadClienteMeses: 0,
    volumenNegocio: 0,
  };

  it("no es alto valor por debajo de ambos umbrales", () => {
    assert.equal(esClienteAltoValor(base), false);
  });

  it("es alto valor solo por antigüedad", () => {
    assert.equal(esClienteAltoValor({ ...base, antiguedadClienteMeses: 36 }), true);
  });

  it("es alto valor solo por volumen de negocio", () => {
    assert.equal(esClienteAltoValor({ ...base, volumenNegocio: 50000 }), true);
  });

  it("trata antigüedad/volumen nulos como 0", () => {
    assert.equal(
      esClienteAltoValor({ ...base, antiguedadClienteMeses: null, volumenNegocio: null }),
      false
    );
  });
});

describe("obtenerFacturaMasAntigua", () => {
  it("devuelve null si no hay facturas con saldo pendiente", () => {
    const facturas: Factura[] = [
      { id: "f1", clienteId: "c1", saldoPendiente: 0, fechaVencimiento: "2026-08-01" },
    ];
    assert.equal(obtenerFacturaMasAntigua(facturas), null);
  });

  it("ignora las facturas ya pagadas y elige la de vencimiento más antiguo", () => {
    const facturas: Factura[] = [
      { id: "f1", clienteId: "c1", saldoPendiente: 0, fechaVencimiento: "2026-07-01" },
      { id: "f2", clienteId: "c1", saldoPendiente: 100, fechaVencimiento: "2026-09-01" },
      { id: "f3", clienteId: "c1", saldoPendiente: 200, fechaVencimiento: "2026-08-01" },
    ];
    assert.equal(obtenerFacturaMasAntigua(facturas)?.id, "f3");
  });
});

describe("calcularSegmentoCliente", () => {
  it("sin facturas pendientes: sin riesgo, saldo en 0", () => {
    const cliente: Cliente = {
      id: "c1",
      codigoExterno: "C1",
      nombre: "Cliente",
      antiguedadClienteMeses: 0,
      volumenNegocio: 0,
    };
    const segmento = calcularSegmentoCliente(cliente, [], HOY);
    assert.equal(segmento.nivelRiesgo, "sin_riesgo");
    assert.equal(segmento.saldoPendienteTotal, 0);
    assert.equal(segmento.diasAtraso, 0);
  });

  it("reproduce el caso real de Cliente 1009 (prueba de antigüedad): dos tramos, el más antiguo manda el riesgo", () => {
    // Datos de la prueba con el reporte real: 1-15 días ($86.047,38) + 31+ días ($44.052,35).
    const cliente: Cliente = {
      id: "1009",
      codigoExterno: "1009",
      nombre: "Cliente 1009",
      antiguedadClienteMeses: 0,
      volumenNegocio: 0,
    };
    const facturas: Factura[] = [
      { id: "f-reciente", clienteId: "1009", saldoPendiente: 86047.38, fechaVencimiento: "2026-09-05" },
      { id: "f-vieja", clienteId: "1009", saldoPendiente: 44052.35, fechaVencimiento: "2026-08-01" },
    ];

    const segmento = calcularSegmentoCliente(cliente, facturas, HOY);

    assert.ok(Math.abs(segmento.saldoPendienteTotal - 130099.73) < 0.01);
    assert.equal(segmento.diasAtraso, 45); // desde 2026-08-01 hasta 2026-09-15
    assert.equal(segmento.nivelRiesgo, "medio"); // manda el tramo más antiguo (45 días), no el más reciente
    assert.equal(segmento.nivelMonto, "alto");
  });
});
