import { describe, expect, it } from "vitest";
import Papa from "papaparse";
import { autoMap, buildRow, googleSheetCsvUrl, inferColumnType, normDate, propertyKey, splitStoredAddress } from "../shared/moveIn";

describe("CSV parsing (papaparse)", () => {
  it("keeps quoted commas, escaped quotes and newlines inside a cell", () => {
    const csv = 'address,unit,notes\n"812 Maple Ave, Bldg A",4B,"Tenant said ""ok""\nsecond line"\n';
    const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: "greedy" });
    expect(data).toHaveLength(1);
    expect(data[0].address).toBe("812 Maple Ave, Bldg A");
    expect(data[0].notes).toBe('Tenant said "ok"\nsecond line');
  });
});

describe("autoMap", () => {
  it("maps AppFolio / Buildium style headers", () => {
    const m = autoMap(["Property Address", "Unit", "Resident Name", "Email", "Rent", "Move In", "Lease Expiration", "HOA Dues"]);
    expect(m["Property Address"]).toBe("address");
    expect(m["Resident Name"]).toBe("tenantFullName");
    expect(m["Move In"]).toBe("leaseStart");
    expect(m["Lease Expiration"]).toBe("leaseEnd");
    expect(m["HOA Dues"]).toBe("hoaDues");
  });
  it("never maps two columns to the same field", () => {
    const m = autoMap(["Email", "Email Address"]);
    expect(m["Email"]).toBe("tenantEmail");
    expect(m["Email Address"]).toBe("");
  });
});

describe("buildRow", () => {
  const mapping = { addr: "address", u: "unit", name: "tenantFullName", st: "state", rent: "monthlyRent", start: "leaseStart" } as const;
  it("accepts a vacant unit with only an address", () => {
    const { row, errors } = buildRow({ addr: "19 Lakeview Ct", u: "", name: "", st: "tn", rent: "", start: "" }, mapping);
    expect(errors).toEqual([]);
    expect(row.state).toBe("TN");
    expect(row.tenantFirstName).toBeUndefined();
  });
  it("splits 'Last, First' and parses money and dates", () => {
    const { row, errors } = buildRow({ addr: "1 Main St", u: "2", name: "Reed, Jasmine", st: "NC", rent: "$1,450.00", start: "6/1/25" }, mapping);
    expect(errors).toEqual([]);
    expect(row.tenantFirstName).toBe("Jasmine");
    expect(row.tenantLastName).toBe("Reed");
    expect(row.monthlyRentCents).toBe(145000);
    expect(row.leaseStart).toBe("2025-06-01");
  });
  it("flags a tenant row without rent or start date", () => {
    const { errors } = buildRow({ addr: "1 Main St", u: "", name: "Jane Doe", st: "NC", rent: "", start: "" }, mapping);
    expect(errors).toContain("Tenant row needs monthly rent");
    expect(errors).toContain("Tenant row needs a lease start date");
  });
});

describe("dedupe keys", () => {
  it("matches the same unit written differently", () => {
    expect(propertyKey("812 Maple Avenue", "Apt 4B")).toBe(propertyKey("812 maple ave.", "#4b"));
    expect(propertyKey("812 Maple Ave", "4B")).not.toBe(propertyKey("812 Maple Ave", "4C"));
  });
  it("reads addresses stored by the old importer", () => {
    expect(splitStoredAddress("812 Maple Ave #4B")).toEqual({ address: "812 Maple Ave", unit: "4B" });
    expect(splitStoredAddress("12 Oak St · Rm 3")).toEqual({ address: "12 Oak St", unit: "3" });
    expect(splitStoredAddress("19 Lakeview Ct")).toEqual({ address: "19 Lakeview Ct", unit: "" });
  });
});

describe("helpers", () => {
  it("normDate handles Excel serials", () => expect(normDate("45809")).toBe("2025-06-01"));
  it("inferColumnType", () => {
    expect(inferColumnType(["a@b.com", "c@d.org"])).toBe("email");
    expect(inferColumnType(["$1,200.00", "950.00"])).toBe("money");
    expect(inferColumnType(["2025-01-01"])).toBe("date");
  });
  it("googleSheetCsvUrl only accepts Google Sheets links", () => {
    expect(googleSheetCsvUrl("https://docs.google.com/spreadsheets/d/abc123/edit#gid=42")).toBe("https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=42");
    expect(googleSheetCsvUrl("https://evil.example.com/spreadsheets/d/abc")).toBeNull();
    expect(googleSheetCsvUrl("not a url")).toBeNull();
  });
});
