export const adminMenuConfig = [
    {
        category: "accounting",
        items: [{ title: "journal", href: "/accounting/journal", description: "journal" }],
    },
    {
        category: "cashflow",
        items: [
            { title: "income", href: "/cashflow/income", description: "income" },
            { title: "expense", href: "/cashflow/expense", description: "expense" },
            { title: "transfer", href: "/cashflow/transfer", description: "transfer" },
        ]
    },
    {
        category: "hrd",
        items: [
            { title: "schedule", href: "/hrd/schedule", description: "schedule" },
            { title: "compensation", href: "/hrd/compensation", description: "compensation" }
        ]
    },
    {
        category: "master",
        items: [
            { title: "account", href: "/master/account", description: "account" },
            { title: "cashflowMaster", href: "/master/cashflow", description: "cashflowMaster" },
            { title: "branch", href: "/master/branch", description: "branch" },
            { title: "category", href: "/master/category", description: "category" },
            { title: "customer", href: "/master/customer", description: "customer" },
            { title: "employee", href: "/master/employee", description: "employee" },
            { title: "treatment", href: "/master/treatment", description: "treatment" },
            { title: "room", href: "/master/room", description: "room" },
            { title: "bonus", href: "/master/bonus", description: "bonus" },
            { title: "discount", href: "/master/discount", description: "discount" },
            { title: "supplier", href: "/master/supplier", description: "supplier" },
            { title: "salesAgent", href: "/master/salesagent", description: "salesAgent" },
            { title: "banner", href: "/master/banner", description: "banner" }
        ],
    },
    {
        category: "operational",
        items: [
            { title: "sessions", href: "/operational/session", description: "sessions" },
            { title: "registerVoucher", href: "/operational/register", description: "registerVoucher" },
            { title: "voucher", href: "/operational/voucher", description: "voucher" },
            { title: "sales", href: "/operational/sales", description: "sales" },
            { title: "activeBedList", href: "/operational/beds", description: "activeBedList" }
        ],
    },
    {
        category: "report",
        items: [
            { title: "attendance", href: "/report/attendance", description: "attendance" },
            { title: "bonus", href: "/report/bonus", description: "bonus" },
            { title: "session", href: "/report/session", description: "session" },
            { title: "salesReport", href: "/report/sales", description: "salesReport" },
            { title: "voucherReport", href: "/report/voucher", description: "voucherReport" },
            { title: "detail", href: "/report/detail", description: "detail" },
            { title: "incomeReport", href: "/report/income", description: "incomeReport" },
            { title: "expenseReport", href: "/report/expense", description: "expenseReport" },
            { title: "ledger", href: "/report/ledger", description: "ledger" },
            { title: "profitAndLoss", href: "/report/profitloss", description: "profitAndLoss" },
            { title: "balanceSheet", href: "/report/balancesheet", description: "balanceSheet" }
        ],
    }
];

export const staffMenuConfig = [
    {
        category: "hrd",
        items: [
            { title: "schedule", href: "/hrd/schedule", description: "schedule" }
        ]
    },
    {
        category: "operational",
        items: [
            { title: "sales", href: "/operational/sales", description: "sales" },
            { title: "sessions", href: "/operational/session", description: "sessions" },
            { title: "activeBedList", href: "/operational/beds", description: "activeBedList" },
        ],
    },
    {
        category: "report",
        items: [
            { title: "attendance", href: "/report/attendance", description: "attendance" },
            { title: "bonus", href: "/report/bonus", description: "bonus" },
            { title: "session", href: "/report/session", description: "session" },
            { title: "salesReport", href: "/report/sales", description: "salesReport" },
            { title: "voucherReport", href: "/report/voucher", description: "voucherReport" },
            { title: "detail", href: "/report/detail", description: "detail" }
        ],
    }
];

export const therapistMenuConfig = [
    {
        category: "operational",
        items: [
            { title: "sessions", href: "/operational/session", description: "sessions" }
        ],
    },
    {
        category: "report",
        items: [
            { title: "attendance", href: "/report/attendance", description: "attendance" },
            { title: "bonus", href: "/report/bonus", description: "bonus" },
            { title: "session", href: "/report/session", description: "session" }
        ],
    }
];