export type Role = "admin" | "student";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  phone: string | null;
  instagram_username: string | null;
  instagram_connected: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface InstagramMetric {
  id: string;
  student_id: string;
  metric_date: string; // yyyy-mm-dd
  followers: number;
  following: number;
  posts_count: number;
  reach: number;
  profile_visits: number;
  notes: string | null;
  created_at: string;
}

export interface Reel {
  id: string;
  student_id: string;
  posted_at: string; // yyyy-mm-dd
  title: string;
  url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  created_at: string;
}

export type PaymentMethod =
  | "efectivo"
  | "zelle"
  | "transferencia"
  | "tarjeta"
  | "otro";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  zelle: "Zelle",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  otro: "Otro",
};

export interface Product {
  id: string;
  student_id: string;
  name: string;
  category: string | null;
  cost_per_unit: number;
  quantity_purchased: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  student_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  payment_method: PaymentMethod;
  sale_date: string;
  notes: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  student_id: string;
  admin_id: string;
  admin_name?: string | null;
  message: string;
  created_at: string;
  read_at: string | null;
}

export interface StudentSummary {
  profile: Profile;
  totalFollowers: number | null;
  followerGrowth30d: number | null;
  totalRevenue: number;
  totalProfit: number;
  lastActivity: string | null;
  feedbackCount: number;
}
