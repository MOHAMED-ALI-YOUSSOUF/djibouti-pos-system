import { supabase } from '@/lib/supabase/client';

export default async function Home() {
  const { data } = await supabase.from('users').select('*'); // Won't work yet, but checks client
  return <div>Hello POS!</div>;
}