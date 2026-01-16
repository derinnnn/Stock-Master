import { redirect } from 'next/navigation'
import { createClient } from './utils/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/auth/signin')
  }
}//Allow me to see you baby. Which one be say you dey for Wuse-se (Kilo)