'use client';

import React, { useRef, useState } from 'react';
import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Calendar, UploadSimple } from '@phosphor-icons/react';

type UploadedResume = {
  _id: string;
  name: string;
  objectPath: string;
  contentType: string;
  size: number;
  uploadDate: string;
  isPublic?: boolean;
  version?: number;
};

function inferMimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt': return 'text/plain';
    case 'md': return 'text/markdown';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'csv': return 'text/csv';
    case 'json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

export default function ResumesPage() {
  const { getToken, isSignedIn } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedResume | null>(null);

  const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_RESUME_MB || 20);
  const ACCEPT = 'application/pdf';
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend';

  const openPicker = () => inputRef.current?.click();

  const doUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Validate size; type will be inferred if missing
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > MAX_MB) throw new Error(`File too large. Max allowed is ${MAX_MB} MB`);

      const token = await getToken({ template });
      if (!token) throw new Error('Not authenticated. No token from Clerk.');

      // Ensure we have a solid contentType
      const contentType = file.type || inferMimeFromName(file.name);

      // 1) Ask backend for signed PUT URL
      const reqRes = await httpClient.request<{
        uploadUrl: string;
        objectPath: string;
        headers: Record<string, string>;
      }>('/assets/request-upload', {
        method: 'POST',
        body: {
          projectId: 'resume',
          filename: file.name,
          contentType, // use our inferred or real type
          size: file.size,
        },
        requiresAuth: true,
        token,
      });

      if (!reqRes.success) {
        throw new Error(reqRes.error || 'Failed to get upload URL');
      }

      const { uploadUrl, objectPath, headers } = reqRes.data;

      // 2) PUT to GCS with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        // Respect headers returned by server (Content-Type is critical)
        Object.entries(headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, String(v)));

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onerror = () => reject(new Error('Network error while uploading to storage'));
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.send(file);
      });

      // 3) Confirm to persist Asset in DB
      const confirmRes = await httpClient.request<{ asset: any }>(
        '/assets/confirm',
        {
          method: 'POST',
          body: {
            projectId: 'resume',
            objectPath,
            contentType,
            size: file.size,
          },
          requiresAuth: true,
          token,
        }
      );
      if (!confirmRes.success) throw new Error(confirmRes.error || 'Failed to confirm upload');

      const saved = confirmRes.data.asset;
      setUploaded({
        _id: saved._id,
        name: file.name,
        objectPath,
        contentType,
        size: file.size,
        uploadDate: new Date().toISOString(),
      });

      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 800);
    }
  };

  return (
    <DashboardLayout currentSection="resumes">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resumes' }]} />

      <SignedOut>
        <Card className="max-w-xl mx-auto mt-10">
          <CardHeader><CardTitle>Sign in required</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">You must sign in to upload your resume.</p>
            <SignInButton mode="modal"><Button>Sign in</Button></SignInButton>
          </CardContent>
        </Card>
      </SignedOut>

      <SignedIn>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Versions</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Upload a PDF resume; it will be stored in Google Cloud Storage and referenced in your DB.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) doUpload(f);
                  e.currentTarget.value = '';
                }}
              />
              <Button onClick={openPicker} disabled={uploading || !isSignedIn}>
                <UploadSimple className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading…' : 'Upload New Resume'}
              </Button>
            </div>
          </div>

          {(progress !== null || error) && (
            <Card>
              <CardContent className="py-4">
                {error ? (
                  <div className="text-red-600 text-sm">{error}</div>
                ) : (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Uploading… {progress ?? 0}%
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded h-2 mt-2">
                      <div className="h-2 rounded transition-all bg-blue-600" style={{ width: `${progress ?? 0}%` }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {uploaded && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{uploaded.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">PDF</Badge>
                        <span className="text-xs text-gray-500">
                          {(uploaded.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Stored at: ' + uploaded.objectPath)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview (dev)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Add GET signed URL endpoint to enable direct download.')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download (todo)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Uploaded: {new Date(uploaded.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Stored at: {uploaded.objectPath}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Private</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!uploaded && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resumes uploaded</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Upload your resume to share with potential employers.</p>
                <Button onClick={openPicker} disabled={!isSignedIn}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Your First Resume
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SignedIn>
    </DashboardLayout>
  );
}
