'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful!');
        router.push('/client/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Image 
              src="/logo.png" 
              alt="VOID Tech Solutions Logo" 
              width={120} 
              height={120}
              className="h-20 w-auto sm:h-24 md:h-28"
              priority
            />
          </div>
           <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Void Tech Solutions</h1>
          <h6 className="text-lg sm:text-xl font-semibold text-gray-700">Client Portal</h6>
         
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Login to view your project status</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
              
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
             
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isLoading ? 'Logging in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center border-t border-gray-200 pt-4">
              <Link 
                href="https://voidtechsolutions.co.za" 
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main Website
              </Link>

                 <p className="mt-2 text-sm text-gray-600">Need help? Contact <a href="mailto:admin@voidtechsolutions.co.za" className="text-blue-600 hover:underline">admin@voidtechsolutions.co.za</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
