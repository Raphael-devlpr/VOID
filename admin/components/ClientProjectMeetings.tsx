'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Video, MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration_minutes: number;
  meeting_link: string | null;
  meeting_type: 'online' | 'in-person' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_minutes: string | null;
  created_at: string;
}

export function ClientProjectMeetings({ projectId }: { projectId: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [projectId]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/client-portal/projects/${projectId}/meetings`);
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

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'online':
        return 'Online Meeting';
      case 'in-person':
        return 'In-Person Meeting';
      case 'phone':
        return 'Phone Call';
      default:
        return type;
    }
  };

  const isUpcoming = (meetingDate: string, status: string) => {
    if (status !== 'scheduled') return false;
    return new Date(meetingDate) > new Date();
  };

  const upcomingMeetings = meetings.filter(m => isUpcoming(m.meeting_date, m.status));
  const pastMeetings = meetings.filter(m => !isUpcoming(m.meeting_date, m.status));

  if (isLoading) {
    return (
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Meetings & Calls
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
    <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 break-words">
          <Calendar className="h-5 w-5 text-blue-600" />
          Meetings & Calls
          {meetings.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800">{meetings.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No meetings scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            {upcomingMeetings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Upcoming
                  <Badge className="bg-blue-100 text-blue-800">{upcomingMeetings.length}</Badge>
                </h4>
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5">
                            {getMeetingIcon(meeting.meeting_type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">{meeting.title}</h5>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(meeting.meeting_date)}
                              </span>
                              <span>•</span>
                              <span>{meeting.duration_minutes} minutes</span>
                              <span>•</span>
                              <span className="text-blue-700 font-medium">
                                {getMeetingTypeLabel(meeting.meeting_type)}
                              </span>
                            </div>
                            {meeting.description && (
                              <p className="text-sm text-gray-700 mb-2">{meeting.description}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                      </div>

                      {/* Join Button for Online Meetings */}
                      {meeting.meeting_type === 'online' && meeting.meeting_link && (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <Video className="h-4 w-4 mr-2" />
                            Join Online Meeting
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        </a>
                      )}

                      {/* Location for In-Person */}
                      {meeting.meeting_type === 'in-person' && meeting.meeting_link && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-200">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span><strong>Location:</strong> {meeting.meeting_link}</span>
                        </div>
                      )}

                      {/* Phone Number */}
                      {meeting.meeting_type === 'phone' && meeting.meeting_link && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-200">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span><strong>Phone:</strong> {meeting.meeting_link}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Meetings */}
            {pastMeetings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-gray-600" />
                  Past Meetings
                  <Badge className="bg-gray-100 text-gray-800">{pastMeetings.length}</Badge>
                </h4>
                <div className="space-y-3">
                  {pastMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5 text-gray-400">
                            {getMeetingIcon(meeting.meeting_type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">{meeting.title}</h5>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(meeting.meeting_date)}
                              </span>
                              <span>•</span>
                              <span>{meeting.duration_minutes} minutes</span>
                            </div>
                            {meeting.description && (
                              <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                      </div>

                      {/* Meeting Minutes (if completed) */}
                      {meeting.status === 'completed' && meeting.meeting_minutes && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-green-900 mb-1">Meeting Notes:</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.meeting_minutes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Import History icon
function History({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
