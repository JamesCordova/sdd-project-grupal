import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Crear Cuenta | Finanzas Perú",
  description: "Crea tu cuenta gratis para llevar el control de tus finanzas personales",
};

export default function RegisterPage() {
  return (
    <div className="w-full flex justify-center py-6">
      <RegisterForm />
    </div>
  );
}
