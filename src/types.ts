import { DateRange } from "react-day-picker";
import { Database } from "./lib/supabase";

// Calendar events
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "time-off" | "lounge-booking" | "meeting-booking" | "holiday";
}

// User types
export type User = Database['public']['Tables']['users']['Row'];
export type NewUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update'];

// Time off request types
export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row'];
export type NewTimeOffRequest = Database['public']['Tables']['time_off_requests']['Insert'];
export type UpdateTimeOffRequest = Database['public']['Tables']['time_off_requests']['Update'];

// Room booking types
export type RoomBooking = Database['public']['Tables']['room_bookings']['Row'];
export type NewRoomBooking = Database['public']['Tables']['room_bookings']['Insert'];
export type UpdateRoomBooking = Database['public']['Tables']['room_bookings']['Update'];

// Public holiday types
export type PublicHoliday = Database['public']['Tables']['public_holidays']['Row'];
export type NewPublicHoliday = Database['public']['Tables']['public_holidays']['Insert'];
export type UpdatePublicHoliday = Database['public']['Tables']['public_holidays']['Update'];

// Department types
export type Department = Database['public']['Tables']['departments']['Row'];
