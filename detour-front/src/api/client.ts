import {
  Attraction,
  Booking,
  BookingRequest,
  Facility,
  FacilityCategory,
  FavoriteToggleResponse,
  GuideAvailability,
  GuideEarningsSummary,
  GuideOnboardingRequest,
  GuidePayout,
  GuideProfile,
  InitiatePaymentRequest,
  LoginRequest,
  Payment,
  RegistrationRequest,
  SetAvailabilityRequest,
  User,
} from "../types";

// CHANGE THIS to your machine's LAN IP when running on a physical device
// or Android emulator (10.0.2.2 for Android Studio emulator, localhost for iOS simulator/web).
<<<<<<< HEAD
export const BASE_URL = "http://10.55.199.4:8080";
=======
export const BASE_URL = "https://simile-sandstone-essay.ngrok-free.dev";
>>>>>>> 864b7684d913ed7dbba48ba7992dcaf2114b02ef

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

  // --- Guides (GuideController) ---
  onboardGuide: (body: GuideOnboardingRequest) =>
    fetch(`${BASE_URL}/api/guides/onboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => handle<GuideProfile>(r)),

  // GET /api/guides/{id} is not implemented on the backend yet.
  // Fallback: fetch pending guides and match by profile id (only works while status is PENDING).
  getGuideProfile: async (guideId: number): Promise<GuideProfile> => {
    const pending = await fetch(`${BASE_URL}/api/guides/pending`).then((r) =>
      handle<GuideProfile[]>(r)
    );
    const profile = pending.find((p) => p.id === guideId);
    if (profile) return profile;
    throw new Error("Guide profile not found");
  },

  setGuideAvailability: (guideId: number, body: SetAvailabilityRequest) =>
    fetch(`${BASE_URL}/api/guides/${guideId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => handle<GuideAvailability>(r)),

  getGuideAvailability: (guideId: number, from: string, to: string) =>
    fetch(
      `${BASE_URL}/api/guides/${guideId}/availability?fromDate=${encodeURIComponent(from)}&toDate=${encodeURIComponent(to)}`
    ).then((r) => handle<GuideAvailability[]>(r)),

  getGuideEarnings: (guideId: number) =>
    fetch(`${BASE_URL}/api/guides/${guideId}/earnings`).then(async (r) => {
      const data = await handle<{
        totalCompletedBookingRevenue?: number;
        commissionAmount?: number;
        pendingPayoutBalance?: number;
      }>(r);
      return {
        totalRevenue: Number(data.totalCompletedBookingRevenue ?? 0),
        commissionAmount: Number(data.commissionAmount ?? 0),
        pendingBalance: Number(data.pendingPayoutBalance ?? 0),
      } satisfies GuideEarningsSummary;
    }),

  requestGuidePayout: (guideId: number, amount: number, momoNumber: string) =>
    fetch(`${BASE_URL}/api/guides/${guideId}/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, momoNumber }),
    }).then((r) => handle<GuidePayout>(r)),
};
