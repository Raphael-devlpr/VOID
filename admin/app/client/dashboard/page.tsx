'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LogOut, FolderOpen, ArrowRight, Globe } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/client/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
        setProjects(data.projects);
      } else {
        router.push('/client/login');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      router.push('/client/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/client/logout', { method: 'POST' });
    router.push('/client/login');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'data-received': 'bg-cyan-100 text-cyan-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'awaiting-content': 'bg-orange-100 text-orange-800',
      'review': 'bg-purple-100 text-purple-800',
      'invoice-sent': 'bg-indigo-100 text-indigo-800',
      'invoice-paid': 'bg-emerald-100 text-emerald-800',
      'deployed': 'bg-teal-100 text-teal-800',
      'completed': 'bg-green-100 text-green-800',
      'maintenance': 'bg-amber-100 text-amber-800',
      'on-hold': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="VOID Tech Solutions Logo" 
                width={40} 
                height={40}
                className="h-8 w-auto sm:h-10"
                priority
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-blue-600">VOID Client Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Welcome, {client?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://voidtechsolutions.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Website</span>
              </a>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Projects</h2>
          <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600">
            Track progress and communicate with our team
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600">Your projects will appear here once they're created.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-xl transition-all duration-200 flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                      {project.project_name}
                    </CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  {project.project_type && (
                    <p className="text-sm text-gray-500 mt-1">{project.project_type}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    {project.project_description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {project.project_description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Started: {project.start_date ? formatDate(project.start_date) : 'TBD'}</span>
                    </div>
                  </div>
                  <Link href={`/client/projects/${project.id}`}>
                    <Button className="w-full gap-2">
                      View 
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
