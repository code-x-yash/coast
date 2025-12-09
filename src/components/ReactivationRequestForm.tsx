import { useState } from 'react'
import { maritimeApi, Institute } from '@/api/maritimeMockApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ReactivationRequestFormProps {
  institute: Institute
  onSubmitSuccess: () => void
}

export function ReactivationRequestForm({ institute, onSubmitSuccess }: ReactivationRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    accreditation_no: institute.accreditation_no,
    valid_from: '',
    valid_to: '',
    contact_email: institute.contact_email || '',
    contact_phone: institute.contact_phone || '',
    address: institute.address || '',
    city: institute.city || '',
    state: institute.state || '',
    reason: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.valid_from || !form.valid_to) {
      toast({
        title: 'Validation Error',
        description: 'Please provide the new validity dates',
        variant: 'destructive'
      })
      return
    }

    const validFrom = new Date(form.valid_from)
    const validTo = new Date(form.valid_to)

    if (validTo <= validFrom) {
      toast({
        title: 'Validation Error',
        description: 'Valid To date must be after Valid From date',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      await maritimeApi.createReactivationRequest({
        instid: institute.instid,
        ...form
      })

      toast({
        title: 'Request Submitted Successfully',
        description: 'Your reactivation request has been submitted for admin review'
      })

      setOpen(false)
      onSubmitSuccess()
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto" size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Request Reactivation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Institute Reactivation Request</DialogTitle>
          <DialogDescription>
            Submit updated accreditation information for admin review and approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your institute accreditation has expired. Please provide updated information to reactivate your account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="accreditation_no">Accreditation Number</Label>
              <Input
                id="accreditation_no"
                value={form.accreditation_no}
                onChange={(e) => setForm({ ...form, accreditation_no: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Valid From</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={form.valid_from}
                  onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valid_to">Valid To</Label>
                <Input
                  id="valid_to"
                  type="date"
                  value={form.valid_to}
                  onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Reactivation (Optional)</Label>
              <Textarea
                id="reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Provide additional context for your reactivation request..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
