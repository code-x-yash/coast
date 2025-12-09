import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface NotFoundProps {
  onNavigate: (page: string) => void
}

export default function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            404 - Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => onNavigate('home')} className="w-full">
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
