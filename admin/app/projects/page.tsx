import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ProjectsPage() {
  try {
    const session = await requireAuth();

    // Fetch all projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch projects');
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar adminName={session.name} />
        
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="mt-2 text-gray-600">Manage all your client projects</p>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>

          {/* Projects List */}
          <Card>
            <CardHeader>
              <CardTitle>All Projects ({projects?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!projects || projects.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No projects yet.</p>
                  <Link href="/projects/new">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Project
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Created
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <Link
                              href={`/projects/${project.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600"
                            >
                              {project.project_name}
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{project.client_name}</div>
                              <div className="text-gray-500">{project.client_email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {project.project_type || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="status" status={project.status}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(project.created_at)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
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
  } catch (error) {
    redirect('/login');
  }
}
