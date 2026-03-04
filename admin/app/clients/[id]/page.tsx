'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Trash2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    is_active: true,
  });

  useEffect(() => {
    fetchSession();
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const session = await response.json();
        setAdminName(session.name || 'Admin');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch client');
      }

      setClient(data.client);
      setProjects(data.projects || []);
      setFormData({
        name: data.client.name,
        email: data.client.email,
        password: '',
        company: data.client.company || '',
        phone: data.client.phone || '',
        is_active: data.client.is_active,
      });
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error('Failed to load client details');
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        phone: formData.phone || null,
        is_active: formData.is_active,
        ...(formData.password && { password: formData.password }),
      };

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update client');
      }

      toast.success('Client updated successfully!');
      router.push('/clients');
      router.refresh();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete client');
      }

      toast.success('Client deleted successfully!');
      router.push('/clients');
      router.refresh();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar adminName={adminName} />
        <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading client details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar adminName={adminName} />
      
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Link href="/clients">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Edit Client
              </h1>
              <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600">
                Manage client portal account
              </p>
            </div>
            <Badge className={client.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {client.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Client Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Only enter a password if you want to change it</p>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 12 345 6789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Account</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Inactive accounts cannot login to the portal
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Link href="/clients" className="flex-1">
                    <Button type="button" variant="ghost" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Linked Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Linked Projects ({projects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-sm">No projects linked to this client yet</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{project.status}</p>
                      </div>
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-900">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Delete Client</h3>
                  <p className="text-sm text-gray-600">
                    {projects.length > 0
                      ? 'You must unlink all projects before deleting this client.'
                      : 'Permanently delete this client account. This action cannot be undone.'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created {formatDate(client.created_at)}
                  </p>
                </div>
                <Button
                  onClick={handleDelete}
                  disabled={deleting || projects.length > 0}
                  variant="danger"
                  className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
