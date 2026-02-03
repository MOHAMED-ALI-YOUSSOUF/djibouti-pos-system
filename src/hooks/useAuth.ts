import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface ExtendedUser extends User {
  role?: 'admin' | 'cashier';
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const { data: profile } = await supabase.from('users').select('*, roles(name)').eq('id', session.user.id).single();
        setUser({ ...session.user, role: profile.roles.name });
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_OUT') router.push('/login');
      if (newSession) {
        const { data: profile } = await supabase.from('users').select('*, roles(name)').eq('id', newSession.user.id).single();
        setUser({ ...newSession.user, role: profile.roles.name });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, signOut };
}