import { insforge } from '@/lib/insforge'

export async function verifyApplicantEmail(email: string) {
  const { data, error } = await insforge.database.rpc('verify_application_email', {
    p_email: email.trim(),
  })
  if (error) throw error
  return Boolean(data)
}

export async function confirmAccelr8Housing(payload: {
  email: string
  house_preference: string
  room_type: string
  move_in_timing: string
  length_of_stay: string
  phone: string
  commitment_status: 'confirmed' | 'needs_info'
}) {
  const { data, error } = await insforge.database.rpc('confirm_accelr8_housing', {
    p_email: payload.email.trim(),
    p_house_preference: payload.house_preference,
    p_room_type: payload.room_type,
    p_move_in_timing: payload.move_in_timing,
    p_length_of_stay: payload.length_of_stay,
    p_phone: payload.phone.trim(),
    p_commitment_status: payload.commitment_status,
  })
  if (error) throw error
  return data as string
}

// Returns the applicant's first name (or null if no application exists for this email).
// Used for the existence check + "Welcome back" greeting on /accelr8.
export async function lookupApplicant(email: string): Promise<string | null> {
  const { data, error } = await insforge.database.rpc('lookup_applicant', {
    p_email: email.trim(),
  })
  if (error) throw error
  return (data as string | null) ?? null
}
