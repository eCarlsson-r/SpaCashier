"use client";

import { EntityForm } from "../shared/EntityForm";
import { EmployeeSchema } from "@/lib/schemas";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../shared/DatePicker";
import { AppSelect } from "../shared/AppSelect";
import { useModel } from "@/hooks/useModel";

import z from "zod";

export function EmployeeForm({ employeeId }: { employeeId?: string }) {
  const employees = useModel("employee", { mode: "select" }).options || [];
  const branches = useModel("branch", { mode: "select" }).options || [];
  const treatments = useModel("treatment", { mode: "select" }).options || [];
  return (
    <EntityForm<z.infer<typeof EmployeeSchema>>
      title={employeeId ? "Edit Employee" : "Add New Employee"}
      schema={EmployeeSchema}
      id={employeeId}
      endpoint="/employee"
      defaultValues={{
        complete_name: "",
        name: "",
        status: "fixed",
        identity_type: "identity",
        identity_number: "",
        place_of_birth: "",
        date_of_birth: "",
        recruiter: null,
        branch_id: "",
        base_salary: 0,
        expertise: "",
        gender: "M",
        phone: "",
        address: "",
        mobile: "",
        email: "",
        bank: "",
        bank_account: "",
        grade: { grade: "" },
      }}
    >
      {(form) => (
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-6 grid grid-cols-12 gap-5">
            <div className="md:col-span-8">
              <FormField
                control={form.control}
                name="complete_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nick Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6 grid grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <AppSelect
                      options={[
                        { value: "freelance", label: "Freelance" },
                        { value: "trainee", label: "Trainee" },
                        { value: "fixed", label: "Fixed" },
                        { value: "resigned", label: "Resigned" },
                        { value: "terminated", label: "Terminated" },
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="base_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recruiter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recruiter</FormLabel>
                  <FormControl>
                    <AppSelect
                      options={employees}
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 grid grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="branch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <AppSelect
                      options={branches}
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade.grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <AppSelect
                      options={[
                        { value: "A", label: "A" },
                        { value: "B", label: "B" },
                        { value: "C", label: "C" },
                        { value: "D", label: "D" },
                        { value: "E", label: "E" },
                      ]}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expertise</FormLabel>
                  <FormControl>
                    <AppSelect
                      multiple={true}
                      options={treatments}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 grid grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="place_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      form={form}
                      name={field.name}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <AppSelect
                      options={[
                        { value: "M", label: "Male" },
                        { value: "F", label: "Female" },
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 grid-cols-2 grid gap-5">
            <FormField
              control={form.control}
              name="identity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity Type</FormLabel>
                  <FormControl>
                    <AppSelect
                      options={[
                        { value: "identity", label: "KTP" },
                        { value: "passport", label: "Passport" },
                      ]}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identity_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-6 grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-6 grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </EntityForm>
  );
}
