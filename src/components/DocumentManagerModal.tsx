import React, { useState } from 'react';
import { X, Upload, FileText, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { UploadedDocument } from '../types/research';

interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: UploadedDocument[];
  onAddDocument: (doc: UploadedDocument) => void;
  onRemoveDocument: (id: string) => void;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  documents,
  onAddDocument,
  onRemoveDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();

        const newDoc: UploadedDocument = {
          id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content: text,
          chunkCount: Math.max(1, Math.ceil(text.length / 500)),
          uploadedAt: new Date().toISOString(),
        };

        onAddDocument(newDoc);
      }
    } catch (err) {
      console.error('File read error:', err);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handlePastedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedTitle.trim() || !pastedContent.trim()) return;

    const newDoc: UploadedDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: pastedTitle.trim(),
      size: Buffer.byteLength(pastedContent, 'utf8'),
      type: 'text/plain',
      content: pastedContent.trim(),
      chunkCount: Math.max(1, Math.ceil(pastedContent.length / 500)),
      uploadedAt: new Date().toISOString(),
    };

    onAddDocument(newDoc);
    setPastedTitle('');
    setPastedContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Reference Documents & RAG Knowledge Base
            </h3>
            <p className="text-xs text-slate-500">
              Attach whitepapers, architecture specs, or benchmark data. They will be chunked and indexed in vector memory.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Method Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`text-xs font-medium pb-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Upload Text/Markdown/Code File
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('paste')}
              className={`text-xs font-medium pb-1.5 transition-colors ${
                activeTab === 'paste'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Paste Raw Technical Text
            </button>
          </div>

          {/* Upload Drop Area */}
          {activeTab === 'upload' ? (
            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20">
              <Upload className="w-8 h-8 text-indigo-500 mb-2" />
              <div className="text-sm font-semibold text-slate-800 mb-1">
                Click to upload reference documents
              </div>
              <p className="text-xs text-slate-500 max-w-sm mb-3">
                Supports .txt, .md, .json, .csv, and code files. Chunks will be embedded via Gemini Embedding models.
              </p>
              <input
                type="file"
                multiple
                accept=".txt,.md,.markdown,.json,.csv,.js,.ts,.py,.html"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Select Files</span>
              </span>
            </label>
          ) : (
            <form onSubmit={handlePastedSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Title / Source Label
                </label>
                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="e.g. Internal RFC: Front-end architecture 2026"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Content
                </label>
                <textarea
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Paste benchmark results, architecture guidelines, or specification text..."
                  rows={5}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!pastedTitle.trim() || !pastedContent.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Index Document</span>
                </button>
              </div>
            </form>
          )}

          {/* Active Documents List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Active Attached Documents ({documents.length})
              </span>
              <span className="text-xs text-slate-500">
                Indexed in vector RAG
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                No custom documents attached yet. The agent will rely on live Google Search Grounding.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {Math.round(doc.size / 1024)} KB · ~{doc.chunkCount} vector chunks
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
