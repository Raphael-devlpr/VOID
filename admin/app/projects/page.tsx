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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar adminName={session.name} />
        
        <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Projects</h1>
              <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600">Manage all your client projects 📁</p>
            </div>
            <Link href="/projects/new">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>

          {/* Projects List */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">All Projects ({projects?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!projects || projects.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mb-4 text-6xl">📁</div>
                  <p className="text-gray-500 mb-6 text-lg">No projects yet.</p>
                  <Link href="/projects/new">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
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
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5">
                            <Link
                              href={`/projects/${project.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {project.project_name}
                            </Link>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{project.client_name}</div>
                              <div className="text-gray-500 mt-0.5">{project.client_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-gray-700">
                            {project.project_type || 'N/A'}
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="status" status={project.status}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-600">
                            {formatDate(project.created_at)}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
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
