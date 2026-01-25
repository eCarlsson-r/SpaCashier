import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  name: z.string(),
  type: z.string(),
  category: z.string().optional(),
});

export const AgentSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  discount: z.coerce.number().optional(),
  commission: z.coerce.number().optional(),
  liability_account: z.coerce.number().nullable().optional(),
});

export const AttendanceSchema = z.object({
  id: z.number().nullable(),
  employee_id: z.number(),
  date: z.string(),
  shift_id: z.string().default(''),
  clock_in: z.string().nullable(),
  clock_out: z.string().nullable(),
});

export const BankSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const BannerSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  image: z.any().optional(),
  introduction: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  action: z.string().optional(),
  action_page: z.string().optional(),
  intro_key: z.string().optional(),
  title_key: z.string().optional(),
  subtitle_key: z.string().optional(),
  description_key: z.string().optional(),
  action_key: z.string().optional(),
});

export const BedSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  room_id: z.number(),
  session: z.object({
    id: z.string(),
    status: z.string(),
    start: z.string(),
    end: z.string(),
    employee_id: z.number(),
    employee: z.object({
      name: z.string(),
    }),
    treatment: z.object({
      name: z.string(),
      duration: z.number()
    })
  })
});

export const BonuSchema = z.object({
  id: z.number().nullable(),
  treatment_id: z.string(),
  grade: z.string(),
  gross_bonus: z.number(),
  trainer_deduction: z.number().default(0),
  savings_deduction: z.number().default(0),
});

export const BranchSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  phone: z.string(),
  description: z.string().optional(),
  cash_account: z.string().optional(),
  walkin_account: z.string().optional(),
  voucher_purchase_account: z.string().optional(),
  voucher_usage_account: z.string().optional(),
  branch_img: z.any().optional(),
});

export const CartRecordSchema = z.object({
  id: z.any(),
  customer_id: z.number(),
  session_type: z.string(),
  session_date: z.string(),
  session_time: z.string(),
  employee_id: z.number(),
  treatment_id: z.string(),
  room_id: z.string(),
  quantity: z.number().default(0),
  voucher_normal_quantity: z.number().default(0),
  voucher_buy_quantity: z.number().default(0),
  price: z.number(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  i18n: z.string().optional(),
  header_img: z.any().optional(),
  body_img1: z.any().optional(),
  body_img2: z.any().optional(),
  body_img3: z.any().optional(),
});

export const CompensationSchema = z.object({
  id: z.number().nullable(),
  employee_id: z.number(),
  period_id: z.number(),
  base_salary: z.number(),
  therapist_bonus: z.number(),
  recruit_bonus: z.number(),
  addition: z.number(),
  addition_description: z.string().nullable(),
  deduction: z.number(),
  deduction_description: z.string().nullable(),
  total: z.number(),
});

export const CustomerSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  name: z.string(),
  gender: z.string().default("M"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  place_of_birth: z.string().optional(),
  date_of_birth: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  liability_account: z.coerce.number().nullable().optional(),
});

export const DiscountSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string().default("POTONGAN"),
  percent: z.coerce.number().default(0),
  amount: z.coerce.number().default(0),
  quantity: z.coerce.number().default(0),
  expiry_date: z.string(),
  account_id: z.coerce.number().nullable().optional(),
});

export const EmployeeSchema = z.object({
  id: z.number().nullable(),
  user_id: z.number().default(0),
  complete_name: z.string(),
  name: z.string(),
  status: z.string(),
  identity_type: z.string().optional(),
  identity_number: z.string().optional(),
  place_of_birth: z.string().optional(),
  date_of_birth: z.string().optional(),
  certified: z.number().default(0),
  vaccine1: z.boolean().default(false),
  vaccine2: z.boolean().default(false),
  recruiter: z.number().nullable().optional(),
  branch_id: z.string(),
  base_salary: z.coerce.number().default(0),
  expertise: z.string().optional(),
  gender: z.string().default("M"),
  phone: z.string().optional(),
  address: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  absent_deduction: z.coerce.number().default(50000),
  meal_fee: z.coerce.number().default(0),
  late_deduction: z.coerce.number().default(20000),
  bank_account: z.string().default(''),
  bank: z.string().default(''),
  grade: z.object({
    grade: z.string().optional(),
  }).optional(),
});

export const ExpenseItemSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  expense_id: z.coerce.number().optional(),
  account_id: z.string(),
  amount: z.coerce.number().default(0),
  description: z.string().default(''),
  type: z.string().default('biaya'),
});

export const ExpensePaymentSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  expense_id: z.coerce.number().optional(),
  type: z.string().default('cash'),
  wallet_id: z.string(),
  amount: z.coerce.number().default(0),
  description: z.string().default(''),
});

export const ExpenseSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  journal_reference: z.string().optional(),
  date: z.string(),
  partner_type: z.string(),
  partner: z.string(),
  description: z.string().default(''),
  items: z.array(ExpenseItemSchema).default([]),
  payments: z.array(ExpensePaymentSchema).default([]),
});

export const GradeSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  employee_id: z.coerce.number(),
  grade: z.string(),
  start_date: z.string(),
  end_date: z.string().optional(),
});

