// Similar to Login, but add role select if needed (admin creates cashiers later)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  return (
    <form className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Register</h2>
      <div>
        <label htmlFor="fullName" className="sr-only">Full Name</label>
        <Input id="fullName" name="fullName" placeholder="Full Name" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">Email</label>
        <Input id="email" name="email" placeholder="Email" type="email" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <Input id="password" name="password" placeholder="Password" type="password" autoComplete="new-password" />
      </div>
      <Button type="submit" className="w-full">Sign Up</Button>
    </form>
  );
}