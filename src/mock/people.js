// Sample users, agents/builders and admin accounts (development only — see README).

export const USER_ROLES = [
  { id: "buyer", label: "Buyer / Tenant" },
  { id: "owner", label: "Individual Owner" },
  { id: "agent", label: "Property Agent" },
  { id: "builder", label: "Builder / Developer" },
  { id: "agency", label: "Real Estate Agency" },
];

export const USERS = [
  { id: "u1", name: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "+919876500001", role: "owner", city: "Jaipur", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2025-04-12T10:00:00+05:30", lastActiveAt: "2026-11-17T09:12:00+05:30", avatar: null },
  { id: "u2", name: "Neha Kapoor", email: "neha.kapoor@example.com", phone: "+919876500002", role: "buyer", city: "Delhi NCR", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2025-07-03T10:00:00+05:30", lastActiveAt: "2026-11-16T21:40:00+05:30", avatar: null },
  { id: "u3", name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+919876500003", role: "buyer", city: "Jaipur", status: "active", emailVerified: false, phoneVerified: true, joinedAt: "2025-09-19T10:00:00+05:30", lastActiveAt: "2026-11-15T14:02:00+05:30", avatar: null },
  { id: "u4", name: "Priya Mehta", email: "priya@nestrealty.example", phone: "+919876500004", role: "agent", city: "Mumbai", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2025-02-08T10:00:00+05:30", lastActiveAt: "2026-11-17T08:30:00+05:30", avatar: null },
  { id: "u5", name: "Skyline Developers", email: "sales@skyline.example", phone: "+919876500005", role: "builder", city: "Bengaluru", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2025-01-15T10:00:00+05:30", lastActiveAt: "2026-11-16T18:00:00+05:30", avatar: null },
  { id: "u6", name: "UrbanKey Agency", email: "hello@urbankey.example", phone: "+919876500006", role: "agency", city: "Delhi NCR", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2025-03-21T10:00:00+05:30", lastActiveAt: "2026-11-16T12:10:00+05:30", avatar: null },
  { id: "u7", name: "Rohan Verma", email: "rohan.verma@example.com", phone: "+919876500007", role: "owner", city: "Hyderabad", status: "active", emailVerified: true, phoneVerified: false, joinedAt: "2026-10-30T10:00:00+05:30", lastActiveAt: "2026-11-16T22:30:00+05:30", avatar: null },
  { id: "u8", name: "Kavya Iyer", email: "kavya.iyer@example.com", phone: "+919876500008", role: "owner", city: "Bengaluru", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2025-11-11T10:00:00+05:30", lastActiveAt: "2026-11-14T10:00:00+05:30", avatar: null },
  { id: "u9", name: "Imran Qureshi", email: "imran.q@example.com", phone: "+919876500009", role: "buyer", city: "Lucknow", status: "suspended", emailVerified: true, phoneVerified: true, joinedAt: "2025-06-02T10:00:00+05:30", lastActiveAt: "2026-10-02T10:00:00+05:30", avatar: null },
  { id: "u10", name: "Sneha Patil", email: "sneha.patil@example.com", phone: "+919876500010", role: "buyer", city: "Pune", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2026-01-22T10:00:00+05:30", lastActiveAt: "2026-11-17T07:55:00+05:30", avatar: null },
  { id: "u11", name: "Arjun Nair", email: "arjun.nair@example.com", phone: "+919876500011", role: "agent", city: "Hyderabad", status: "pending", emailVerified: true, phoneVerified: true, joinedAt: "2026-11-15T10:00:00+05:30", lastActiveAt: "2026-11-15T10:20:00+05:30", avatar: null },
  { id: "u12", name: "Meera Joshi", email: "meera.joshi@example.com", phone: "+919876500012", role: "buyer", city: "Ahmedabad", status: "active", emailVerified: false, phoneVerified: true, joinedAt: "2026-05-14T10:00:00+05:30", lastActiveAt: "2026-11-12T19:00:00+05:30", avatar: null },
  { id: "u13", name: "Harbour Homes", email: "info@harbourhomes.example", phone: "+919876500013", role: "builder", city: "Mumbai", status: "pending", emailVerified: true, phoneVerified: true, joinedAt: "2026-11-13T10:00:00+05:30", lastActiveAt: "2026-11-13T11:00:00+05:30", avatar: null },
  { id: "u14", name: "Ananya Das", email: "ananya.das@example.com", phone: "+919876500014", role: "buyer", city: "Kolkata", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2026-03-09T10:00:00+05:30", lastActiveAt: "2026-11-16T16:45:00+05:30", avatar: null },
  { id: "u15", name: "Karan Malhotra", email: "karan.m@example.com", phone: "+919876500015", role: "owner", city: "Delhi NCR", status: "active", emailVerified: true, phoneVerified: true, joinedAt: "2026-08-27T10:00:00+05:30", lastActiveAt: "2026-11-10T09:00:00+05:30", avatar: null },
  { id: "u16", name: "Divya Reddy", email: "divya.reddy@example.com", phone: "+919876500016", role: "buyer", city: "Hyderabad", status: "active", emailVerified: true, phoneVerified: false, joinedAt: "2026-10-05T10:00:00+05:30", lastActiveAt: "2026-11-17T06:40:00+05:30", avatar: null },
];

export const AGENTS = [
  { id: "a1", userId: "u4", name: "Priya Mehta", company: "Nest Realty", type: "agent", city: "Mumbai", rera: "A51800034567", phone: "+919876500004", email: "priya@nestrealty.example", verified: true, status: "active", rating: 4.7, deals: 128, joinedAt: "2025-02-08T10:00:00+05:30", kyc: "approved" },
  { id: "a2", userId: "u5", name: "Skyline Developers", company: "Skyline Developers Pvt Ltd", type: "builder", city: "Bengaluru", rera: "PRM/KA/RERA/1251/446/AG/180924", phone: "+919876500005", email: "sales@skyline.example", verified: true, status: "active", rating: 4.5, deals: 640, joinedAt: "2025-01-15T10:00:00+05:30", kyc: "approved" },
  { id: "a3", userId: "u6", name: "UrbanKey Agency", company: "UrbanKey Realty LLP", type: "agency", city: "Delhi NCR", rera: "DLRERA2023A0098", phone: "+919876500006", email: "hello@urbankey.example", verified: true, status: "active", rating: 4.4, deals: 312, joinedAt: "2025-03-21T10:00:00+05:30", kyc: "approved" },
  { id: "a4", userId: "u11", name: "Arjun Nair", company: "Independent", type: "agent", city: "Hyderabad", rera: "A02500002233", phone: "+919876500011", email: "arjun.nair@example.com", verified: false, status: "pending", rating: null, deals: 0, joinedAt: "2026-11-15T10:00:00+05:30", kyc: "submitted" },
  { id: "a5", userId: "u13", name: "Harbour Homes", company: "Harbour Homes Infra Ltd", type: "builder", city: "Mumbai", rera: "P51900054321", phone: "+919876500013", email: "info@harbourhomes.example", verified: false, status: "pending", rating: null, deals: 0, joinedAt: "2026-11-13T10:00:00+05:30", kyc: "submitted" },
  { id: "a6", userId: null, name: "Pink City Properties", company: "Pink City Properties", type: "agency", city: "Jaipur", rera: "RAJ/A/2022/0451", phone: "+919876500020", email: "contact@pinkcity.example", verified: true, status: "active", rating: 4.2, deals: 96, joinedAt: "2025-08-30T10:00:00+05:30", kyc: "approved" },
  { id: "a7", userId: null, name: "Sanjay Gupta", company: "Gupta Estates", type: "agent", city: "Lucknow", rera: "UPRERAAGT11223", phone: "+919876500021", email: "sanjay@guptaestates.example", verified: true, status: "suspended", rating: 3.1, deals: 22, joinedAt: "2025-05-18T10:00:00+05:30", kyc: "approved" },
];

// Admin panel accounts. Roles map to permissions in mock/admin.js.
export const ADMINS = [
  { id: "ad1", name: "Ritika Bansal", email: "admin@invest2growth.com", role: "super_admin", status: "active", lastLoginAt: "2026-11-17T08:55:00+05:30" },
  { id: "ad2", name: "Manish Rao", email: "editor@invest2growth.com", role: "content_editor", status: "active", lastLoginAt: "2026-11-16T17:20:00+05:30" },
  { id: "ad3", name: "Fatima Sheikh", email: "moderator@invest2growth.com", role: "moderator", status: "active", lastLoginAt: "2026-11-17T09:05:00+05:30" },
];

// Demo-only credentials shown on the admin login screen.
export const DEMO_ADMIN_PASSWORD = "Admin@123";
export const DEMO_OTP = "123456";
