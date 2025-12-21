import { permission } from "process";

export const adminMenuConfig = [
    {
        category: "Accounting",
        permission: "view_accounting",
        items: [{ title: "Journal", href: "/accounting/journal", permission: "view_accounting" }],
    },
    {
        category: "Cashflow",
        permission: "view_cashflow",
        items: [
            { title: "Income", href: "/cashflow/income", permission: "view_cashflow" },
            { title: "Expense", href: "/cashflow/expense", permission: "view_cashflow" },
            { title: "Transfer", href: "/cashflow/transfer", permission: "view_cashflow" },
        ]
    },
    {
        category: "Master",
        permission: "manage_master",
        items: [
            { title: "Account", href: "/master/account", permission: "manage_master" },
            { title: "Cashflow", href: "/master/cashflow", permission: "manage_master" },
            { title: "Branch", href: "/master/branch", permission: "manage_master" },
            { title: "Category", href: "/master/category", permission: "manage_master" },
            { title: "Customer", href: "/master/customer", permission: "manage_master" },
            { title: "Employee", href: "/master/employee", permission: "manage_master" },
            { title: "Treatment", href: "/master/treatment", permission: "manage_master" },
            { title: "Room", href: "/master/room", permission: "manage_master" },
            { title: "Bonus", href: "/master/bonus", permission: "manage_master" },
            { title: "Discount", href: "/master/discount", permission: "manage_master" },
            { title: "Supplier", href: "/master/supplier", permission: "manage_master" },
            { title: "Sales Agent", href: "/master/salesagent", permission: "manage_master" },
            { title: "Banner", href: "/master/banner", permission: "manage_master" }
        ],
    },
    {
        category: "Operational",
        permission: "view_operational",
        items: [
            { title: "Sales", href: "/ops/sales", permission: "manage_sales" },
            { title: "Register Voucher", href: "/ops/vouchers", permission: "manage_vouchers" },
            { title: "Sessions", href: "/ops/sessions", permission: "view_sessions" },
            { title: "Active Bed List", href: "/ops/beds", permission: "view_beds" },
        ],
    },
];

export const staffMenuConfig = [
    {
        category: "Operational",
        permission: "view_operational",
        items: [
            { title: "Sales", href: "/ops/sales", permission: "manage_sales" },
            { title: "Register Voucher", href: "/ops/vouchers", permission: "manage_vouchers" },
            { title: "Sessions", href: "/ops/sessions", permission: "view_sessions" },
            { title: "Active Bed List", href: "/ops/beds", permission: "view_beds" },
        ],
    },
];

export const therapistMenuConfig = [
    {
        category: "Operational",
        permission: "view_operational",
        items: [
            { title: "Sales", href: "/ops/sales", permission: "manage_sales" },
            { title: "Register Voucher", href: "/ops/vouchers", permission: "manage_vouchers" },
            { title: "Sessions", href: "/ops/sessions", permission: "view_sessions" },
            { title: "Active Bed List", href: "/ops/beds", permission: "view_beds" },
        ],
    },
];