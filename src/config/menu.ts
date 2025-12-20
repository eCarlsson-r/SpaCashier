export const adminMenuConfig = [
    {
        category: "Accounting",
        permission: "view_accounting",
        items: [{ title: "Journal", href: "/accounting/journal", permission: "view_accounting" }],
    },
    {
        category: "Master",
        permission: "manage_master",
        items: [
            { title: "Branch", href: "/master/branches", permission: "manage_master" },
            { title: "Employee", href: "/master/employees", permission: "manage_master" },
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