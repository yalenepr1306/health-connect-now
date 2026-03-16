export type UserRole = "hospital" | "donor";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  licenseNumber: string;
  contactNumber: string;
  email: string;
  distance?: string;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  email: string;
  location: string;
  available: boolean;
  lastDonationDate?: string;
}

export interface BloodStock {
  bloodGroup: string;
  units: number;
}

export interface OrganAvailability {
  organName: string;
  bloodType: string;
  count: number;
}

export interface ResourceRequest {
  id: string;
  fromHospital: string;
  fromHospitalLocation?: string;
  toHospital?: string;
  toDonor?: string;
  type: "blood" | "organ";
  bloodGroup?: string;
  organType?: string;
  organBloodType?: string;
  unitsRequired?: number;
  patientDetails?: string;
  status: "pending" | "accepted" | "rejected";
  date: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "incoming" | "accepted" | "rejected";
  read: boolean;
  date: string;
  linkTo: string;
}

export interface EmergencyRequest {
  id: string;
  hospitalName: string;
  bloodGroup: string;
  distance: string;
  urgency: "critical" | "high" | "medium";
  date: string;
}

export interface DonationRecord {
  date: string;
  time: string;
  hospital: string;
  bloodGroup: string;
  status: "completed" | "scheduled" | "cancelled";
}
