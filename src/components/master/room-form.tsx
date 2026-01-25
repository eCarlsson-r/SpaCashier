"use client";

import { EntityForm } from "../shared/EntityForm";
import { RoomSchema } from "@/lib/schemas";
import { Input } from "../ui/input";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import z from "zod";
import { useModel } from "@/hooks/useModel";
import { AppSelect } from "../shared/AppSelect";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

type RoomFormValues = z.infer<typeof RoomSchema>;

function RoomFormContent({ form }: { form: UseFormReturn<RoomFormValues> }) {
  const branches = useModel("branch", { mode: "select" }).options ?? [];
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bed",
  });

  // Local state for the inline row
  const [newBed, setNewBed] = useState({ name: "", description: "" });

  const handleAddBed = () => {
    if (!newBed.name) return; // Basic validation
    append({ name: newBed.name, description: newBed.description });
    setNewBed({ name: "", description: "" }); // Reset inline inputs
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="branch_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branch</FormLabel>
            <FormControl>
              <AppSelect
                options={branches}
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
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Room Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Room Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="font-medium">Room Beds</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-2 text-left">Bed Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Existing Beds */}
            {fields.map((field, index) => (
              <tr key={field.id} className="border-b bg-white">
                <td className="p-2 font-medium">{field.name}</td>
                <td className="p-2 text-slate-500">{field.description}</td>
                <td className="p-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}

            {/* 2. INLINE INPUT ROW */}
            <tr className="bg-blue-50/50">
              <td className="p-2">
                <Input
                  placeholder="e.g. Bed A"
                  value={newBed.name}
                  onChange={(e) =>
                    setNewBed({ ...newBed, name: e.target.value })
                  }
                  className="h-8 bg-white"
                />
              </td>
              <td className="p-2">
                <Input
                  placeholder="Optional details..."
                  value={newBed.description}
                  onChange={(e) =>
                    setNewBed({ ...newBed, description: e.target.value })
                  }
                  className="h-8 bg-white"
                />
              </td>
              <td className="p-2 text-right">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddBed}
                  disabled={!newBed.name}
                >
                  Add
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RoomForm({ roomId }: { roomId?: string }) {
  return (
    <EntityForm<RoomFormValues>
      title={roomId ? "Edit Room" : "Add New Room"}
      schema={RoomSchema}
      id={roomId}
      endpoint="/room"
      defaultValues={{
        name: "",
        branch_id: "",
        description: "",
        bed: [],
        image: undefined,
      }}
    >
      {(form) => <RoomFormContent form={form} />}
    </EntityForm>
  );
}
