// These types map 1:1 to your Spring Boot entities.
// NOTE: fields like guide, time slot, status, photos, amenities, hours, distance
// do NOT exist on the backend yet (see Attraction.java / Booking.java).
// They are intentionally left out here rather than faked.

export type FacilityCategory =
  | "HOTEL"
  | "GUESTHOUSE"
  | "REST_STOP"
  | "FUEL_STATION"
  | "EV_CHARGING"
  | "HOSPITAL"
  | "ATM"
  | "RESTAURANT";

export interface Facility {
  id: number;
  name: string;
  category: FacilityCategory;
  latitude: number;
  longitude: number;
  address: string;
  phoneNumber?: string;
  region: string;
  distanceKm?: number;
}

export type UserRole = "TOURIST" | "GUIDE";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt?: string;
}

export interface Attraction {
  id: number;
  title: string;
  description?: string;
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  basePrice?: number;
  ecoScore?: number;
  popularityCount?: number;
  imageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  distanceKm?: number;
  isFavorited?: boolean;
  createdAt?: string;
}

export interface FavoriteToggleResponse {
  favorited: boolean;
}

export interface Booking {
  id: number;
  tourist: User;
  attraction: Attraction;
  bookingDate: string;
  totalAmount: number;
  paymentStatus: string;
  syncStatus: string;
  createdAt?: string;
}

export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BookingRequest {
  touristId: number;
  attractionId: number;
  totalAmount: number;
}

export type PaymentMethodType = "MTN_MOMO" | "VODAFONE_CASH" | "CARD";

export type PaymentStatusType = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface Payment {
  id: number;
  bookingId: number;
  provider: PaymentMethodType;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  phoneNumber?: string;
  externalReference?: string;
  authorizationUrl?: string;
  failureReason?: string;
  sandbox: boolean;
  message?: string;
}

export interface InitiatePaymentRequest {
  bookingId: number;
  method: PaymentMethodType;
  phoneNumber?: string;
  email?: string;
}

export interface SafetyAlert {
  id: number;
  region: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | string;
  activeFrom?: string;
  activeUntil?: string;
  createdAt?: string;
}

export interface VerifiedGuide {
  id: number;
  name: string;
  phoneNumber: string;
  region: string;
  transportType: string;
  licenseNumber?: string;
  rating?: number;
  verified: boolean;
  createdAt?: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phoneNumber: string;
  relationship?: string;
  isPrimary: boolean;
  createdAt?: string;
}

export interface EmergencyContactRequest {
  name: string;
  phoneNumber: string;
  relationship?: string;
  isPrimary?: boolean;
}

export interface SafetyIncident {
  id: number;
  latitude: number;
  longitude: number;
  region?: string;
  audioPath?: string;
  durationSeconds: number;
  status: string;
  notes?: string;
  submittedAt: string;
  createdAt?: string;
}

export interface SubmitIncidentParams {
  userId: number;
  latitude: number;
  longitude: number;
  region?: string;
  durationSeconds: number;
  audioUri?: string | null;
}

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface GuideProfile {
  id: number;
  userId: number;
  bio: string;
  specialty: string;
  languages: string;
  gtaLicenseNo: string;
  ghanaCardNumber: string;
  companyName: string;
  verificationStatus: VerificationStatus;
  avgRating?: number;
  baseRatePerHour?: number;
  createdAt?: string;
}

export interface GuideOnboardingRequest {
  userId: number;
  bio: string;
  specialty: string;
  languages: string;
  gtaLicenseNo: string;
  ghanaCardNumber: string;
  companyName: string;
}

export interface GuideAvailability {
  id: number;
  guideId: number;
  availableDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface GuidePayout {
  id: number;
  guideId: number;
  amount: number;
  transactionReference?: string;
  momoNumber: string;
  payoutStatus: PayoutStatus;
  processedAt?: string;
}

export interface GuideEarningsSummary {
  totalRevenue: number;
  commissionAmount: number;
  pendingBalance: number;
}

export interface SetAvailabilityRequest {
  date: string;
  startTime: string;
  endTime: string;
}

// --- Notifications (NotificationController) ---
// Backend `type` values in use today: INCIDENT_RECEIVED, GUIDE_APPROVED,
// GUIDE_REJECTED, PAYMENT_SUCCESS, PAYMENT_FAILED. It's a free-form string
// column, so treat unknown values as generic info.
export type NotificationType = string;

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

/** Params for guide booking detail — populated from booked availability slots until a dedicated API exists. */
export interface GuideBookingDetailParams {
  touristName: string;
  touristPhone?: string;
  languagePreference: string;
  specialRequests?: string;
  meetupLatitude: number;
  meetupLongitude: number;
  meetupLabel: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}
