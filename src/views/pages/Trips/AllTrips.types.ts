import React, { ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────
   AllTrips — Type Definitions
   Shared types for the AllTrips component, its API layer,
   and the edit-trip form state.
───────────────────────────────────────────────────────────── */

/** Vehicle type discriminator — drives which trip fields apply. */
export type VehicleType = 'lorry' | 'hitachi'

/** Hitachi work type (irrelevant for lorry trips). */
export type WorkType = 'bucket' | 'breaker'

/* ── Core entities ─────────────────────────────────────────── */

export interface Vehicle {
  id: string
  name?: string
  regNo?: string
  type: VehicleType
}

export interface Party {
  id: string
  name: string
  location?: string
}

/**
 * A trip record as returned by GET /vehicles/trips/all
 * (and by the single-vehicle GET /vehicles/:id/trips).
 * Lorry-only and Hitachi-only fields are optional since a given
 * row will only populate the set relevant to its vehicle's type.
 */
export interface VehicleTrip {
  id: string
  tripDate: string          // ISO date string
  vehicleId: string
  vehicle?: Vehicle
  partyId?: string | null
  party?: Party | null
  site?: string | null
  notes?: string | null
  income?: number | null

  // ── Lorry-only fields ──
  slipNo?: string | null
  leadKm?: number | null
  uChainage?: number | null
  kmDriven?: number | null
  rentPerKm?: number | null
  otherExpense?: number | null

  // ── Hitachi-only fields ──
  workType?: WorkType | null
  startingHours?: number | null
  closingHours?: number | null
  hoursWorked?: number | null
  bata?: number | null
  diesel?: number | null

  createdAt?: string
  updatedAt?: string
}

/* ── API filter / request shapes ──────────────────────────── */

export interface GetAllTripsFilters {
  month?: string        // 'YYYY-MM'
  vehicleId?: string
  partyId?: string
  workType?: WorkType
}

/** Payload accepted by PATCH /vehicles/trips/:tripId */
export type UpdateTripDto = Partial<
  Pick<
    VehicleTrip,
    | 'tripDate'
    | 'partyId'
    | 'site'
    | 'notes'
    | 'income'
    | 'slipNo'
    | 'leadKm'
    | 'uChainage'
    | 'kmDriven'
    | 'rentPerKm'
    | 'otherExpense'
    | 'workType'
    | 'startingHours'
    | 'closingHours'
    | 'bata'
    | 'diesel'
  >
>

/* ── Component-local state shapes ─────────────────────────── */

/** Controlled filter-bar state (all string-typed for form inputs). */
export interface TripFilters {
  month: string
  vehicleId: string
  partyId: string
  workType: '' | WorkType
}

/** Edit-form state for a lorry trip. All values are strings because
 *  they're bound directly to <input> elements before being coerced
 *  to numbers at submit time. */
export interface LorryTripForm {
  tripDate: string
  slipNo: string
  leadKm: string
  uChainage: string
  kmDriven: string
  rentPerKm: string
  otherExpense: string
  notes: string
  partyId: string
  site: string
}

/** Edit-form state for a hitachi trip (same string-input rationale). */
export interface HitachiTripForm {
  tripDate: string
  workType: WorkType
  startingHours: string
  closingHours: string
  income: string
  bata: string
  diesel: string
  notes: string
  partyId: string
  site: string
}

export type TripForm = LorryTripForm | HitachiTripForm

/* ── Service function signatures ──────────────────────────── */

export interface VehicleServiceApi {
  getAllTrips(filters?: GetAllTripsFilters): Promise<VehicleTrip[]>
  updateTrip(tripId: string, dto: UpdateTripDto): Promise<VehicleTrip>
  deleteTrip(tripId: string): Promise<void>
  getVehicles(): Promise<Vehicle[]>
}

export interface PartiesServiceApi {
  getParties(): Promise<Party[]>
}

/* ── UI primitive prop types (design-token components) ────── */

export type IconName =
  | 'truck' | 'excavator' | 'plus' | 'trash' | 'alert' | 'check'
  | 'calendar' | 'fuel' | 'close' | 'car' | 'rupee' | 'trending'
  | 'settings' | 'hash' | 'info' | 'road' | 'pencil' | 'filter' | 'refresh'

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  style?: React.CSSProperties
}

export type BadgeTone = 'blue' | 'amber' | 'violet'

export interface BadgeProps {
  label: string
  tone?: BadgeTone
}

export type BtnVariant = 'primary' | 'secondary' | 'danger' | 'dangerSolid'
export type BtnSize = 'sm' | 'md'

export interface BtnProps {
  onClick?: () => void
  disabled?: boolean
  variant?: BtnVariant
  size?: BtnSize
  children?: React.ReactNode
  style?: React.CSSProperties
}

export interface StatPillProps {
  icon: IconName
  label: string
  value: string
  accent: string
  style?: React.CSSProperties
}

export interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  children?: React.ReactNode
}

export interface ModalProps {
  visible: boolean
  onClose: () => void
  title: string
  children?: React.ReactNode
  footer?: React.ReactNode
}