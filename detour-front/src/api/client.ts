import {
  Attraction,
  Booking,
  BookingRequest,
  Facility,
  FacilityCategory,
  FavoriteToggleResponse,
  InitiatePaymentRequest,
  LoginRequest,
  Payment,
  RegistrationRequest,
  User,
} from "../types";

// CHANGE THIS to your machine's LAN IP when running on a physical device
// or Android emulator (10.0.2.2 for Android Studio emulator, localhost for iOS simulator/web).
export const BASE_URL = "http://10.55.199.4:8080";

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.message || "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  // --- Users (UserController) ---
  register: (body: RegistrationRequest) =>
    fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => handle<User>(r)),

  login: (body: LoginRequest) =>
    fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => handle<User>(r)),

  // --- Attractions (AttractionController) ---
  getAttractions: (params?: { lat?: number; lng?: number; userId?: number }) => {
    const query = new URLSearchParams();
    if (params?.lat != null) query.set("lat", String(params.lat));
    if (params?.lng != null) query.set("lng", String(params.lng));
    if (params?.userId != null) query.set("userId", String(params.userId));
    const qs = query.toString();
    return fetch(`${BASE_URL}/api/attractions${qs ? `?${qs}` : ""}`).then((r) =>
      handle<Attraction[]>(r)
    );
  },

  getAttractionsByRegion: (region: string) =>
    fetch(`${BASE_URL}/api/attractions/region/${encodeURIComponent(region)}`).then((r) =>
      handle<Attraction[]>(r)
    ),

  toggleAttractionFavorite: (attractionId: number, userId: number) =>
    fetch(`${BASE_URL}/api/attractions/${attractionId}/favorite?userId=${userId}`, {
      method: "POST",
    }).then((r) => handle<FavoriteToggleResponse>(r)),

  getFavoritedAttractionIds: (userId: number) =>
    fetch(`${BASE_URL}/api/attractions/favorites?userId=${userId}`).then((r) =>
      handle<number[]>(r)
    ),

  // --- Facilities (FacilityController) ---
  getFacilities: (params?: {
    lat?: number;
    lng?: number;
    category?: FacilityCategory;
    radiusKm?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.lat != null) query.set("lat", String(params.lat));
    if (params?.lng != null) query.set("lng", String(params.lng));
    if (params?.category != null) query.set("category", params.category);
    if (params?.radiusKm != null) query.set("radiusKm", String(params.radiusKm));
    const qs = query.toString();
    return fetch(`${BASE_URL}/api/facilities${qs ? `?${qs}` : ""}`).then((r) =>
      handle<Facility[]>(r)
    );
  },

  // --- Bookings (BookingController) ---
  createBooking: (body: BookingRequest) =>
    fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => handle<Booking>(r)),

  getUserBookings: (userId: number) =>
    fetch(`${BASE_URL}/api/bookings/user/${userId}`).then((r) => handle<Booking[]>(r)),

  // --- Payments (PaymentController) ---
  initiatePayment: (body: InitiatePaymentRequest) =>
    fetch(`${BASE_URL}/api/payments/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => handle<Payment>(r)),

  getPayment: (paymentId: number) =>
    fetch(`${BASE_URL}/api/payments/${paymentId}`).then((r) => handle<Payment>(r)),

  getPaymentStatus: (paymentId: number) =>
    fetch(`${BASE_URL}/api/payments/${paymentId}/status`).then((r) => handle<Payment>(r)),

  confirmSandboxPayment: (paymentId: number) =>
    fetch(`${BASE_URL}/api/payments/${paymentId}/confirm`, {
      method: "POST",
    }).then((r) => handle<Payment>(r)),

  getPaymentsForBooking: (bookingId: number) =>
    fetch(`${BASE_URL}/api/payments/booking/${bookingId}`).then((r) => handle<Payment[]>(r)),
};
