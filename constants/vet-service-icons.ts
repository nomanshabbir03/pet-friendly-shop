import {
  Syringe,
  Scissors,
  Stethoscope,
  Siren,
  HeartPulse,
  Bone,
  PawPrint,
  Thermometer,
  Pill,
  Activity,
  type LucideIcon,
} from 'lucide-react';

// Curated allowlist of icon names a VetService can store (see lib/models/VetService.ts).
// Shared between the admin form (dropdown + preview) and VeterinarySection (card icon
// resolution) so the two never drift out of sync.
export const VET_SERVICE_ICONS: Record<string, LucideIcon> = {
  Syringe,
  Scissors,
  Stethoscope,
  Siren,
  HeartPulse,
  Bone,
  PawPrint,
  Thermometer,
  Pill,
  Activity,
};

export const VET_SERVICE_ICON_NAMES = Object.keys(VET_SERVICE_ICONS);

export const DEFAULT_VET_SERVICE_ICON = 'Stethoscope';

export function resolveVetServiceIcon(name?: string | null): LucideIcon {
  if (name && VET_SERVICE_ICONS[name]) {
    return VET_SERVICE_ICONS[name];
  }
  return VET_SERVICE_ICONS[DEFAULT_VET_SERVICE_ICON];
}
