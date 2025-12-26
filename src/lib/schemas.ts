import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
});

export const AgentSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  mobile: z.string().nullable(),
  discount: z.number().nullable(),
  commission: z.number().nullable(),
  liability_account: z.number().nullable(),
});

export const AttendanceSchema = z.object({
  id: z.number(),
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
  id: z.number(),
  image: z.string(),
  intro_key: z.string(),
  title_key: z.string(),
  subtitle_key: z.string(),
  description_key: z.string(),
  action_key: z.string(),
  action_page: z.string(),
});

export const BedSchema = z.object({
  id: z.number(),
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
  id: z.number(),
  treatment_id: z.string(),
  grade: z.string(),
  gross_bonus: z.number(),
  trainer_deduction: z.number().default(0),
  savings_deduction: z.number().default(0),
});

export const BranchSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  phone: z.string(),
  description: z.string().nullable(),
  cash_account: z.string().nullable(),
  walkin_account: z.string().nullable(),
  voucher_purchase_account: z.string().nullable(),
  voucher_usage_account: z.string().nullable(),
  branch_img: z.string(),
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
  id: z.string(),
  name: z.string(),
  description: z.string(),
  i18n: z.string().nullable(),
  header_img: z.string().nullable(),
  body_img1: z.string().nullable(),
  body_img2: z.string().nullable(),
  body_img3: z.string().nullable(),
});

export const CompensationSchema = z.object({
  id: z.number(),
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
  id: z.number(),
  name: z.string(),
  gender: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  place_of_birth: z.string(),
  date_of_birth: z.string().nullable(),
  mobile: z.string(),
  email: z.string(),
  liability_account: z.number(),
});

export const DiscountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  percent: z.number(),
  amount: z.number(),
  quantity: z.number(),
  expiry_date: z.string(),
  account_id: z.number(),
});

export const EmployeeSchema = z.object({
  id: z.number(),
  user_id: z.number().default(0),
  complete_name: z.string(),
  name: z.string(),
  status: z.string(),
  identity_type: z.string(),
  identity_number: z.string(),
  place_of_birth: z.string(),
  date_of_birth: z.string(),
  certified: z.number().default(0),
  vaccine1: z.boolean().default(false),
  vaccine2: z.boolean().default(false),
  recruiter: z.number().nullable(),
  branch_id: z.string(),
  base_salary: z.number(),
  expertise: z.string(),
  gender: z.string(),
  phone: z.string(),
  address: z.string(),
  mobile: z.string(),
  email: z.string(),
  absent_deduction: z.number().default(50000),
  meal_fee: z.number().default(0),
  late_deduction: z.number().default(20000),
  bank_account: z.string().default(''),
  bank: z.string().default(''),
});

export const ExpenseItemSchema = z.object({
  id: z.number(),
  expense_id: z.number(),
  account_id: z.number(),
  amount: z.number(),
  description: z.string(),
});

export const ExpensePaymentSchema = z.object({
  id: z.number(),
  expense_id: z.number(),
  type: z.string(),
  wallet_id: z.number(),
  amount: z.number(),
  description: z.string(),
});

export const ExpenseSchema = z.object({
  id: z.number(),
  journal_reference: z.string(),
  date: z.string(),
  partner_type: z.string(),
  partner: z.string(),
  description: z.string().default(''),
});

export const GradeSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  grade: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable(),
});

export const IncomeItemSchema = z.object({
  id: z.number(),
  income_id: z.number(),
  type: z.string(),
  transaction: z.string(),
  amount: z.number(),
  description: z.string(),
});

export const IncomePaymentSchema = z.object({
  id: z.number(),
  income_id: z.number(),
  type: z.string(),
  wallet_id: z.number(),
  amount: z.number(),
  description: z.string(),
});

export const IncomeSchema = z.object({
  id: z.number(),
  journal_reference: z.string(),
  date: z.string(),
  partner_type: z.string(),
  partner: z.number(),
  description: z.string(),
});

export const JournalRecordSchema = z.object({
  id: z.number(),
  journal_id: z.number(),
  account_id: z.string().nullable(),
  debit: z.number().default(0),
  credit: z.number().default(0),
  description: z.string(),
});

export const JournalSchema = z.object({
  id: z.number(),
  reference: z.string(),
  date: z.string(),
  description: z.string(),
  records: z.array(z.object({
    account_id: z.string(),
    debit: z.number().default(0),
    credit: z.number().default(0),
    description: z.string().nullable(),
  }))
});

export const PeriodSchema = z.object({
  id: z.number(),
  start: z.string(),
  end: z.string(),
  expense_id: z.number().nullable(),
});

export const RoomSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  branch_id: z.string(),
  bed: z.array(z.object({
    name: z.string(),
    description: z.string().nullable(),
  })),
});

export const SalesRecordSchema = z.object({
  id: z.number(),
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
  id: z.number(),
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

export const SessionSchema = z.object({
  id: z.number(),
  order_time: z.string().nullable(),
  reserved_time: z.any().nullable(),
  bed_id: z.number(),
  customer_id: z.number(),
  payment: z.string(),
  date: z.string(),
  start: z.string().nullable(),
  end: z.string().nullable(),
  status: z.string(),
  treatment_id: z.string(),
  employee_id: z.number().nullable(),
});

export const ShiftSchema = z.object({
  id: z.string().default(''),
  name: z.string().default(''),
  start_time: z.string(),
  end_time: z.string(),
});

export const SupplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  contact: z.string(),
  bank: z.string().nullable(),
  bank_account: z.string().nullable(),
  address: z.string().nullable(),
  mobile: z.string().nullable(),
  email: z.string().nullable(),
});

export const TransferSchema = z.object({
  id: z.number(),
  journal_reference: z.string(),
  date: z.string(),
  from_wallet_id: z.string(),
  to_wallet_id: z.string(),
  amount: z.number(),
  description: z.string(),
});

export const TreatmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  price: z.number(),
  duration: z.number(),
  category_id: z.string(),
  room: z.string().default('["VIPSG","VIPCP","STDRM"]'),
  applicable_days: z.string(),
  applicable_time_end: z.string(),
  applicable_time_start: z.string(),
  minimum_quantity: z.number(),
  voucher_normal_quantity: z.number().nullable(),
  voucher_purchase_quantity: z.number().nullable(),
  body_img: z.string(),
  icon_img: z.string(),
});

export const UserSchema = z.object({
  id: z.number(),
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
  id: z.number(),
  treatment_id: z.string(),
  customer_id: z.number(),
  sales_id: z.number(),
  session_id: z.number(),
});

export const WalletSchema = z.object({
  id: z.number(),
  name: z.string(),
  bank_account_number: z.string().nullable(),
  bank_id: z.string().nullable(),
  account_id: z.number(),
  edc_machine: z.boolean().default(false),
});

export const PersonalAccessTokenSchema = z.object({
  id: z.number(),
  tokenable: z.any(),
  name: z.string(),
  token: z.string(),
  abilities: z.string().nullable(),
  last_used_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});