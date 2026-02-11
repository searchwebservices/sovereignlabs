"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInitiatives } from "@/hooks/use-initiatives";
import { useTeamMembers } from "@/hooks/use-team-members";
import { researchDocumentsApi } from "@/lib/supabase/api";
import type {
  ResearchDocument,
  ResearchDocumentStatus,
  ResearchDocumentWithRelations,
} from "@/lib/types/lab";

interface ResearchDocumentFormProps {
  document?: ResearchDocument | ResearchDocumentWithRelations;
  defaultInitiativeId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResearchDocumentForm({
  document,
  defaultInitiativeId = null,
  onSuccess,
  onCancel,
}: ResearchDocumentFormProps) {
  const { mutate } = useSWRConfig();
  const { data: initiatives } = useInitiatives();
  const { data: members } = useTeamMembers();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(document?.title || "");
  const [summary, setSummary] = useState(document?.summary || "");
  const [content, setContent] = useState(document?.content || "");
  const [storageUrl, setStorageUrl] = useState(document?.storage_url || "");
  const [driveFileId, setDriveFileId] = useState(document?.drive_file_id || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [sourceDocumentId, setSourceDocumentId] = useState(
    document?.source_document_id || ""
  );
  const [sourceChatId, setSourceChatId] = useState(document?.source_chat_id || "");
  const [status, setStatus] = useState<ResearchDocumentStatus>(
    document?.status || "draft"
  );
  const [initiativeId, setInitiativeId] = useState(
    document?.initiative_id || defaultInitiativeId || ""
  );
  const [createdBy, setCreatedBy] = useState(document?.created_by || "");

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Select a file first");
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("scope", "research_document");
      formData.append("isPublic", "false");

      const response = await fetch("/api/drive/files", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.data) {
        throw new Error(result?.error?.message || "Upload failed");
      }

      setDriveFileId(result.data.id);
      setStorageUrl(result.data.downloadUrl || `/api/drive/files/${result.data.id}`);
      setUploadedFileName(result.data.name);
      setSelectedFile(null);
      toast.success("File stored in internal drive");
    } catch (error) {
      console.error("Failed to upload research file:", error);
      toast.error("Failed to upload file to internal drive");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim() || null,
        content: content.trim() || null,
        storage_url: storageUrl.trim() || null,
        drive_file_id: driveFileId || null,
        source_document_id: sourceDocumentId.trim() || null,
        source_chat_id: sourceChatId.trim() || null,
        status,
        initiative_id: initiativeId || null,
        created_by: createdBy || null,
      };

      if (document) {
        await researchDocumentsApi.update(document.id, payload);
        toast.success("Research document updated");
      } else {
        await researchDocumentsApi.create(payload);
        toast.success("Research document saved");
      }

      mutate("lab:research-documents");
      mutate("lab:research-documents:final");
      onSuccess?.();
    } catch {
      toast.error(document ? "Failed to update document" : "Failed to save document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="research-title">Title *</Label>
        <Input
          id="research-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Final report: Robust SLAM baseline"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="research-status">Drive Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ResearchDocumentStatus)}
          >
            <SelectTrigger id="research-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="research-initiative">Initiative</Label>
          <Select
            value={initiativeId || "__none__"}
            onValueChange={(value) =>
              setInitiativeId(value === "__none__" ? "" : value)
            }
          >
            <SelectTrigger id="research-initiative">
              <SelectValue placeholder="Select initiative..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {(initiatives || []).map((initiative) => (
                <SelectItem key={initiative.id} value={initiative.id}>
                  {initiative.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="research-author">Owner</Label>
          <Select
            value={createdBy || "__none__"}
            onValueChange={(value) =>
              setCreatedBy(value === "__none__" ? "" : value)
            }
          >
            <SelectTrigger id="research-author">
              <SelectValue placeholder="Select owner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {(members || []).map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label htmlFor="research-drive-file">Internal Drive File</Label>
        <Input
          id="research-drive-file"
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadFile}
            disabled={uploadingFile || !selectedFile}
          >
            {uploadingFile ? "Uploading..." : "Upload To Internal Drive"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {uploadedFileName ||
              document?.storage_url?.split("/").pop() ||
              "No file linked"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="research-summary">Summary</Label>
        <Textarea
          id="research-summary"
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Short abstract for search and indexing..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="research-content">Content</Label>
        <Textarea
          id="research-content"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Final notes, findings, methodology, and decisions..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="research-storage-url">Internal URL</Label>
          <Input
            id="research-storage-url"
            value={storageUrl}
            readOnly
            placeholder="/api/drive/files/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="research-source-document">Source Document ID</Label>
          <Input
            id="research-source-document"
            value={sourceDocumentId}
            onChange={(e) => setSourceDocumentId(e.target.value)}
            placeholder="Optional UUID"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="research-source-chat">Source Chat ID</Label>
          <Input
            id="research-source-chat"
            value={sourceChatId}
            onChange={(e) => setSourceChatId(e.target.value)}
            placeholder="Optional UUID"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : document
              ? "Update Document"
              : "Save Document"}
        </Button>
      </div>
    </form>
  );
}
