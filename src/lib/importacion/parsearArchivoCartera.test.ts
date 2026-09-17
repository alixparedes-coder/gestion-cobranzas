import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { parsearArchivoCartera } from "./parsearArchivoCartera.ts";

const ENCABEZADOS = [
  "Código Cliente",
  "Nombre Cliente",
  "Número Factura",
  "Monto Facturado",
  "Monto Pagado",
  "Fecha Vencimiento",
];

async function construirXlsx(filas: Array<Array<string | number | Date>>): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Cartera");
  hoja.addRow(ENCABEZADOS);
  filas.forEach((fila) => hoja.addRow(fila));
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

function escaparCampoCsv(campo: string): string {
  return /[",\n]/.test(campo) ? `"${campo.replace(/"/g, '""')}"` : campo;
}

function construirCsv(filas: string[][]): Buffer {
  const lineas = [ENCABEZADOS, ...filas].map((fila) => fila.map(escaparCampoCsv).join(","));
  return Buffer.from(lineas.join("\n"), "utf8");
}

describe("parsearArchivoCartera — XLSX", () => {
  it("parsea una fila válida con fecha real de Excel", async () => {
    const buffer = await construirXlsx([
      ["C1", "Cliente Uno", "F-001", 1000, 200, new Date("2026-08-01")],
    ]);
    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");

    assert.deepEqual(errores, []);
    assert.equal(filasValidas.length, 1);
    assert.equal(filasValidas[0].codigoExterno, "C1");
    assert.equal(filasValidas[0].montoFacturado, 1000);
    assert.equal(filasValidas[0].montoPagado, 200);
    assert.equal(filasValidas[0].fechaVencimiento, "2026-08-01");
  });

  it("monto pagado por defecto es 0 si la columna viene vacía", async () => {
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Cartera");
    hoja.addRow(["Código Cliente", "Nombre Cliente", "Número Factura", "Monto Facturado", "Fecha Vencimiento"]);
    hoja.addRow(["C1", "Cliente Uno", "F-001", 500, new Date("2026-08-01")]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");
    assert.deepEqual(errores, []);
    assert.equal(filasValidas[0].montoPagado, 0);
  });

  it("reporta error si falta una columna requerida en el archivo", async () => {
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Cartera");
    hoja.addRow(["Código Cliente", "Nombre Cliente", "Monto Facturado", "Fecha Vencimiento"]); // sin "Número Factura"
    hoja.addRow(["C1", "Cliente Uno", 500, new Date("2026-08-01")]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");
    assert.equal(filasValidas.length, 0);
    assert.equal(errores.length, 1);
    assert.match(errores[0].mensaje, /numeroFactura/);
  });

  it("reporta error por fila cuando falta un campo requerido", async () => {
    const buffer = await construirXlsx([["C1", "", "F-001", 500, 0, new Date("2026-08-01")]]);
    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");

    assert.equal(filasValidas.length, 0);
    assert.equal(errores.length, 1);
    assert.equal(errores[0].fila, 1);
    assert.equal(errores[0].columna, "Nombre Cliente");
  });

  it("rechaza monto facturado <= 0", async () => {
    const buffer = await construirXlsx([["C1", "Cliente Uno", "F-001", 0, 0, new Date("2026-08-01")]]);
    const { errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");
    assert.equal(errores.length, 1);
    assert.equal(errores[0].columna, "Monto Facturado");
  });

  it("rechaza monto pagado mayor al monto facturado", async () => {
    const buffer = await construirXlsx([["C1", "Cliente Uno", "F-001", 100, 500, new Date("2026-08-01")]]);
    const { errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");
    assert.equal(errores.length, 1);
    assert.match(errores[0].mensaje, /no puede ser mayor/);
  });

  it("rechaza facturas duplicadas del mismo cliente en el mismo archivo", async () => {
    const buffer = await construirXlsx([
      ["C1", "Cliente Uno", "F-001", 500, 0, new Date("2026-08-01")],
      ["C1", "Cliente Uno", "F-001", 500, 0, new Date("2026-08-01")],
    ]);
    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");
    assert.equal(filasValidas.length, 1); // la primera pasa
    assert.equal(errores.length, 1); // la segunda se reporta como error
    assert.match(errores[0].mensaje, /aparece más de una vez/);
  });

  it("permite que un mismo cliente tenga varias facturas válidas (distinto número)", async () => {
    const buffer = await construirXlsx([
      ["C1", "Cliente Uno", "F-001", 500, 0, new Date("2026-08-01")],
      ["C1", "Cliente Uno", "F-002", 300, 0, new Date("2026-09-01")],
    ]);
    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.xlsx");
    assert.deepEqual(errores, []);
    assert.equal(filasValidas.length, 2);
  });
});

describe("parsearArchivoCartera — CSV", () => {
  it("parsea un CSV válido con fecha en texto ISO", async () => {
    const buffer = construirCsv([["C1", "Cliente Uno", "F-001", "1000", "0", "2026-08-01"]]);
    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.csv");

    assert.deepEqual(errores, []);
    assert.equal(filasValidas.length, 1);
    assert.equal(filasValidas[0].fechaVencimiento, "2026-08-01");
  });

  it("rechaza una fecha en formato no ISO", async () => {
    const buffer = construirCsv([["C1", "Cliente Uno", "F-001", "1000", "0", "01/08/2026"]]);
    const { errores } = await parsearArchivoCartera(buffer, "cartera.csv");
    assert.equal(errores.length, 1);
    assert.equal(errores[0].columna, "Fecha Vencimiento");
  });

  it("acepta montos con separador de miles y coma decimal", async () => {
    const buffer = construirCsv([["C1", "Cliente Uno", "F-001", "1.234,56", "0", "2026-08-01"]]);
    const { filasValidas, errores } = await parsearArchivoCartera(buffer, "cartera.csv");
    assert.deepEqual(errores, []);
    assert.equal(filasValidas[0].montoFacturado, 1234.56);
  });
});
