'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  MoreHorizontal,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFiles, useUploadFile, useDeleteFile } from '@/modules/files/hooks/useFiles';
import { filesApi } from '@/modules/files/api/filesApi';
import { usePagination } from '@/lib/hooks/usePagination';
import { formatDate } from '@/lib/utils/formatters';
import { toast } from 'sonner';
import type { FileRecord } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes('pdf') || mimeType.includes('text'))
    return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export default function FilesPage() {
  const pagination = usePagination();
  const inputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useFiles({ page: pagination.page, limit: 20 });
  const { mutate: upload, isPending: uploading } = useUploadFile();
  const { mutate: deleteFile, isPending: deleting } = useDeleteFile();

  const files = data?.data ?? [];

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload({ file });
    e.target.value = '';
  }

  async function handleDownload(file: FileRecord) {
    try {
      const { data: urlData } = await filesApi.getDownloadUrl(file.id);
      window.open(urlData.url, '_blank');
    } catch {
      toast.error('Failed to get download link.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Files" description="Upload and manage files in your workspace.">
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload file'}
        </Button>
        <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
      </PageHeader>

      <Card>
        {isLoading ? (
          <CardContent className="p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b px-6 py-4 last:border-0">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </CardContent>
        ) : files.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-1 font-semibold">No files yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload your first file to get started.
            </p>
            <Button onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload file
            </Button>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="border-b px-6 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                {data?.total} file{data?.total !== 1 ? 's' : ''}
              </p>
            </div>
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileIcon mimeType={file.mimeType} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{file.originalName}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(file.size)}</span>
                    <span>·</span>
                    <span>{formatDate(file.createdAt)}</span>
                    {file.resourceType && (
                      <>
                        <span>·</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {file.resourceType}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteId(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => pagination.setPage(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            Page {pagination.page} of {data?.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= (data?.totalPages ?? 1)}
            onClick={() => pagination.setPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete file"
        description="This file will be permanently deleted from storage. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleting}
        onConfirm={() => {
          if (deleteId) deleteFile(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </div>
  );
}
