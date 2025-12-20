import { useCustomers, useTreatments, useDiscounts, useWallets, useBanks } from "./useMaster";
import { useBranch } from "./useBranch";

export function useMasterOptions() {
    const { selectedBranchId } = useBranch();

    // Combine multiple queries into one hook
    const customers = useCustomers();
    const treatments = useTreatments();
    const discounts = useDiscounts();
    const wallets = useWallets();
    const banks = useBanks();

    return {
        options: {
            customers: customers.data || [],
            treatments: treatments.data || [],
            discounts: discounts.data || [],
            wallets: wallets.data || [],
            banks: banks.data || [],
        },
        isLoading: customers.isLoading || treatments.isLoading || discounts.isLoading || wallets.isLoading || banks.isLoading,
    };
}