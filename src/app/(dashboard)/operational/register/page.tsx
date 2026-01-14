"use client";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/ui/button";
import { FilePlus, FileText, Save } from "lucide-react";
import { AppSelect } from "@/components/shared/AppSelect";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useModel } from "@/hooks/useModel";
import api from "@/lib/api";
import { useEffect } from "react";
import React from "react";
import { toast } from "sonner"; // For nice notifications
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

export default function RegisterVoucherForm() {
  const form = useForm({
    defaultValues: {
      quantity: 1,
      treatment_id: "",
      prefix: "",
      start: "",
      end: "",
    }
  });

  const treatmentOptions = useModel("treatment", { mode: "select" }).options;

  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  const handleNew = () => {
    form.reset(); // Clears all inputs
    setPdfUrl(null); // Clears the preview area
  };

  const generateVoucherPdf = (vouchers: {id: string, register_date: string}[], treatmentName: string) => {
    // 'p' = portrait, 'cm' = centimeters (matches your original)
    const doc = new jsPDF("p", "cm");

    vouchers.forEach((voucher: {id: string, register_date: string}, idx: number) => {
      const date = new Date(voucher.register_date) || new Date();
      const formattedDate = `${date.getDate()}/${("00" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;

      // 1. Create a hidden canvas for barcode generation
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, voucher.id, {
        format: "CODE128",
        margin: 0,
        width: 2.6,
        height: 50,
        displayValue: false
      });

      // 2. Convert canvas to Image Data
      const jpegUrl = canvas.toDataURL("image/jpeg");
      const imgProps = doc.getImageProperties(jpegUrl);

      // 3. Add Content using your original coordinates
      doc.addImage(jpegUrl, 'JPG', 0.4, 1.8, imgProps.width, imgProps.height);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(voucher.id, 0.4, 3.8);

      doc.setFont("helvetica", "normal");
      doc.text(formattedDate, 5.0, 3.8);
      doc.text(treatmentName, 0.4, 4.3);

      // 4. Add new page if not the last item
      if (idx < vouchers.length - 1) {
        doc.addPage();
      }
    });
    // 5. Output to the iframe source
    return doc.output('blob');
  };

  const onRegister = (data: {quantity: number, treatment_id: string}) => {
    // Send request to register vouchers
    api.post('/voucher', data).then(function (response) {
      // Get treatment label from your select options
      const treatmentLabel = treatmentOptions.find((t: {value: string, label: string}) => t.value === data.treatment_id)?.label;
      // Generate PDF string
      const pdfDataUri = generateVoucherPdf(response.data, treatmentLabel);

      // Update state to show in the iframe
      setPdfUrl(URL.createObjectURL(pdfDataUri));
      toast.success("Vouchers registered and PDF generated!");
    }).catch(function (error) {
      toast.error("Registration failed: "+ error);
    });
  };

  const qty = form.watch("quantity");
  const treatment = form.watch("treatment_id");

  useEffect(() => {
    if (qty && treatment) {
      api.get(`/voucher?treatment=${treatment}`)
        .then(res => {
          form.setValue("prefix", treatment);
          const voucherCode = ("id" in res.data) ? parseInt(res.data.id.split(treatment)[1]) : 0;
          form.setValue("start", treatment + (("0000000000" + (voucherCode + 1)).slice(-6)));
          form.setValue("end", treatment + (("0000000000" + (voucherCode + qty)).slice(-6)));
        }).catch(e => {
          form.setValue("prefix", treatment);
          form.setValue("start", treatment + (("00000000001").slice(-6)));
          form.setValue("end", treatment + (("0000000000" + qty).slice(-6)));
        });
    }
  }, [qty, treatment, form]);

  useEffect(() => {
    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <FormProvider {...form}>
      <div className="bg-white p-4 border rounded-sm shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-medium text-gray-800">Register Voucher</h2>
          <div className="flex gap-2">
            <Button
              onClick={form.handleSubmit(onRegister)}
              className="bg-sky-600 hover:bg-sky-700 flex items-center gap-2 h-9 px-4"
            >
              <Save size={14} /> Register
            </Button>
            <Button
              onClick={handleNew}
              className="bg-gray-400 hover:bg-gray-700 flex items-center gap-2 h-9 px-4"
            >
              <FilePlus size={14} /> New
            </Button>
          </div>
        </div>

        {/* Top Input Row */}
        <div className="grid grid-cols-10 gap-4 mb-4">
          <div className="col-span-1">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-3">
            <FormField
              control={form.control}
              name="treatment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment</FormLabel>
                  <FormControl>
                    <AppSelect
                      options={treatmentOptions}
                      value={field.value} onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="prefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prefix</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4 flex items-end gap-2">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Numbers</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <span className="mb-2 text-gray-500 bg-gray-100 px-3 py-2 border rounded">until</span>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Large Results/Display Area */}
        <div className="border h-[500px] w-full bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              frameBorder="0"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <FileText size={48} strokeWidth={1} />
              <p className="mt-2 text-sm italic">PDF preview will appear here after registration.</p>
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}