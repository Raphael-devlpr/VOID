'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { FileText, Upload, Download, Image, FileSpreadsheet, File, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface ProjectFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  description: string;
  created_at: string;
}

export function ClientProjectFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/client-portal/projects/${projectId}/files`);
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
    formData.append('description', description);

    try {
      const response = await fetch(`/api/client-portal/projects/${projectId}/files`, {
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

  const resetForm = () => {
    setSelectedFile(null);
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
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
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
      'client-upload': 'Your Upload',
    };
    return labels[type] || type;
  };

  const getFileTypeBadgeColor = (type: string, uploadedBy: string) => {
    if (uploadedBy === 'client') {
      return 'bg-blue-100 text-blue-800';
    }
    const colors: Record<string, string> = {
      'invoice': 'bg-green-100 text-green-800',
      'document': 'bg-purple-100 text-purple-800',
      'image': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Group files by type and uploader
  const adminFiles = files.filter(f => f.uploaded_by === 'admin');
  const clientFiles = files.filter(f => f.uploaded_by === 'client');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Project Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-green-600 border-r-transparent"></div>
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
            <FileText className="h-5 w-5 text-green-600" />
            Project Files
            {files.length > 0 && (
              <Badge className="bg-green-100 text-green-800">{files.length}</Badge>
            )}
          </CardTitle>
          {!showUploadForm && (
            <Button size="sm" onClick={() => setShowUploadForm(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showUploadForm && (
          <form onSubmit={handleUpload} className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Upload Your File</h4>
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
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  cursor-pointer"
                required
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this file for?"
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
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">No files yet</p>
            {!showUploadForm && (
              <Button size="sm" onClick={() => setShowUploadForm(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First File
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Files from Admin */}
            {adminFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    From VOID Tech
                  </Badge>
                  <span className="text-gray-500">({adminFiles.length})</span>
                </h4>
                <div className="space-y-2">
                  {adminFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-purple-200 bg-purple-50 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.file_name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file_name}
                          </p>
                          {file.description && (
                            <p className="text-xs text-gray-600 truncate">{file.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Badge className={getFileTypeBadgeColor(file.file_type, file.uploaded_by)}>
                              {getFileTypeLabel(file.file_type)}
                            </Badge>
                            <span>•</span>
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(file.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button size="sm" className="ml-4 bg-purple-600 hover:bg-purple-700">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Your Uploads */}
            {clientFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Your Uploads
                  </Badge>
                  <span className="text-gray-500">({clientFiles.length})</span>
                </h4>
                <div className="space-y-2">
                  {clientFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.file_name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file_name}
                          </p>
                          {file.description && (
                            <p className="text-xs text-gray-600 truncate">{file.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(file.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button size="sm" variant="ghost" className="ml-4">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
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
