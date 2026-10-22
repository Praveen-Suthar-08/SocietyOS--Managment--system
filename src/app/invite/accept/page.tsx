'use client';

import * as React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function AcceptInvitePage() {
  const [token, setToken] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirmPassword) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#276749]/15">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#276749] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-2xl text-[#17231D]">
            SocietyOS
          </span>
        </Link>
        <h1 className="text-2xl font-display font-bold text-[#17231D]">
          Accept Society Invitation
        </h1>
        <p className="mt-1 text-sm text-[#66716A]">
          Set your credentials to activate your assigned resident or security account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Onboarding Credentials</CardTitle>
                <CardDescription>
                  Enter the single-use invitation token provided in your onboarding email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Invitation Token"
                  type="text"
                  placeholder="e.g. inv_89af32bc7190..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                <Input
                  label="Create Password"
                  type="password"
                  placeholder="Minimum 12 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={
                    confirmPassword && password !== confirmPassword
                      ? 'Passwords do not match'
                      : undefined
                  }
                  required
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Activate Account
                </Button>
                <Link href="/sign-in" className="text-xs text-[#66716A] hover:underline text-center">
                  Already activated? Return to Sign In
                </Link>
              </CardFooter>
            </form>
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EAF3ED] text-[#276749] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17231D]">Invitation Verified</h3>
              <p className="text-sm text-[#66716A]">
                Your account credentials have been configured. You may now proceed to sign in.
              </p>
              <Link href="/sign-in">
                <Button variant="primary" size="md" className="w-full">
                  Proceed to Sign In
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
