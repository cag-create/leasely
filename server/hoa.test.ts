import { describe, expect, it } from "vitest";
import { advanceDueDate, annualDuesCents, daysUntil, reminderDue, toLast4 } from "./hoa/logic";

describe("advanceDueDate", () => {
  it("rolls by frequency", () => {
    expect(advanceDueDate("2026-11-01", "monthly")).toBe("2026-12-01");
    expect(advanceDueDate("2026-12-15", "monthly")).toBe("2027-01-15");
    expect(advanceDueDate("2026-11-01", "quarterly")).toBe("2027-02-01");
    expect(advanceDueDate("2026-07-01", "semiannual")).toBe("2027-01-01");
    expect(advanceDueDate("2026-03-10", "annual")).toBe("2027-03-10");
  });
  it("clamps to the end of shorter months", () => {
    expect(advanceDueDate("2027-01-31", "monthly")).toBe("2027-02-28");
    expect(advanceDueDate("2028-01-31", "monthly")).toBe("2028-02-29");
    expect(advanceDueDate("2026-08-31", "quarterly")).toBe("2026-11-30");
  });
});

describe("reminderDue", () => {
  const base = { today: "2026-11-24", nextDueDate: "2026-12-01", reminderDaysBefore: 7, lastReminderForDueDate: null };
  it("fires inside the window", () => expect(reminderDue(base)).toBe(true));
  it("waits until the window opens", () => expect(reminderDue({ ...base, today: "2026-11-23" })).toBe(false));
  it("fires once per due date", () => expect(reminderDue({ ...base, lastReminderForDueDate: "2026-12-01" })).toBe(false));
  it("stops 3 days after the due date", () => expect(reminderDue({ ...base, today: "2026-12-05" })).toBe(false));
  it("needs a due date", () => expect(reminderDue({ ...base, nextDueDate: null })).toBe(false));
});

describe("helpers", () => {
  it("daysUntil", () => expect(daysUntil("2026-11-08", "2026-12-01")).toBe(23));
  it("annual dues", () => {
    expect(annualDuesCents(25000, "monthly")).toBe(300000);
    expect(annualDuesCents(60000, "quarterly")).toBe(240000);
  });
  it("never keeps more than the last 4 digits", () => {
    expect(toLast4("ACCT 0012-3456-7890")).toBe("7890");
    expect(toLast4("")).toBeNull();
    expect(toLast4(null)).toBeNull();
  });
});
