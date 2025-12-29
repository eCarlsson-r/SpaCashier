export const adminMenuConfig = [
    {
        category: "Accounting",
        items: [{ title: "Journal", href: "/accounting/journal", description: "Manage journal data" }],
    },
    {
        category: "Cashflow",
        items: [
            { title: "Income", href: "/cashflow/income", description: "Manage income data" },
            { title: "Expense", href: "/cashflow/expense", description: "Manage expense data" },
            { title: "Transfer", href: "/cashflow/transfer", description: "Manage transfer data" },
        ]
    },
    {
        category: "HRD",
        items: [
            { title: "Schedule", href: "/hrd/schedule", description: "Manage schedule data" },
            { title: "Compensation", href: "/hrd/compensation", description: "Manage compensation data" }
        ]
    },
    {
        category: "Master",
        items: [
            { title: "Account", href: "/master/account", description: "Manage account data" },
            { title: "Cashflow", href: "/master/cashflow", description: "Manage cashflow data" },
            { title: "Branch", href: "/master/branch", description: "Manage branch data" },
            { title: "Category", href: "/master/category", description: "Manage category data" },
            { title: "Customer", href: "/master/customer", description: "Manage customer data" },
            { title: "Employee", href: "/master/employee", description: "Manage employee data" },
            { title: "Treatment", href: "/master/treatment", description: "Manage treatment data" },
            { title: "Room", href: "/master/room", description: "Manage room data" },
            { title: "Bonus", href: "/master/bonus", description: "Manage bonus data" },
            { title: "Discount", href: "/master/discount", description: "Manage discount data" },
            { title: "Supplier", href: "/master/supplier", description: "Manage supplier data" },
            { title: "Sales Agent", href: "/master/salesagent", description: "Manage sales agent data" },
            { title: "Banner", href: "/master/banner", description: "Manage banner data" }
        ],
    },
    {
        category: "Operational",
        items: [
            { title: "Sessions", href: "/operational/session", description: "Manage sessions here" },
            { title: "Register Voucher", href: "/operational/register", description: "Generate new voucher for sale" },
            { title: "Voucher", href: "/operational/voucher", description: "Check the status of the voucher" },
            { title: "Sales", href: "/operational/sales", description: "The sales process starts here" },
            { title: "Active Bed List", href: "/operational/beds", description: "View empty beds in every room" }
        ],
    },
    {
        category: "Report",
        items: [
            { title: "Attendance", href: "/report/attendance", description: "View attendance data" },
            { title: "Bonus", href: "/report/bonus", description: "View bonus data" },
            { title: "Session", href: "/report/session", description: "View session data" },
            { title: "Sales", href: "/report/sales", description: "View sales data" },
            { title: "Income", href: "/report/income", description: "View income data" },
            { title: "Expense", href: "/report/expense", description: "View expense data" },
        ],
    }
];

export const staffMenuConfig = [
    {
        category: "HRD",
        items: [
            { title: "Schedule", href: "/hrd/schedule", description: "Manage schedule data" }
        ]
    },
    {
        category: "Operational",
        items: [
            { title: "Sales", href: "/operational/sales", description: "Manage sales data" },
            { title: "Sessions", href: "/operational/session", description: "Manage session data" },
            { title: "Active Bed List", href: "/operational/beds", description: "Manage active bed list data" },
        ],
    },
    {
        category: "Report",
        items: [
            { title: "Attendance", href: "/report/attendance", description: "View attendance data" },
            { title: "Bonus", href: "/report/bonus", description: "View bonus data" },
            { title: "Session", href: "/report/session", description: "View session data" },
            { title: "Sales", href: "/report/sales", description: "View sales data" }
        ],
    }
];

export const therapistMenuConfig = [
    {
        category: "Operational",
        permission: "view_operational",
        items: [
            { title: "Sessions", href: "/operational/session", description: "Manage session data" }
        ],
    },
    {
        category: "Report",
        items: [
            { title: "Attendance", href: "/report/attendance", description: "View attendance data" },
            { title: "Bonus", href: "/report/bonus", description: "View bonus data" },
            { title: "Session", href: "/report/session", description: "View session data" }
        ],
    }
];