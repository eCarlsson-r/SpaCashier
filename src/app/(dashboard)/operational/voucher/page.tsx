"use client";
import { useForm, FormProvider } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AppSelect } from "@/components/shared/AppSelect";
import { useModel } from "@/hooks/useModel";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { DatePicker } from "@/components/shared/DatePicker";
import { Textarea } from "@/components/ui/textarea";

export default function SessionForm() {
  const methods = useForm({
    defaultValues: {
      id: "",
      customer_id: "",
      treatment_id: "",
      amount: "",
      register_date: "",
      sales_info: "",
      usage_info: "",
    },
  });

  const { control, setValue } = methods;

  const customers = useModel("customer", { mode: "select" }).options;
  const treatments = useModel("treatment", { mode: "select" }).options;

  const handleVoucherLookup = async (code: string) => {
    if (code.length < 3) return; // Don't trigger for very short inputs

    try {
      // Replace with your actual API endpoint
      const response = await api.get(`/voucher/${code}`);
      const voucher = response.data;

      if (voucher) {
        // 1. Auto-fill the linked data
        setValue("id", voucher.id);
        setValue("customer_id", voucher.customer_id.toString());
        setValue("treatment_id", voucher.treatment_id.toString());
        setValue("amount", voucher.amount);
        setValue("register_date", voucher.register_date);
        setValue("sales_info", voucher.sales_info);
        setValue("usage_info", voucher.usage_info);

        toast.success(`Voucher verified for ${voucher.customer_name}`);
      }
    } catch (error) {
      // Optional: clear fields if voucher is invalid
      toast.error("Voucher not found: " + error?.toString());
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Voucher Lookup</h1>
      </div>

      <form className="space-y-3 bg-white border rounded-sm p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-6">
            <FormField
              control={control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Scan atau ketik kode voucher..."
                      // Trigger lookup when user clicks away or scanner finishes
                      onBlur={(e) => handleVoucherLookup(e.target.value)}
                      // Optional: Trigger on every change if using a high-speed scanner
                      onChange={(e) => {
                        field.onChange(e); // Keep hook-form updated
                        if (e.target.value.length > 8)
                          handleVoucherLookup(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <AppSelect
                    {...field}
                    placeholder="Silahkan pilih customer."
                    options={customers}
                    onValueChange={(val) => setValue("customer_id", val)}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="treatment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment</FormLabel>
                  <AppSelect
                    {...field}
                    options={treatments}
                    onValueChange={(val) => setValue("treatment_id", val)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-6">
            <FormField
              control={control}
              name="register_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      form={methods}
                      name={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="sales_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher Sales</FormLabel>
                  <Textarea {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="usage_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher Usage</FormLabel>
                  <Textarea {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
