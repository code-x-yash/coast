import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { api, Institute } from '@/services/api'

interface ReactivationRequestFormProps {
  institute: Institute
  onSubmitSuccess: () => void
}

export function ReactivationRequestForm({ institute, onSubmitSuccess }: ReactivationRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    new_accreditation_no: institute.accreditation_no,
    new_valid_from: '',
    new_valid_to: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.new_valid_from || !form.new_valid_to) {
      toast({
        title: 'Validation Error',
        description: 'Please provide the new validity dates',
        variant: 'destructive'
      })
      return
    }

    const validFrom = new Date(form.new_valid_from)
    const validTo = new Date(form.new_valid_to)

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
      await api.createReactivationRequest({
        instid: institute.instid,
        accreditation_no: form.new_accreditation_no,
        valid_from: form.new_valid_from,
        valid_to: form.new_valid_to
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
              <Label htmlFor="new_accreditation_no">New Accreditation Number</Label>
              <Input
                id="new_accreditation_no"
                value={form.new_accreditation_no}
                onChange={(e) => setForm({ ...form, new_accreditation_no: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new_valid_from">Valid From</Label>
                <Input
                  id="new_valid_from"
                  type="date"
                  value={form.new_valid_from}
                  onChange={(e) => setForm({ ...form, new_valid_from: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_valid_to">Valid To</Label>
                <Input
                  id="new_valid_to"
                  type="date"
                  value={form.new_valid_to}
                  onChange={(e) => setForm({ ...form, new_valid_to: e.target.value })}
                  required
                />
              </div>
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
