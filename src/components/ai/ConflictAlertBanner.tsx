"use client";

import { AlertTriangle, Clock, User, DoorOpen, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConflictRecord, AlternativeSlot } from "@/lib/types";

interface ConflictAlertBannerProps {
  conflict: ConflictRecord;
}

function formatTime(time: string): string {
  // Accepts "HH:MM:SS" or "HH:MM" and returns "HH:MM"
  return time.slice(0, 5);
}

function AlternativeSlotItem({ slot, index }: { slot: AlternativeSlot; index: number }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-100 text-xs">
      <CalendarCheck size={13} className="text-amber-600 mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-slate-700">
          Option {index + 1} — {slot.date}
        </span>
        <span className="text-slate-500">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </span>
        <div className="flex gap-2 text-slate-500">
          <span>Therapist #{slot.therapistId}</span>
          <span>Room {slot.roomId}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Displays a conflict alert for a detected scheduling conflict.
 * Shows conflicting booking IDs, affected resource (therapist or room),
 * overlapping time window, and up to 3 alternative slots.
 * Requirements: 6.5
 */
export function ConflictAlertBanner({ conflict }: ConflictAlertBannerProps) {
  const isTherapistConflict = conflict.conflictType === "therapist";
  const slots = conflict.alternativeSlots.slice(0, 3);

  // Derive overlapping time window from detectionTimestamp as a display date
  const detectedAt = new Date(conflict.detectionTimestamp);
  const detectedDate = detectedAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const detectedTime = detectedAt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className="border-red-300 bg-red-50"
      role="alert"
      aria-label={`Scheduling conflict between bookings #${conflict.bookingId} and #${conflict.conflictingBookingId}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle size={16} />
          Scheduling Conflict Detected
          <Badge variant="destructive" className="ml-auto text-xs">
            {conflict.resolutionStatus}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Conflicting booking identifiers */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-600">Conflicting bookings:</span>
          <Badge variant="outline" className="border-red-300 text-red-700 font-mono">
            #{conflict.bookingId}
          </Badge>
          <span className="text-slate-400">vs</span>
          <Badge variant="outline" className="border-red-300 text-red-700 font-mono">
            #{conflict.conflictingBookingId}
          </Badge>
        </div>

        {/* Affected resource */}
        <div className="flex items-center gap-2 text-xs text-slate-700">
          {isTherapistConflict ? (
            <User size={13} className="text-red-500 shrink-0" />
          ) : (
            <DoorOpen size={13} className="text-red-500 shrink-0" />
          )}
          <span>
            <span className="font-medium capitalize">{conflict.conflictType}</span> conflict
          </span>
        </div>

        {/* Overlapping time window */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Clock size={13} className="text-red-500 shrink-0" />
          <span>
            Detected on {detectedDate} at {detectedTime}
          </span>
        </div>

        {/* Alternative slots */}
        {slots.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-slate-600">
              Alternative slots ({slots.length}):
            </p>
            {slots.map((slot, i) => (
              <AlternativeSlotItem key={i} slot={slot} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No alternative slots available.</p>
        )}
      </CardContent>
    </Card>
  );
}
