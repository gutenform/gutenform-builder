import { __ } from "@/lib/i18n";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <Card className="mx-auto my-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{__('login')}</CardTitle>
        <CardDescription>
          {__('loginDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{__('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">{__('password')}</Label>
              <a href="#" className="ml-auto inline-block text-sm underline">
                {__('forgotPassword')}
              </a>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            {__('login')}
          </Button>
          <Button variant="outline" className="w-full">
            {__('loginWithGoogle')}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          {__('dontHaveAccount')}{" "}
          <a href="#" className="underline">
            {__('signUp')}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
