import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Users, Mail, Phone, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ClientsPage() {
  try {
    const session = await requireAuth();

    // Fetch all clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch clients');
    }

    // Get project counts for each client
    const clientsWithProjects = await Promise.all(
      (clients || []).map(async (client) => {
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', client.id);
        
        return {
          ...client,
          projectCount: projects?.length || 0,
        };
      })
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar adminName={session.name} />
        
        <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Clients</h1>
              <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600">
                Manage client portal accounts 👥
              </p>
            </div>
            <Link href="/clients/new">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New Client
              </Button>
            </Link>
          </div>

          {/* Clients Grid */}
          {!clientsWithProjects || clientsWithProjects.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clients Yet</h3>
                <p className="text-gray-600 mb-6">Create your first client to enable portal access</p>
                <Link href="/clients/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Client
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clientsWithProjects.map((client) => (
                <Card key={client.id} className="hover:shadow-xl transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {client.name}
                        </CardTitle>
                        {client.company && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {client.company}
                          </p>
                        )}
                      </div>
                      <Badge className={client.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Projects:</span>
                        <span className="font-semibold text-gray-900">{client.projectCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>Created:</span>
                        <span>{formatDate(client.created_at)}</span>
                      </div>
                    </div>
                    <Link href={`/clients/${client.id}`} className="block">
                      <Button variant="ghost" className="w-full mt-2">
                        Manage Client
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
  } catch (error) {
    redirect('/login');
  }
}
