'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
   const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [full_name, setFullName] = useState('');
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } } // For trigger
  });
  if (error)  alert(error.message);
  else alert('Check email for confirmation');
    setLoading(false);
        };
  return (
    <form className="space-y-6" onSubmit={handleRegister}>
      <h2 className="text-2xl font-bold text-center">Register</h2>
      <div>
        <label htmlFor="fullName" className="sr-only">Full Name</label>
        <Input id="fullName" name="fullName" placeholder="Full Name" autoComplete="name" value={full_name} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">Email</label>
        <Input id="email" name="email" placeholder="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div> 
        <label htmlFor="password" className="sr-only">Password</label>
        <Input id="password" name="password" placeholder="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>Sign Up</Button>
    </form>
  );
}