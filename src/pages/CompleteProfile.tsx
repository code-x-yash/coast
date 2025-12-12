import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Ship } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const maritimeRanks = [
  'Deck Cadet', 'Third Officer', 'Second Officer', 'Chief Officer', 'Captain',
  'Engine Cadet', 'Fourth Engineer', 'Third Engineer', 'Second Engineer', 'Chief Engineer'
]

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    dgshipping_id: '',
    rank: '',
    coc_number: '',
    date_of_birth: '',
    nationality: 'Indian'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be logged in to complete your profile')
      return
    }

    setLoading(true)

    try {
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          userid: user.id,
          dgshipping_id: formData.dgshipping_id || null,
          rank: formData.rank || null,
          coc_number: formData.coc_number || null,
          date_of_birth: formData.date_of_birth || null,
          nationality: formData.nationality
        })

      if (studentError) throw studentError

      toast({
        title: 'Profile Completed!',
        description: 'Your seafarer profile has been created successfully.',
      })

      navigate('/seafarer')
    } catch (err: any) {
      console.error('Profile creation error:', err)
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-slate-50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Ship className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Complete Your Seafarer Profile</h1>
            <p className="text-muted-foreground">
              Please provide your maritime credentials to continue
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Maritime Credentials</CardTitle>
              <CardDescription>
                Fill in your details to access courses and book training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dgshipping_id">DGShipping ID</Label>
                    <Input
                      id="dgshipping_id"
                      name="dgshipping_id"
                      type="text"
                      value={formData.dgshipping_id}
                      onChange={handleChange}
                      placeholder="IND-2020-JAN-0089456"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your DGShipping registration ID (optional)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rank">Rank / Position</Label>
                    <Select value={formData.rank} onValueChange={(value) => handleSelectChange('rank', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritimeRanks.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coc_number">Certificate of Competency (COC) Number</Label>
                    <Input
                      id="coc_number"
                      name="coc_number"
                      type="text"
                      value={formData.coc_number}
                      onChange={handleChange}
                      placeholder="COC-II-0089456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      type="text"
                      value={formData.nationality}
                      onChange={handleChange}
                      placeholder="Indian"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Creating Profile...' : 'Complete Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
