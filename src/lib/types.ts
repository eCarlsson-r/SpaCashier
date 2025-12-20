import { z } from 'zod';
import * as schemas from './schemas';

export type Account = z.infer<typeof schemas.AccountSchema>;
export type Agent = z.infer<typeof schemas.AgentSchema>;
export type Attendance = z.infer<typeof schemas.AttendanceSchema>;
export type Bank = z.infer<typeof schemas.BankSchema>;
export type Banner = z.infer<typeof schemas.BannerSchema>;
export type Bed = z.infer<typeof schemas.BedSchema>;
export type Bonus = z.infer<typeof schemas.BonuSchema>;
export type Branch = z.infer<typeof schemas.BranchSchema>;
export type CartRecord = z.infer<typeof schemas.CartRecordSchema>;
export type Category = z.infer<typeof schemas.CategorySchema>;
export type Compensation = z.infer<typeof schemas.CompensationSchema>;
export type Customer = z.infer<typeof schemas.CustomerSchema>;
export type Discount = z.infer<typeof schemas.DiscountSchema>;
export type Employee = z.infer<typeof schemas.EmployeeSchema>;
export type ExpenseItem = z.infer<typeof schemas.ExpenseItemSchema>;
export type ExpensePayment = z.infer<typeof schemas.ExpensePaymentSchema>;
export type Expense = z.infer<typeof schemas.ExpenseSchema>;
export type Grade = z.infer<typeof schemas.GradeSchema>;
export type IncomeItem = z.infer<typeof schemas.IncomeItemSchema>;
export type IncomePayment = z.infer<typeof schemas.IncomePaymentSchema>;
export type Income = z.infer<typeof schemas.IncomeSchema>;
export type JournalRecord = z.infer<typeof schemas.JournalRecordSchema>;
export type Journal = z.infer<typeof schemas.JournalSchema>;
export type Period = z.infer<typeof schemas.PeriodSchema>;
export type Room = z.infer<typeof schemas.RoomSchema>;
export type SalesRecord = z.infer<typeof schemas.SalesRecordSchema>;
export type Sales = z.infer<typeof schemas.SaleSchema>;
export type Session = z.infer<typeof schemas.SessionSchema>;
export type Shift = z.infer<typeof schemas.ShiftSchema>;
export type Supplier = z.infer<typeof schemas.SupplierSchema>;
export type Transfer = z.infer<typeof schemas.TransferSchema>;
export type Treatment = z.infer<typeof schemas.TreatmentSchema>;
export type User = z.infer<typeof schemas.UserSchema>;
export type Voucher = z.infer<typeof schemas.VoucherSchema>;
export type Walkin = z.infer<typeof schemas.WalkinSchema>;
export type Wallet = z.infer<typeof schemas.WalletSchema>;
export type PersonalAccessToken = z.infer<typeof schemas.PersonalAccessTokenSchema>;

// Relations and Extended Types
export type CategoryWithRelations = Category & {
  treatment?: Treatment[];
};
export type SalesRecordWithRelations = SalesRecord & {
  treatment?: Sales | null;
};
export type IncomeItemWithRelations = IncomeItem & {
  income?: Income | null;
};
export type WalletWithRelations = Wallet & {
  bank?: Account | null;
};
export type SalesWithRelations = Sales & {
  branch?: SalesRecord[];
};
export type AgentWithRelations = Agent & {
  liability?: Account | null;
};
export type DiscountWithRelations = Discount & {
  account?: Account | null;
};
export type GradeWithRelations = Grade & {
  employee?: Employee | null;
};
export type SessionWithRelations = Session & {
  treatment?: Voucher | null;
};
export type IncomePaymentWithRelations = IncomePayment & {
  income?: Wallet | null;
};
export type RoomWithRelations = Room & {
  branch?: Bed[];
};
export type AttendanceWithRelations = Attendance & {
  employee?: Shift | null;
};
export type UserWithRelations = User & {
  employee?: Employee | null;
};
export type AccountWithRelations = Account & {
  discounts?: Discount[];
};
export type ShiftWithRelations = Shift & {
  attendance?: Attendance[];
};
export type BonusWithRelations = Bonus & {
  treatment?: Treatment | null;
};
export type JournalRecordWithRelations = JournalRecord & {
  journal?: Account | null;
};
export type BedWithRelations = Bed & {
  room?: Session[];
};
export type TransferWithRelations = Transfer & {
  fromWallet?: Journal | null;
};
export type ExpenseWithRelations = Expense & {
  journal?: ExpensePayment[];
};
export type WalkinWithRelations = Walkin & {
  treatment?: Session | null;
};
export type CustomerWithRelations = Customer & {
  liability?: Account | null;
};
export type JournalWithRelations = Journal & {
  records?: Transfer | null;
};
export type CompensationWithRelations = Compensation & {
  employee?: Period | null;
};
export type ExpensePaymentWithRelations = ExpensePayment & {
  expense?: Wallet | null;
};
export type BranchWithRelations = Branch & {
  room?: Sales[];
};
export type EmployeeWithRelations = Employee & {
  user?: Attendance[];
};
export type CartRecordWithRelations = CartRecord & {
  customer?: Room | null;
};
export type VoucherWithRelations = Voucher & {
  treatment?: Session | null;
};
export type ExpenseItemWithRelations = ExpenseItem & {
  expense?: Account | null;
};
export type IncomeWithRelations = Income & {
  journal?: IncomePayment[];
};
export type PeriodWithRelations = Period & {
  expense?: Compensation[];
};
export type TreatmentWithRelations = Treatment & {
  category?: Bonus[];
};