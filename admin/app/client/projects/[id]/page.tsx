'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogOut, ArrowLeft, Calendar, Globe, MessageSquare, History } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import { ClientProjectMeetings } from '@/components/ClientProjectMeetings';
import { ClientProjectFiles } from '@/components/ClientProjectFiles';

export default function ClientProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/client/projects/${projectId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setHistory(data.history);
        setNotes(data.notes);
      } else if (response.status === 401) {
        router.push('/client/login');
      } else {
        toast.error('Project not found');
        router.push('/client/dashboard');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/client/projects/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
        toast.success('Note added successfully!');
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
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
          <p className="mt-4 text-gray-700 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/client/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-blue-600">VOID Client Portal</h1>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="/" 
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
        {/* Project Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.project_name}</h2>
              <p className="mt-1 text-gray-600">{project.project_type}</p>
            </div>
            <Badge className={`${getStatusColor(project.status)} text-sm px-4 py-2 w-fit`}>
              {project.status}
            </Badge>
          </div>
          
          {project.project_description && (
            <p className="text-gray-700">{project.project_description}</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Project Info */}
          <Card className="w-full max-w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-900">{project.start_date ? formatDate(project.start_date) : 'To be determined'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Due Date</label>
                <p className="text-gray-900">{project.due_date ? formatDate(project.due_date) : 'To be determined'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">{formatDate(project.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{formatDate(project.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card className="w-full max-w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No status changes yet</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="border-l-2 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                      </div>
                      {item.note && (
                        <p className="text-sm text-gray-600 mt-1">{item.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meetings & Calls */}
          <ClientProjectMeetings projectId={projectId} />

          {/* Project Files */}
          <ClientProjectFiles projectId={projectId} />
        </div>

        {/* Notes Section */}
        <Card className="mt-6 w-full max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Your Notes & Feedback
            </CardTitle>
            <CardDescription>
              Share updates, questions, or feedback with our team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-6">
              <Input
                label="Add a Note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type your message here..."
                multiline
                rows={3}
              />
              <Button 
                type="submit" 
                className="mt-3 w-full sm:w-auto" 
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </Button>
            </form>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No notes yet. Add your first note above!
                </p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(note.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
