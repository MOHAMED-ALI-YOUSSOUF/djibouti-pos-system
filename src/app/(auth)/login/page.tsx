import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  return (
    <form className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Login</h2>
      <Input placeholder="Email" type="email" />
      <Input placeholder="Password" type="password" />
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
  );
}