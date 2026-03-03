'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Copy, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function PinsPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [pins, setPins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pinCount, setPinCount] = useState(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchPins();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (!response.ok) {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchPins = async () => {
    try {
      const response = await fetch('/api/pins');
      if (response.ok) {
        const data = await response.json();
        setPins(data.pins || []);
      } else {
        toast.error('Failed to fetch PINs');
      }
    } catch (error) {
      toast.error('An error occurred while fetching PINs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePins = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: pinCount }),
      });

      if (response.ok) {
        toast.success(`Generated ${pinCount} new PIN(s)!`);
        fetchPins();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to generate PINs');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    toast.success('PIN copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = {
    total: pins.length,
    used: pins.filter(p => p.is_used).length,
    available: pins.filter(p => !p.is_used).length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar adminName={adminName} />
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading PINs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar adminName={adminName} />
      <Toaster position="top-right" />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Software PIN Manager</h1>
          <p className="mt-2 text-lg text-gray-600">Generate and manage software activation PINs 🔑</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total PINs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.used}</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate PINs */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl font-bold text-gray-900">Generate New PINs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="number"
                min="1"
                max="100"
                value={pinCount}
                onChange={(e) => setPinCount(parseInt(e.target.value) || 1)}
                className="max-w-xs"
                placeholder="Number of PINs"
                label="PIN Count"
              />
              <Button onClick={handleGeneratePins} isLoading={isGenerating} className="gap-2 self-end">
                <Plus className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate PINs'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PINs List */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">All PINs ({pins.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pins.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mb-4 text-6xl">🔑</div>
                <p className="text-gray-500 text-lg mb-2">No PINs generated yet.</p>
                <p className="text-sm text-gray-400">Generate some PINs to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        PIN Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Used By
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Used At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pins.map((pin) => (
                      <tr key={pin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5">
                          <code className="rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2 text-sm font-mono font-semibold text-gray-900">
                            {pin.pin}
                          </code>
                        </td>
                        <td className="px-6 py-5">
                          <Badge
                            className={pin.is_used ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}
                          >
                            {pin.is_used ? 'Used' : 'Available'}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-700">
                          {pin.used_by_ip || 'N/A'}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {pin.used_at ? formatDate(pin.used_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {formatDate(pin.created_at)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(pin.pin, pin.id)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            {copiedId === pin.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
