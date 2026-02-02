// Similar to Login, but add role select if needed (admin creates cashiers later)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  return (
    <form className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Register</h2>
      <Input placeholder="Full Name" />
      <Input placeholder="Email" type="email" />
      <Input placeholder="Password" type="password" />
      <Button type="submit" className="w-full">Sign Up</Button>
    </form>
  );
}