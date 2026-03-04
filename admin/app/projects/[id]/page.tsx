'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Trash2, MessageSquare } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    project_name: '',
    project_type: 'website',
    status: 'pending',
    notes: '',
    start_date: '',
    due_date: '',
  });
  const [history, setHistory] = useState<any[]>([]);
  const [clientNotes, setClientNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          client_name: data.project.client_name || '',
          client_email: data.project.client_email || '',
          client_phone: data.project.client_phone || '',
          project_name: data.project.project_name || '',
          project_type: data.project.project_type || 'website',
          status: data.project.status || 'pending',
          notes: data.project.notes || '',
          start_date: data.project.start_date ? data.project.start_date.split('T')[0] : '',
          due_date: data.project.due_date ? data.project.due_date.split('T')[0] : '',
        });
        setHistory(data.history || []);
        setClientNotes(data.clientNotes || []);
      } else {
        toast.error('Project not found');
        router.push('/projects');
      }
    } catch (error) {
      toast.error('Failed to fetch project');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Project updated successfully!');
        fetchProject(); // Refresh data
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update project');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Project deleted successfully!');
        router.push('/projects');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete project');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Edit Project</h1>
          <p className="mt-2 text-gray-600">Update project details</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Client Name"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Client Email"
                      name="client_email"
                      type="email"
                      value={formData.client_email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Input
                    label="Client Phone"
                    name="client_phone"
                    type="tel"
                    value={formData.client_phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Project Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
                  <Input
                    label="Project Name"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Project Type"
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleChange}
                      options={[
                        { value: 'website', label: 'Website' },
                        { value: 'app', label: 'Mobile App' },
                        { value: 'software', label: 'Software' },
                        { value: 'design', label: 'Design' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'review', label: 'Review' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'on-hold', label: 'On Hold' },
                      ]}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Start Date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                    <Input
                      label="Due Date"
                      name="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                  <Textarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" isLoading={isLoading} className="flex-1">
                    {isLoading ? 'Updating...' : 'Update Project'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Status History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-0">
                      <Badge variant="status" status={item.status}>
                        {item.status}
                      </Badge>
                      <div className="flex-1">
                        {item.note && <p className="text-sm text-gray-900">{item.note}</p>}
                        <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Messages/Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Client Messages
                  {clientNotes.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {clientNotes.length}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {clientNotes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No messages from client yet
                </p>
              ) : (
                <div className="space-y-4">
                  {clientNotes.map((note, index) => (
                    <div 
                      key={note.id} 
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.note}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(note.created_at)}</p>
                        </div>
                        {index === 0 && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
