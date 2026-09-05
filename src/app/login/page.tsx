import AdminLoginPage from "@/app/admin/login/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Traders Community Admin Portal Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <AdminLoginPage />;
}
