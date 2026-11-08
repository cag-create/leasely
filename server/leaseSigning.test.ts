import { describe, expect, it, vi, beforeEach } from "vitest";
import { createHash } from "crypto";
import type { TrpcContext } from "./_core/context";

// Tenant e-sign must always show the lease text first and bind the signature
// to the exact document shown. These tests pin that behaviour.

const lease = {
  id: 42,
  landlordUserId: 7,
  tenantName: "Jane Tenant",
  tenantEmail: "jane@example.com",
  tenantPhone: null,
  propertyAddress: "1 Main St, Memphis, TN 38115",
  state: "TN",
  monthlyRent: 120000,
  securityDeposit: 120000,
  leaseStartDate: "2026-12-01",
  leaseEndDate: null,
  leaseTerm: "12_months",
  listingId: null,
  status: "sent",
};

const doc = {
  id: 9,
  leaseAgreementId: 42,
  status: "sent",
  renderedHtml: "<h1>Residential Lease</h1><p>Rent is $1,200.</p>",
  uploadedFileUrl: null,
  uploadedFilename: null,
};
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

const db = vi.hoisted(() => ({
  getLeaseById: vi.fn(),
  updateLeaseAgreement: vi.fn().mockResolvedValue(undefined),
  getUserById: vi.fn().mockResolvedValue(null),
  getTenantByEmail: vi.fn().mockResolvedValue({ id: 1 }),
  createNotification: vi.fn().mockResolvedValue(undefined),
}));
const docs = vi.hoisted(() => ({
  listLeaseDocumentsByAgreement: vi.fn(),
  createLeaseSignature: vi.fn().mockResolvedValue(1),
  updateLeaseDocument: vi.fn().mockResolvedValue(undefined),
  logLeaseAudit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", async (orig) => ({ ...(await orig<typeof import("./db")>()), ...db }));
vi.mock("./leases/db-helpers", async (orig) => ({ ...(await orig<typeof import("./leases/db-helpers")>()), ...docs }));
vi.mock("./_core/email", async (orig) => ({ ...(await orig<typeof import("./_core/email")>()), sendEmail: vi.fn().mockResolvedValue(true) }));

const { appRouter } = await import("./routers");
const caller = appRouter.createCaller({
  user: null,
  req: { protocol: "https", headers: {}, ip: "1.2.3.4" } as unknown as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

beforeEach(() => {
  vi.clearAllMocks();
  db.getLeaseById.mockResolvedValue({ ...lease });
  docs.listLeaseDocumentsByAgreement.mockResolvedValue([{ ...doc }]);
});

describe("leases.getForSigning", () => {
  it("returns the lease text for the tenant on file", async () => {
    const r = await caller.leases.getForSigning({ leaseId: 42, tenantEmail: "JANE@example.com " });
    expect(r.document?.html).toContain("Residential Lease");
    expect(r.document?.fingerprint).toBe(sha(doc.renderedHtml));
  });

  it("rejects a different email", async () => {
    await expect(caller.leases.getForSigning({ leaseId: 42, tenantEmail: "x@example.com" })).rejects.toThrow(/doesn't match/);
  });

  it("returns document=null when the landlord attached nothing", async () => {
    docs.listLeaseDocumentsByAgreement.mockResolvedValue([]);
    const r = await caller.leases.getForSigning({ leaseId: 42, tenantEmail: "jane@example.com" });
    expect(r.document).toBeNull();
  });
});

describe("leases.sign", () => {
  const base = { leaseId: 42, tenantEmail: "jane@example.com", signatureName: "Jane Tenant", leaseDocumentId: 9, documentFingerprint: sha(doc.renderedHtml) };

  it("signs and records which document was signed", async () => {
    await caller.leases.sign(base);
    expect(db.updateLeaseAgreement).toHaveBeenCalledWith(42, 7, expect.objectContaining({ status: "tenant_signed" }));
    expect(docs.createLeaseSignature).toHaveBeenCalledWith(expect.objectContaining({ leaseDocumentId: 9, party: "tenant" }));
    expect(docs.logLeaseAudit).toHaveBeenCalledWith(expect.objectContaining({ event: "tenant_signed", leaseDocumentId: 9 }));
  });

  it("refuses to sign when there is no lease document", async () => {
    docs.listLeaseDocumentsByAgreement.mockResolvedValue([]);
    await expect(caller.leases.sign(base)).rejects.toThrow(/hasn't attached/);
    expect(db.updateLeaseAgreement).not.toHaveBeenCalled();
  });

  it("refuses when the lease text changed after the tenant opened it", async () => {
    docs.listLeaseDocumentsByAgreement.mockResolvedValue([{ ...doc, renderedHtml: doc.renderedHtml + "<p>New clause</p>" }]);
    await expect(caller.leases.sign(base)).rejects.toThrow(/updated since you opened it/);
    expect(db.updateLeaseAgreement).not.toHaveBeenCalled();
  });

  it("ignores voided documents", async () => {
    docs.listLeaseDocumentsByAgreement.mockResolvedValue([{ ...doc, status: "void" }]);
    await expect(caller.leases.sign(base)).rejects.toThrow(/hasn't attached/);
  });
});
