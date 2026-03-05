'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Video, Phone, MapPin, Clock, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';

interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration_minutes: number;
  meeting_link: string;
  meeting_type: 'online' | 'in-person' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_minutes: string;
  created_at: string;
  updated_at: string;
}

export function ProjectMeetings({ projectId }: { projectId: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    duration_minutes: 60,
    meeting_link: '',
    meeting_type: 'online' as 'online' | 'in-person' | 'phone',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    meeting_minutes: '',
  });

  useEffect(() => {
    fetchMeetings();
  }, [projectId]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/meetings`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const meetingDateTime = `${formData.meeting_date}T${formData.meeting_time}:00`;

    const meetingData = {
      title: formData.title,
      description: formData.description,
      meeting_date: meetingDateTime,
      duration_minutes: formData.duration_minutes,
      meeting_link: formData.meeting_link,
      meeting_type: formData.meeting_type,
      status: formData.status,
      meeting_minutes: formData.meeting_minutes,
    };

    try {
      const url = editingId 
        ? `/api/meetings/${editingId}`
        : `/api/projects/${projectId}/meetings`;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        toast.success(editingId ? 'Meeting updated!' : 'Meeting created!');
        fetchMeetings();
        resetForm();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save meeting');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleEdit = (meeting: Meeting) => {
    const meetingDate = new Date(meeting.meeting_date);
    const date = meetingDate.toISOString().split('T')[0];
    const time = meetingDate.toTimeString().slice(0, 5);

    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      meeting_date: date,
      meeting_time: time,
      duration_minutes: meeting.duration_minutes,
      meeting_link: meeting.meeting_link || '',
      meeting_type: meeting.meeting_type,
      status: meeting.status,
      meeting_minutes: meeting.meeting_minutes || '',
    });
    setEditingId(meeting.id);
    setShowAddForm(true);
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Delete this meeting?')) return;

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Meeting deleted');
        fetchMeetings();
      } else {
        toast.error('Failed to delete meeting');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      meeting_date: '',
      meeting_time: '',
      duration_minutes: 60,
      meeting_link: '',
      meeting_type: 'online',
      status: 'scheduled',
      meeting_minutes: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'online': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meetings
            {meetings.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800">{meetings.length}</Badge>
            )}
          </CardTitle>
          {!showAddForm && (
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">
                {editingId ? 'Edit Meeting' : 'New Meeting'}
              </h4>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Input
              label="Meeting Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Project Kickoff Meeting"
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Meeting agenda and topics..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                required
              />
              <Input
                label="Time"
                type="time"
                value={formData.meeting_time}
                onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Meeting Type"
                value={formData.meeting_type}
                onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value as any })}
                options={[
                  { value: 'online', label: 'Online (Video Call)' },
                  { value: 'in-person', label: 'In-Person' },
                  { value: 'phone', label: 'Phone Call' },
                ]}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                min="15"
                step="15"
              />
            </div>

            <Input
              label={formData.meeting_type === 'in-person' ? 'Location/Address' : 'Meeting Link (Zoom, Google Meet, etc.)'}
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              placeholder={formData.meeting_type === 'in-person' ? 'Office address or location' : 'https://zoom.us/j/...'}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />

            {formData.status === 'completed' && (
              <Textarea
                label="Meeting Minutes/Notes"
                value={formData.meeting_minutes}
                onChange={(e) => setFormData({ ...formData, meeting_minutes: e.target.value })}
                rows={4}
                placeholder="Summary of what was discussed..."
              />
            )}

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Meeting' : 'Create Meeting'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {meetings.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No meetings scheduled yet
          </p>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getMeetingIcon(meeting.meeting_type)}
                      <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>

                    {meeting.description && (
                      <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(meeting.meeting_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.duration_minutes} min
                      </div>
                    </div>

                    {meeting.meeting_link && (
                      <div className="mt-2">
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {meeting.meeting_type === 'in-person' ? (
                            <>
                              <MapPin className="h-3 w-3" />
                              {meeting.meeting_link}
                            </>
                          ) : (
                            <>
                              <Video className="h-3 w-3" />
                              Join Meeting
                            </>
                          )}
                        </a>
                      </div>
                    )}

                    {meeting.meeting_minutes && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-medium text-green-900 mb-1">Meeting Notes:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {meeting.meeting_minutes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(meeting)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(meeting.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