export const IncomeItemSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  income_id: z.coerce.number().optional(),
  type: z.string().default('biaya'),
  transaction: z.string().optional(),
  account_id: z.string().optional(),
  amount: z.coerce.number().default(0),
  description: z.string().default(''),
});

export const IncomePaymentSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  income_id: z.coerce.number().optional(),
  type: z.string().default('cash'),
  wallet_id: z.string(),
  amount: z.coerce.number().default(0),
  description: z.string().default(''),
});

export const IncomeSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  journal_reference: z.string().optional(),
  date: z.string(),
  partner_type: z.string(),
  partner: z.any().optional(),
  description: z.string().default(''),
  items: z.array(IncomeItemSchema).default([]),
  payments: z.array(IncomePaymentSchema).default([]),
});

export const JournalRecordSchema = z.object({
  id: z.number().nullable(),
  journal_id: z.number(),
  account_id: z.string().nullable(),
  debit: z.number().default(0),
  credit: z.number().default(0),
  description: z.string(),
});

export const JournalSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  reference: z.string(),
  date: z.string(),
  description: z.string(),
  records: z.array(z.object({
    account_id: z.string(),
    debit: z.coerce.number().default(0),
    credit: z.coerce.number().default(0),
    description: z.string().optional(),
  })),
  temp_account_id: z.string().optional(),
  temp_debit: z.coerce.number().optional(),
  temp_credit: z.coerce.number().optional(),
  temp_description: z.string().optional(),
});

export const PeriodSchema = z.object({
  id: z.number().nullable(),
  start: z.string(),
  end: z.string(),
  expense_id: z.number().nullable(),
});

export const RoomSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  name: z.string(),
  description: z.string().optional(),
  image: z.any().optional(),
  branch_id: z.string(),
  bed: z.array(z.object({
    id: z.coerce.number().nullable().optional(),
    name: z.string(),
    description: z.string().optional(),
  })).optional().default([]),
});

export const SalesRecordSchema = z.object({
  id: z.number().nullable(),
  sales_id: z.number(),
  treatment_id: z.string(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number(),
  redeem_type: z.string(),
  voucher_start: z.string().default(''),
  voucher_end: z.string().default(''),
  total_price: z.number(),
  description: z.string(),
});

export const SaleSchema = z.object({
  id: z.number().nullable(),
  branch_id: z.string(),
  customer_id: z.number(),
  date: z.string(),
  time: z.string(),
  subtotal: z.number(),
  discount: z.number().default(0),
  rounding: z.number().default(0),
  total: z.number(),
  income_id: z.number().nullable(),
  employee_id: z.number(),
});

export const ShiftSchema = z.object({
  id: z.string().default(''),
  name: z.string().default(''),
  start_time: z.string(),
  end_time: z.string(),
});

export const SupplierSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  name: z.string(),
  contact: z.string(),
  bank: z.string().optional(),
  bank_account: z.string().optional(),
  address: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
});

export const TransferSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  journal_reference: z.string().optional(),
  date: z.string(),
  from_wallet_id: z.string(),
  to_wallet_id: z.string(),
  amount: z.coerce.number().default(0),
  description: z.string(),
});

export const TreatmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  price: z.coerce.number(),
  duration: z.coerce.number(),
  category_id: z.string(),
  room: z.string().default('["VIPSG","VIPCP","STDRM"]'),
  applicable_days: z.any(),
  applicable_time_end: z.string().optional(),
  applicable_time_start: z.string().optional(),
  minimum_quantity: z.coerce.number().default(1),
  voucher_normal_quantity: z.coerce.number().optional(),
  voucher_purchase_quantity: z.coerce.number().optional(),
  body_img: z.any().optional(),
  icon_img: z.any().optional(),
});

export const UserSchema = z.object({
  id: z.number().nullable(),
  username: z.string(),
  password: z.string(),
  type: z.string(),
});

export const VoucherSchema = z.object({
  id: z.string(),
  treatment_id: z.string(),
  register_date: z.string(),
  register_time: z.string(),
  customer_id: z.number().nullable(),
  amount: z.number().nullable(),
  purchase_date: z.string().nullable(),
  sales_id: z.number().nullable(),
  session_id: z.number().nullable(),
});

export const WalkinSchema = z.object({
  id: z.number().nullable(),
  treatment_id: z.string(),
  customer_id: z.number(),
  sales_id: z.number(),
  session_id: z.number(),
});

export const SessionSchema = z.object({
  id: z.coerce.number().nullable().optional(),
  order_time: z.string().optional(),
  reserved_at: z.string().optional(),
  bed_id: z.string(),
  room_id: z.string().optional(),
  customer_id: z.string(),
  payment: z.string().default('walk-in'),
  walkin_id: z.string().optional(),
  voucher_id: z.string().optional(),
  date: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  status: z.string().default('draft'),
  treatment_id: z.string(),
  employee_id: z.string().optional(),
  treatment: TreatmentSchema.optional(),
});

export const WalletSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  bank_account_number: z.string().nullable(),
  bank_id: z.string().nullable(),
  account_id: z.number(),
  edc_machine: z.boolean().default(false),
});

export const PersonalAccessTokenSchema = z.object({
  id: z.number().nullable(),
  tokenable: z.any(),
  name: z.string(),
  token: z.string(),
  abilities: z.string().nullable(),
  last_used_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});