'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Project created successfully!');
        router.push('/projects');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create project');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-2 text-gray-600">Add a new client project to the system</p>
        </div>

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
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    label="Client Email"
                    name="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <Input
                  label="Client Phone (Optional)"
                  name="client_phone"
                  type="tel"
                  value={formData.client_phone}
                  onChange={handleChange}
                  placeholder="+27 12 345 6789"
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
                  placeholder="E-commerce Website"
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
                    label="Start Date (Optional)"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                  <Input
                    label="Due Date (Optional)"
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange}
                  />
                </div>
                <Textarea
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes about the project..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
                <Link href="/projects" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
