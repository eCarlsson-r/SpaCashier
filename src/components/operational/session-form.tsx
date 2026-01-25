"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AppSelect } from "@/components/shared/AppSelect";
import { useModel } from "@/hooks/useModel";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { EntityForm } from "../shared/EntityForm";
import { SessionSchema } from "@/lib/schemas";
import z from "zod";

type SessionFormValues = z.infer<typeof SessionSchema>;

function SessionFormContent({
  form,
}: {
  form: UseFormReturn<SessionFormValues>;
}) {
  const { control, watch, setValue } = form;
  const paymentType = watch("payment");

  const { data: walkins, options: walkinOptions } = useModel("walkin", {
    mode: "select",
  });
  const { data: rooms } = useModel("room", {
    mode: "select",
    params: { show: "empty" },
  });

  const customers = useModel("customer", { mode: "select" }).options;
  const treatments = useModel("treatment", { mode: "select" }).options;
  const employees = useModel("employee", { mode: "select" }).options;

  const handleWalkinChange = (walkinId: string) => {
    setValue("walkin_id", walkinId);
    const selectedWalkin = walkins?.find((w) => w.id?.toString() === walkinId);
    if (selectedWalkin) {
      setValue("customer_id", selectedWalkin.customer_id.toString());
      setValue("treatment_id", selectedWalkin.treatment_id.toString());
    }
  };

  const handleVoucherLookup = async (code: string) => {
    if (code.length < 3) return;
    try {
      const response = await api.get(`/voucher/${code}`);
      const voucher = response.data;
      if (voucher) {
        setValue("customer_id", voucher.customer_id.toString());
        setValue("treatment_id", voucher.treatment_id.toString());
        toast.success(`Voucher verified for ${voucher.customer_name}`);
      }
    } catch (error) {
      console.error("Voucher not found : " + error?.toString());
    }
  };

  const selectedRoomId = watch("room_id");
  const selectedRoom = rooms?.find((r) => r.id?.toString() === selectedRoomId);
  const bedOptions =
    selectedRoom?.bed?.map((bed) => ({
      label: bed.name,
      value: bed.id?.toString() || "",
    })) || [];

  return (
    <div className="space-y-3 bg-white border rounded-sm p-4 shadow-sm">
      <div className="grid grid-cols-12 items-center gap-4">
        <label className="col-span-2 text-sm text-gray-600">Reserved</label>
        <div className="col-span-10">
          <FormField
            control={control}
            name="reserved_at"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <label className="col-span-2 text-sm text-gray-600">Pembayaran</label>
        <div className="col-span-4">
          <FormField
            control={control}
            name="payment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AppSelect
                    options={[
                      { label: "Voucher", value: "voucher" },
                      { label: "Walk-in", value: "walk-in" },
                    ]}
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("walkin_id", "");
                      setValue("voucher_id", "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-6">
          {paymentType === "walk-in" ? (
            <FormField
              control={control}
              name="walkin_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AppSelect
                      placeholder="Silahkan pilih perawatan walk-in."
                      options={walkinOptions}
                      value={field.value || ""}
                      onValueChange={handleWalkinChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={control}
              name="voucher_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Scan atau ketik kode voucher..."
                      onBlur={(e) => handleVoucherLookup(e.target.value)}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value.length > 8)
                          handleVoucherLookup(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <label className="col-span-2 text-sm text-gray-600">Customer</label>
        <div className="col-span-10">
          <FormField
            control={control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AppSelect
                    placeholder="Silahkan pilih customer."
                    options={customers}
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <label className="col-span-2 text-sm text-gray-600">Treatment</label>
        <div className="col-span-10">
          <FormField
            control={control}
            name="treatment_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AppSelect
                    options={treatments}
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <label className="col-span-2 text-sm text-gray-600">Bed</label>
        <div className="col-span-4">
          <FormField
            control={control}
            name="room_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AppSelect
                    placeholder="Please select a room"
                    options={
                      rooms?.map((r) => ({
                        label: r.name,
                        value: r.id?.toString() || "",
                      })) || []
                    }
                    value={field.value || ""}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("bed_id", "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-6">
          <FormField
            control={control}
            name="bed_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AppSelect
                    placeholder={
                      selectedRoomId
                        ? "Select a bed"
                        : "Please select a room first"
                    }
                    options={bedOptions}
                    disabled={!selectedRoomId || bedOptions.length === 0}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <label className="col-span-2 text-sm text-gray-600">Therapist</label>
        <div className="col-span-10">
          <FormField
            control={control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AppSelect
                    options={employees}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <label className="col-span-2 text-sm text-gray-600">Mulai</label>
        <div className="col-span-10">
          <FormField
            control={control}
            name="start"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function SessionForm({ sessionId }: { sessionId?: string }) {
  return (
    <EntityForm<SessionFormValues>
      title={sessionId ? "Edit Session" : "Create New Session"}
      schema={SessionSchema}
      id={sessionId}
      endpoint="/session"
      defaultValues={{
        reserved_at: "",
        payment: "walk-in",
        walkin_id: "",
        voucher_id: "",
        customer_id: "",
        treatment_id: "",
        room_id: "",
        bed_id: "",
        employee_id: "",
        start: "",
        status: "waiting",
      }}
    >
      {(form) => <SessionFormContent form={form} />}
    </EntityForm>
  );
}
