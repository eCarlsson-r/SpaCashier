// src/lib/validations/account.ts
import * as z from "zod";

// Define the 33 types as a constant for reuse
export const ACCOUNT_TYPES = [
    "cash", "account-receivable", "inventory", "raw-material", "work-in-process",
    "other-current-assets", "fixed-assets", "depreciation", "amortization",
    "other-assets", "account-payable", "other-current-liabilities", "long-term-liabilities",
    "equity-does-not-closed", "equity-gets-closed", "equity-re-end-year",
    "equity-retain-earnings", "income", "cost-of-sales", "cost-of-goods-manufactured",
    "sales-expenses", "adm-expenses", "godown-expenses", "direct-labor",
    "overhead-cost", "other-income", "other-expenses", "tax", "marketable-securities",
    "prepaid-expense", "other-stock", "finishing-inventory", "purchasing"
] as const;

export const AccountSchema = z.object({
    name: z.string().min(1, "Account name is required"),
    category: z.string().min(1, "Category (e.g. Bank, Kartu Kredit) is required"),
    type: z.enum(ACCOUNT_TYPES),
});

export type AccountFormValues = z.infer<typeof AccountSchema>;