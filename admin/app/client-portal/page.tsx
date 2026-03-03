'use client';

import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function ClientPortalPage() {
  const [email, setEmail] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setNotFound(false);
    setProject(null);
    setHistory([]);

    try {
      const response = await fetch(`/api/client-portal?email=${encodeURIComponent(email)}&id=${projectId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setHistory(data.history || []);
      } else if (response.status === 404) {
        setNotFound(true);
        toast.error('Project not found. Please check your email and project ID.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <Toaster position="top-right" />
      
      <main className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">VOID Tech Solutions</h1>
          <p className="mt-2 text-lg text-gray-600">Client Project Portal</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Track Your Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                label="Your Email Address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Project ID"
                placeholder="Enter your project ID (e.g., 1)"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={isSearching}>
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? 'Searching...' : 'Find My Project'}
              </Button>
            </form>

            {notFound && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  No project found with the provided information. Please check your email and project ID, or contact us for assistance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Details */}
        {project && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.project_name}</CardTitle>
                  <Badge variant="status" status={project.status}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Client Name</p>
                    <p className="mt-1 text-gray-900">{project.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project Type</p>
                    <p className="mt-1 text-gray-900">{project.project_type || 'N/A'}</p>
                  </div>
                  {project.start_date && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Start Date</p>
                      <p className="mt-1 text-gray-900">{formatDate(project.start_date)}</p>
                    </div>
                  )}
                  {project.due_date && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Due Date</p>
                      <p className="mt-1 text-gray-900">{formatDate(project.due_date)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="mt-1 text-gray-900">{formatDate(project.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="mt-1 text-gray-900">{formatDate(project.updated_at)}</p>
                  </div>
                </div>
                {project.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="mt-1 text-gray-900">{project.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Timeline */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                          </div>
                          {index !== history.length - 1 && (
                            <div className="h-full w-0.5 bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-2">
                            <Badge variant="status" status={item.status}>
                              {item.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          {item.note && (
                            <p className="mt-2 text-sm text-gray-900">{item.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-center text-sm text-gray-600">
                  Questions about your project? Contact us at{' '}
                  <a href="mailto:admin@voidtechsolutions.co.za" className="font-medium text-blue-600 hover:text-blue-700">
                    admin@voidtechsolutions.co.za
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
