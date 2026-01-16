import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Please log in</div>

  // Fetch the saved business details
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your business preferences</p>
        </div>
        
        {/* Pass the fetched data to the form */}
        <SettingsClient initialData={business} />
      </div>
    </AppLayout>
  )
}