import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Customer } from "@/lib/types";
import { format } from "date-fns";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

export function NewCustomerModal({
  isOpen,
  onClose,
  onSave,
}: NewCustomerModalProps) {
  const [name, setCustomerName] = useState("");
  const [gender, setGender] = useState("");
  const [place_of_birth, setPlaceOfBirth] = useState("");
  const [date_of_birth, setDateOfBirth] = useState(new Date());
  const [mobile, setMobileNumber] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Customer</DialogTitle>
          <DialogDescription>Add details of new customer.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input
              type="text"
              className="pl-9"
              value={name}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="male" value="M">
                  Male
                </SelectItem>
                <SelectItem key="female" value="F">
                  Female
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Place of Birth</Label>
            <Input
              type="text"
              className="pl-9"
              value={place_of_birth}
              onChange={(e) => setPlaceOfBirth(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Calendar
              required
              mode="single"
              selected={date_of_birth}
              onSelect={setDateOfBirth}
              className="rounded-md border shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input
              type="text"
              className="pl-9"
              value={mobile}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                name,
                gender,
                place_of_birth,
                mobile,
                date_of_birth: format(date_of_birth, "yyyy-MM-dd"),
              })
            }
            className="bg-sky-600 hover:bg-sky-700"
          >
            Create Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
