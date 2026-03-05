'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Upload, Download, Trash2, X, File, Image, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface ProjectFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_by_id: string;
  description: string;
  created_at: string;
}

export function ProjectFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('document');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileType', fileType);
    formData.append('description', description);

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('File uploaded successfully!');
        fetchFiles();
        resetForm();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to upload file');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('File deleted');
        fetchFiles();
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileType('document');
    setDescription('');
    setShowUploadForm(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-4 w-4" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getFileTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'invoice': 'Invoice',
      'document': 'Document',
      'image': 'Image',
      'client-upload': 'Client Upload',
    };
    return labels[type] || type;
  };

  const getFileTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'invoice': 'bg-green-100 text-green-800',
      'document': 'bg-blue-100 text-blue-800',
      'image': 'bg-purple-100 text-purple-800',
      'client-upload': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const groupedFiles = files.reduce((acc, file) => {
    const type = file.file_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {} as Record<string, ProjectFile[]>);

  if (isLoading) {
    return (
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Files
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 break-words">
            <FileText className="h-5 w-5" />
            Project Files
            {files.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800">{files.length}</Badge>
            )}
          </CardTitle>
          {!showUploadForm && (
            <Button size="sm" onClick={() => setShowUploadForm(true)} className="h-8 sm:h-9">
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Upload File</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showUploadForm && (
          <form onSubmit={handleUpload} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Upload New File</h4>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File (Max 50MB)
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
                required
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <Select
              label="File Type"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              options={[
                { value: 'invoice', label: 'Invoice' },
                { value: 'document', label: 'Document' },
                { value: 'image', label: 'Image/Design' },
              ]}
            />

            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of the file..."
            />

            <div className="flex gap-2">
              <Button type="submit" isLoading={isUploading} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {files.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No files uploaded yet
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFiles).map(([type, typeFiles]) => (
              <div key={type}>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Badge className={getFileTypeBadgeColor(type)}>
                    {getFileTypeLabel(type)}
                  </Badge>
                  <span className="text-gray-500">({typeFiles.length})</span>
                </h4>
                <div className="space-y-2">
                  {typeFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-start sm:items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {getFileIcon(file.file_name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {file.file_name}
                          </p>
                          {file.description && (
                            <p className="text-xs text-gray-500 break-words">{file.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(file.created_at)}</span>
                            <span>•</span>
                            <span className="capitalize">{file.uploaded_by}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(file.id)}
                          className="hover:bg-red-50 hover:text-red-600 h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
