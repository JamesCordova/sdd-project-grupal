import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Iniciar Sesión | Finanzas Perú",
  description: "Ingresa a tu panel de control de finanzas personales en Soles",
};

export default function LoginPage() {
  return (
    <div className="w-full flex justify-center py-6">
      <LoginForm />
    </div>
  );
}
