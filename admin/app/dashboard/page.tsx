import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FolderOpen, Key, Users, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
  try {
    const session = await requireAuth();

    // Fetch dashboard stats
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: pins, error: pinsError } = await supabase
      .from('software_pins')
      .select('*');

    if (projectsError || pinsError) {
      throw new Error('Failed to fetch dashboard data');
    }

    // Calculate stats
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'in-progress').length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
    const totalPins = pins?.length || 0;
    const usedPins = pins?.filter(p => p.is_used).length || 0;
    const availablePins = totalPins - usedPins;

    // Get recent projects
    const recentProjects = projects?.slice(0, 5) || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar adminName={session.name} />
        
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {session.name}!</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {activeProjects} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  In progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Available PINs</CardTitle>
                <Key className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availablePins}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {usedPins} used / {totalPins} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No projects yet.</p>
                  <Link href="/projects/new">
                    <Button className="mt-4">Create Your First Project</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {project.project_name}
                        </Link>
                        <p className="text-sm text-gray-500">{project.client_name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="status" status={project.status}>
                          {project.status}
                        </Badge>
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
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
