import * as schemas from './schemas';
import { z } from 'zod';

export const API_RESOURCES = {
    account: schemas.AccountSchema,
    agent: schemas.AgentSchema,
    attendance: schemas.AttendanceSchema,
    bank: schemas.BankSchema,
    banner: schemas.BannerSchema,
    bed: schemas.BedSchema,
    bonus: schemas.BonuSchema,
    branch: schemas.BranchSchema,
    category: schemas.CategorySchema,
    compensation: schemas.CompensationSchema,
    customer: schemas.CustomerSchema,
    discount: schemas.DiscountSchema,
    employee: schemas.EmployeeSchema,
    expense: schemas.ExpenseSchema,
    income: schemas.IncomeSchema,
    journal: schemas.JournalSchema,
    period: schemas.PeriodSchema,
    room: schemas.RoomSchema,
    session: schemas.SessionSchema,
    shift: schemas.ShiftSchema,
    supplier: schemas.SupplierSchema,
    transfer: schemas.TransferSchema,
    treatment: schemas.TreatmentSchema,
    user: schemas.UserSchema,
    voucher: schemas.VoucherSchema,
    walkin: schemas.WalkinSchema,
    wallet: schemas.WalletSchema,
} as const;

export type ApiResourceType = keyof typeof API_RESOURCES;
export type ApiResourceSchema<T extends ApiResourceType> = typeof API_RESOURCES[T];
export type ApiResourceData<T extends ApiResourceType> = z.infer<ApiResourceSchema<T>>;
