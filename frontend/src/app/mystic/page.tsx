/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert2";
import { Progress } from "@/components/ui/progress2";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search,
  BookOpen,
  Shield,
  Zap,
  Clock,
  Globe,
  Lock,
  AlertTriangle,
  Eye,
  Upload as UploadIcon,
  Send,
  FileText,
  Sparkles,
  Crown,
  Flame,
  CheckCircle,
  Scroll,
  Star,
  Target,
  ArrowRight,
  ArrowLeft,
  Filter,
  Plus,
  Info,
  MessageSquare,
  Image,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

// 🔑 Use the real helpers (remove the hardcoded mocks)
import { fetchJson, humanizeError } from '@/utils/http';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

export default function MysticRAGChat() {
  // Utility helpers
  const getSafeValue = (value: any, fallback: string = 'Data not available') => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return fallback;
    }
    return value;
  };

  const getSafeArray = (value: any): string[] => {
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
    return ['No tags available'];
  };

  // Archive state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPowerClass, setSelectedPowerClass] = useState('all');
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RAG Chat state
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'system',
      content:
        'Welcome to the Mystic Archive RAG Chat. Upload a mystical document (PDF or DOCX) and ask questions about its contents.',
    },
  ]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Autoscroll chat
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  // (Optional) cosmetic search demo
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiSearching(true);
  
    try {
      const response = await fetch("http://localhost:8080/api/mystic/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
          limit: 5,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      const aiResponse = data.data;
      console.log("🔮 Mystic RAG Response:", aiResponse);
  
      // Display only the answer field
      setAiResponse(data.data.answer || "No answer received");
    } catch (error) {
      console.error("❌ RAG search failed:", error);
      setAiResponse("Error occurred while searching");
    } finally {
      setIsAiSearching(false);
    }
  };
  

  // Fetch artifacts (keep but remove double loop + logs)
  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Example endpoint placeholder; adjust or remove as needed
      const endpoints = [
        'http://localhost:8080/api/mystic/spells',
      ];

      const allArtifacts: any[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) continue;
          const data = await response.json();
          const spells = data?.data ?? data;

          if (Array.isArray(spells)) {
            const normalized = spells.map((item: any) => ({
              id: item.pageid?.toString() || item.id || item._id || Math.random().toString(36).slice(2),
              name: item.title || item.name || item.spellName || 'Unnamed Spell',
              description: item.summary || item.description || item.effect || 'No description available',
              type: 'Spell',
              powerClass: item.powerClass || item.level || item.difficulty || 'Intermediate',
              accessLevel: item.accessLevel || item.restriction || 'Public',
              origin: item.origin || item.source || item.location || 'Marvel Universe',
              language: item.language || item.script || 'Ancient',
              energySignature: item.energySignature || item.element || item.affinity || 'Mystical',
              author: item.author || item.creator || item.master || 'Unknown',
              dateAdded: item.dateAdded || item.createdAt || item.discovered || new Date().toISOString(),
              tags: Array.isArray(item.categories) ? item.categories :
                    Array.isArray(item.tags) ? item.tags :
                    Array.isArray(item.keywords) ? item.keywords :
                    Array.isArray(item.elements) ? item.elements : ['mystical'],
              imageUrl: item.imageUrl || item.image || item.icon || null,
              castingTime: item.castingTime || item.duration || null,
              range: item.range || item.area || null,
              components: item.components || item.ingredients || null,
              durability: item.durability || item.condition || null,
              enchantments: item.enchantments || item.magicalProperties || null,
              pages: item.pages || item.chapters || null,
              difficulty: item.difficulty || item.complexity || null,
              url: item.url || null,
              pageid: item.pageid || null
            }));
            allArtifacts.push(...normalized);
          }
        } catch {
          // continue to next endpoint
        }
      }

      if (allArtifacts.length > 0) {
        setArtifacts(allArtifacts);
      } else {
        // fallback demo data
        setArtifacts([
          {
            id: '1',
            name: 'Eye of Agamotto',
            description:
              'An ancient artifact of immense power, capable of manipulating time and revealing truth.',
            type: 'Artifact',
            powerClass: 'Supreme',
            accessLevel: 'Sealed',
            origin: 'Agamotto',
            language: 'Ancient Sanskrit',
            energySignature: 'Temporal',
            author: 'Agamotto the All-Seeing',
            dateAdded: '2024-01-15T00:00:00.000Z',
            tags: ['time', 'truth', 'protection', 'supreme'],
            imageUrl: null
          },
          {
            id: '2',
            name: 'Book of the Vishanti',
            description:
              'The most comprehensive grimoire of white magic ever compiled.',
            type: 'Grimoire',
            powerClass: 'High',
            accessLevel: 'Authorized',
            origin: 'Vishanti',
            language: 'Ancient',
            energySignature: 'Protective',
            author: 'The Vishanti',
            dateAdded: '2024-01-10T00:00:00.000Z',
            tags: ['white magic', 'protection', 'healing', 'ancient'],
            imageUrl: null
          },
          {
            id: '3',
            name: 'Crimson Bands of Cyttorak',
            description:
              'Powerful binding spells that can restrain even the most powerful entities.',
            type: 'Spell',
            powerClass: 'Advanced',
            accessLevel: 'Restricted',
            origin: 'Cyttorak',
            language: 'Demonic',
            energySignature: 'Binding',
            author: 'Cyttorak',
            dateAdded: '2024-01-05T00:00:00.000Z',
            tags: ['binding', 'restraint', 'demonic', 'advanced'],
            imageUrl: null
          }
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setArtifacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, []);

  // ---------- RAG helpers (real API) ----------
  const fetchDocumentText = async (docId: string) => {
    const { ok, status, data, errPayload } = await fetchJson<{ text: string }>(
      `${API_BASE}/documents/${docId}/text`,
      { method: "GET" },
      { timeoutMs: 30_000 }
    );
    if (!ok) {
      throw new Error(humanizeError(status, errPayload, `Failed to fetch document text (${status})`));
    }
    return data?.text ?? "";
  };

  const pushUser = (text: string) => {
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', content: text }]);
  };

  const pushAssistant = (text: string, citations?: string) => {
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'assistant', content: text, citations },
    ]);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) return;
    const file = fileInputRef.current.files[0];
    const form = new FormData();
    form.append("file", file);

    try {
      setUploading(true);

      const { ok, status, data, errPayload } = await fetchJson<{ document_id: string }>(
        `${API_BASE}/upload`,
        { method: "POST", body: form },
        { timeoutMs: 120_000 }
      );

      if (!ok) {
        const msg = humanizeError(status, errPayload, `Upload failed (${status})`);
        pushAssistant(`📜 Upload failed: ${msg}`);
        return;
      }

      const newId = data?.document_id ?? null;
      setDocumentId(newId);
      pushAssistant(
        `✨ Mystical document successfully added to the archive!\n\n🔮 Document ID: \`${newId}\`\n\nAsk me anything about its contents.`
      );

      // Preload & cache text
      try {
        if (typeof newId === "string" && newId.length > 0) {
          const txt = await fetchDocumentText(newId);
          setDocumentText(txt);
        } else {
          pushAssistant(`⚠️ Note: Could not extract text: Document ID missing or invalid.`);
        }
      } catch (e: any) {
        pushAssistant(`⚠️ Note: Could not fetch document text: ${e?.message ?? String(e)}`);
      }
    } catch (err: any) {
      const msg = err?.name === "AbortError" ? "Upload timed out." : (err?.message ?? String(err));
      pushAssistant(`🔥 Upload failed: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setInput("");
    pushUser(q);

    try {
      setChatLoading(true);

      let context: string | undefined = undefined;

      if (documentId) {
        if (documentText && documentText.length > 0) {
          context = documentText;
        } else {
          try {
            const txt = await fetchDocumentText(documentId);
            setDocumentText(txt);
            context = txt;
          } catch (e: any) {
            pushAssistant(`⚠️ Could not access the mystical text: ${e?.message ?? String(e)}`);
          }
        }
      }

      const body = JSON.stringify({
        query: q,
        ...(documentId ? { document_id: documentId } : {}),
        ...(context ? { context } : {}),
      });

      const { ok, status, data, errPayload } = await fetchJson<{
        answer?: string;
        citations?: string;
      }>(
        `${API_BASE}/chat`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body },
        { timeoutMs: 30_000 }
      );

      if (!ok) {
        const msg = humanizeError(status, errPayload, `Chat failed (${status})`);
        pushAssistant(`🔥 Error: ${msg}`);
        return;
      }

      const answer = data?.answer ?? "(The spirits remain silent...)";
      const citations = data?.citations;
      pushAssistant(answer, citations);
    } catch (err: any) {
      const msg = err?.name === "AbortError" ? "Chat request timed out." : (err?.message ?? String(err));
      pushAssistant(`⚡ Error: ${msg}`);
    } finally {
      setChatLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!chatLoading) handleSend();
    }
  };

  const shortId = (id: string) => (id.length <= 10 ? id : `${id.slice(0, 8)}…${id.slice(-4)}`);

  const getAccessLevelIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'Sealed':
        return <Lock className="w-5 h-5 text-red-500" />;
      case 'Restricted':
        return <Shield className="w-5 h-5 text-orange-500" />;
      case 'Authorized':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Eye className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPowerClassColor = (powerClass: string) => {
    switch (powerClass) {
      case 'Supreme':
        return 'bg-purple-600';
      case 'Forbidden':
        return 'bg-red-600';
      case 'High':
        return 'bg-orange-600';
      case 'Advanced':
        return 'bg-blue-600';
      case 'Intermediate':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  // ---- Filtering logic for artifacts ----
  const filteredArtifacts = artifacts.filter((artifact) => {
    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || artifact.type === selectedCategory;

    // Power class filter
    const matchesPowerClass =
      selectedPowerClass === 'all' || artifact.powerClass === selectedPowerClass;

    // Search query filter (search in name, description, tags)
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      (artifact.name && artifact.name.toLowerCase().includes(query)) ||
      (artifact.description && artifact.description.toLowerCase().includes(query)) ||
      (Array.isArray(artifact.tags) &&
        artifact.tags.some((tag: string) =>
          tag.toLowerCase().includes(query)
        ));

    return matchesCategory && matchesPowerClass && matchesQuery;
  });

  // ---- UI (trimmed; keep your existing layout) ----
  const MessageBubble = ({ role, content, citations }: { role: 'user' | 'assistant' | 'system'; content: string; citations?: string }) => {
    const isUser = role === 'user';
    const isSystem = role === 'system';
    
    return (
      <div className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
        <div className={`max-w-[85%] group ${isUser ? 'order-1' : 'order-2'}`}>
          <div
            className={[
              'relative whitespace-pre-wrap rounded-2xl px-5 py-4 text-sm shadow-lg border transition-all duration-300 hover:shadow-xl',
              isSystem
                ? 'bg-gradient-to-r from-purple-50/90 to-indigo-50/90 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200/50 dark:border-purple-800/50 text-foreground backdrop-blur-sm'
                : isUser
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white border-blue-500/50 shadow-blue-500/25'
                : 'bg-gradient-to-r from-card/90 to-primary/5 border-primary/20 hover:border-primary/40 backdrop-blur-sm',
            ].join(' ')}
          >
            {/* Role indicator */}
            <div className="flex items-center gap-2 mb-3">
              {isUser ? (
                <>
                  <div className="p-1.5 rounded-full bg-blue-500/20 border border-blue-400/30">
                    <Crown className="w-3.5 h-3.5 text-blue-200" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Seeker</span>
                </>
              ) : isSystem ? (
                <>
                  <div className="p-1.5 rounded-full bg-purple-500/20 border border-purple-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">Archive</span>
                </>
              ) : (
                <>
                  <div className="p-1.5 rounded-full bg-primary/20 border border-primary/30">
                    <Eye className="w-3.5 h-3.5 text-primary animate-pulse" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-primary font-semibold">Mystic Oracle</span>
                </>
              )}
            </div>
            
            {/* Content */}
            <div className="leading-relaxed text-sm">{content}</div>
            
            {/* Citations */}
            {citations && !isUser && (
              <div className="mt-4 pt-3 border-t border-border/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Scroll className="w-3.5 h-3.5" />
                  <span className="font-medium">Arcane Sources:</span>
                </div>
                <div className="text-xs bg-muted/40 rounded-lg px-3 py-2 font-mono border border-border/30">
                  {citations}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isUser ? 'order-2 ml-3 bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-blue-400/30' : 'order-1 mr-3 bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 ring-1 ring-primary/20'}`}>
          {isUser ? (
            <Crown className="w-5 h-5 text-white" />
          ) : isSystem ? (
            <Sparkles className="w-5 h-5 text-primary" />
          ) : (
            <Eye className="w-5 h-5 text-primary" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Mystic Archive
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Doctor Strange Knowledge Repository</p>
              </div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
            {documentId ? (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">RAG Connected: </span>
                <span className="sm:hidden">Connected: </span>
                <code className="bg-emerald-500/20 px-2 py-1 rounded text-xs text-emerald-300 font-mono">{shortId(documentId)}</code>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">No RAG document uploaded</span>
                <span className="sm:hidden">No document</span>
              </div>
            )}
            
            {/* API Status Indicator */}
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border ${
              loading 
                ? 'bg-blue-500/20 border-blue-500/30' 
                : error 
                ? 'bg-red-500/20 border-red-500/30' 
                : artifacts.length > 0 
                ? 'bg-green-500/20 border-green-500/30' 
                : 'bg-gray-500/20 border-gray-500/30'
            }`}>
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                  <span className="sm:hidden">Loading</span>
                </>
              ) : error ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="hidden sm:inline">API Error</span>
                  <span className="sm:hidden">Error</span>
                </>
              ) : artifacts.length > 0 ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="hidden sm:inline">{artifacts.length} items</span>
                  <span className="sm:hidden">{artifacts.length}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-gray-400" />
                  <span className="hidden sm:inline">No data</span>
                  <span className="sm:hidden">Empty</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* RAG Document Upload Section */}
        <Card className="mb-6 sm:mb-8 border-primary/20 bg-gradient-to-r from-card/80 to-primary/5">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="hidden sm:inline">Upload Mystical Document for RAG Chat</span>
              <span className="sm:hidden">Upload Document</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm lg:text-base">
              <span className="hidden sm:inline">Upload a PDF or DOCX containing mystical knowledge to enable AI-powered document consultation</span>
              <span className="sm:hidden">Upload PDF or DOCX for AI consultation</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="flex flex-col gap-3 sm:gap-4 items-stretch">
                <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="block w-full text-xs sm:text-sm text-foreground file:mr-2 sm:file:mr-3 lg:file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:px-2 sm:file:px-3 lg:file:px-4 file:py-1.5 sm:file:py-2 file:text-white file:font-semibold file:text-xs sm:file:text-sm hover:file:from-blue-700 hover:file:to-purple-700 transition-all duration-300 file:shadow-lg"
              disabled={uploading}
            />
                </div>
                <Button
                  onClick={handleUpload}
              disabled={uploading}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base font-medium"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Processing</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Upload Tome</span>
                      <span className="sm:hidden">Upload</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg px-3 sm:px-4 lg:px-5 py-3 sm:py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-primary text-xs sm:text-sm">RAG Process</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  <span className="hidden sm:inline">The archive will extract, analyze, and index your mystical document for AI consultation. This enables you to ask specific questions about the uploaded content.</span>
                  <span className="sm:hidden">Document will be analyzed and indexed for AI consultation.</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RAG Chat Interface */}
        <Card className="mb-6 sm:mb-8 border-primary/30 shadow-2xl shadow-primary/10 bg-gradient-to-r from-[#1a1a2e]/80 to-[#0A0A1A]/80 backdrop-blur-xl">
          <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-[#1a1a2e] to-primary/5">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              Mystical RAG Consultation
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm sm:text-base">
              Ask questions about your uploaded documents and receive insights from the archived knowledge
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <div 
              ref={scrollerRef} 
              className="h-[300px] sm:h-[400px] lg:h-[500px] overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-[#1a1a2e]/40 to-[#0A0A1A]/40"
            >
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} citations={m.citations} />
            ))}
              
              {chatLoading && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#1a1a2e]/80 to-primary/10 border border-primary/30 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-xs backdrop-blur-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-300 font-medium">Consulting the mystical archive...</span>
                  </div>
                </div>
              )}
          </div>
            
            {/* Input */}
            <div className="border-t border-primary/20 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-[#1a1a2e]/60 to-primary/5">
              <div className="flex gap-2 sm:gap-4 items-end">
                <div className="flex-1">
                  <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
                    placeholder={documentId ? "Ask about the mystical knowledge..." : "Upload a document first to begin consultation"}
                    className="min-h-[44px] sm:min-h-[52px] bg-[#0A0A1A]/60 border-primary/30 focus:border-primary/50 text-white placeholder-gray-400 text-sm sm:text-base font-medium transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    disabled={chatLoading || !documentId}
                  />
                </div>
                <Button
              onClick={handleSend}
                  disabled={chatLoading || !input.trim() || !documentId}
                  size="icon"
                  className="h-[44px] w-[44px] sm:h-[52px] sm:w-[52px] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {chatLoading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Search Section */}
        <Card className="mb-6 sm:mb-8 border-primary/20 bg-gradient-to-r from-card/80 to-primary/5">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="w-5 h-5 text-primary" />
              AI-Powered Archive Search
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Ask questions in natural language to find spells, artifacts, or magical knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Textarea
                placeholder="Ask anything... 'Show me time manipulation spells' or 'Find artifacts from the Vishanti'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="min-h-[60px] text-sm sm:text-base"
              />
              <Button onClick={handleAiSearch} disabled={isAiSearching} className="min-w-[100px] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                {isAiSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                    <span className="sm:hidden">Searching</span>
                  </div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </Button>
            </div>
            {aiResponse && (
              <Alert className="mt-4">
                <Sparkles className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base">AI Assistant Response</AlertTitle>
                <AlertDescription className="text-sm sm:text-base">{aiResponse}</AlertDescription>
              </Alert>
            )}
            
            {/* Spell Cards from API Data - Based on RAG Response */}
            {artifacts.length > 0 && aiResponse && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3 text-primary">Spells from RAG Response</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {artifacts
                    .filter((spell) => {
                      // Filter spells based on the RAG response content
                      const responseText = aiResponse.toLowerCase();
                      const spellName = (spell.name || '').toLowerCase();
                      const spellDesc = (spell.description || '').toLowerCase();
                      
                      return responseText.includes(spellName) || responseText.includes(spellDesc);
                    })
                    .map((spell) => (
                      <Card key={spell.id || Math.random()} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getSafeValue(spell.type, '') === 'Spell' && <Zap className="w-4 h-4 text-blue-400" />}
                                {getSafeValue(spell.type, '') === 'Artifact' && <Crown className="w-4 h-4 text-yellow-400" />}
                                {getSafeValue(spell.type, '') === 'Grimoire' && <BookOpen className="w-4 h-4 text-purple-400" />}
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                  {getSafeValue(spell.type, 'Unknown Type')}
                                </span>
                              </div>
                              <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
                                {getSafeValue(spell.name, 'Unnamed Artifact')}
                              </CardTitle>
                            </div>
                            {getAccessLevelIcon(getSafeValue(spell.accessLevel, 'Public'))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`${getPowerClassColor(getSafeValue(spell.powerClass, 'Unknown'))} text-white border-0 text-xs`}>
                              {getSafeValue(spell.powerClass, 'Unknown')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getSafeValue(spell.origin, 'Marvel Universe')}
                            </span>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                            {getSafeValue(spell.description, 'No description available for this mystical artifact.')}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {getSafeValue(spell.language, 'Ancient')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {spell.dateAdded ? new Date(spell.dateAdded).toLocaleDateString() : 'Date Unknown'}
                              </span>
                            </div>
                            
                            {/* Page ID for Marvel Wiki items */}
                            {spell.pageid && (
                              <div className="flex items-center gap-1 text-xs">
                                <FileText className="w-3 h-3 text-purple-400" />
                                <span className="text-muted-foreground">ID: </span>
                                <span className="font-mono text-purple-400">{spell.pageid}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1 text-xs">
                              <Flame className="w-3 h-3 text-orange-400" />
                              <span>{getSafeValue(spell.energySignature, 'Unknown')} Energy</span>
                            </div>
                            
                            {/* Marvel Wiki Link Indicator */}
                            {spell.url && (
                              <div className="flex items-center gap-1 text-xs">
                                <Globe className="w-3 h-3 text-blue-400" />
                                <a 
                                  href={spell.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 transition-colors underline"
                                >
                                  View on Marvel Wiki
                                </a>
                              </div>
                            )}
                            
                            {/* Show additional type-specific information */}
                            {spell.type === 'Spell' && spell.castingTime && (
                              <div className="flex items-center gap-1 text-xs">
                                <Zap className="w-3 h-3 text-blue-400" />
                                <span>Casting: {spell.castingTime}</span>
                              </div>
                            )}
                            
                            {spell.type === 'Artifact' && spell.durability && (
                              <div className="flex items-center gap-1 text-xs">
                                <Shield className="w-3 h-3 text-green-400" />
                                <span>Durability: {spell.durability}</span>
                              </div>
                            )}
                            
                            {spell.type === 'Grimoire' && spell.pages && (
                              <div className="flex items-center gap-1 text-xs">
                                <BookOpen className="w-3 h-3 text-purple-400" />
                                <span>{spell.pages} pages</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {getSafeArray(spell.tags).map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {getSafeValue(spell.accessLevel, '') === 'Sealed' && (
                            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <AlertDescription className="text-xs text-red-600 dark:text-red-400">
                                Restricted Access: Master-level authorization required
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>

                        {/* Fixed Position Button Section */}
                        <div className="px-6 pb-6 pt-3 border-t border-border/20 mt-auto">
                          {getSafeValue(spell.accessLevel, '') === 'Sealed' ? (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-medium">ACCESS DENIED</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">
                                Master-level authorization required
                              </p>
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                size="sm" 
                                disabled
                                onClick={() => setSelectedArtifact(spell)}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Restricted Access</span>
                                <span className="sm:hidden">Restricted</span>
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" className="w-full" size="sm" onClick={() => setSelectedArtifact(spell)}>
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">View Details</span>
                              <span className="sm:hidden">Details</span>
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Filter className="w-5 h-5 text-primary" />
              Advanced Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search artifacts, spells..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
              
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Categories</option>
                <option value="Spell">Spells</option>
                <option value="Artifact">Artifacts</option>
                <option value="Grimoire">Grimoires</option>
                <option value="Scroll">Scrolls</option>
              </select>

              <select 
                value={selectedPowerClass} 
                onChange={(e) => setSelectedPowerClass(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Power Classes</option>
                <option value="Supreme">Supreme</option>
                <option value="Forbidden">Forbidden</option>
                <option value="High">High</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
              </select>

              <Button 
                variant="outline" 
                className="w-full text-sm sm:text-base"
                onClick={fetchArtifacts}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                <span className="sm:hidden">{loading ? 'Refreshing' : 'Refresh'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Archive Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Loading Mystical Artifacts</h3>
            <p className="text-muted-foreground">Consulting the ancient archives...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Failed to Load Artifacts</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchArtifacts} variant="outline" className="mr-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => setError(null)} variant="ghost">
                <Eye className="w-4 h-4 mr-2" />
                Show Mock Data
              </Button>
            </div>
            <div className="mt-4 text-xs text-muted-foreground max-w-md mx-auto">
              <p>If the API is unavailable, the system will automatically fall back to sample data. Check your API endpoints and try refreshing.</p>
            </div>
          </div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Artifacts Found</h3>
            <p className="text-muted-foreground">The mystical archive appears to be empty or the connection failed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredArtifacts.map((artifact) => (
              <Card key={artifact.id || Math.random()} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSafeValue(artifact.type, '') === 'Spell' && <Zap className="w-4 h-4 text-blue-400" />}
                        {getSafeValue(artifact.type, '') === 'Artifact' && <Crown className="w-4 h-4 text-yellow-400" />}
                        {getSafeValue(artifact.type, '') === 'Grimoire' && <BookOpen className="w-4 h-4 text-purple-400" />}
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          {getSafeValue(artifact.type, 'Unknown Type')}
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
                        {getSafeValue(artifact.name, 'Unnamed Artifact')}
                      </CardTitle>
                    </div>
                    {getAccessLevelIcon(getSafeValue(artifact.accessLevel, 'Public'))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={`${getPowerClassColor(getSafeValue(artifact.powerClass, 'Unknown'))} text-white border-0 text-xs`}>
                      {getSafeValue(artifact.powerClass, 'Unknown')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getSafeValue(artifact.origin, 'Marvel Universe')}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                    {getSafeValue(artifact.description, 'No description available for this mystical artifact.')}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {getSafeValue(artifact.language, 'Ancient')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {artifact.dateAdded ? new Date(artifact.dateAdded).toLocaleDateString() : 'Date Unknown'}
                      </span>
                    </div>
                    
                    {/* Page ID for Marvel Wiki items */}
                    {artifact.pageid && (
                      <div className="flex items-center gap-1 text-xs">
                        <FileText className="w-3 h-3 text-purple-400" />
                        <span className="text-muted-foreground">ID: </span>
                        <span className="font-mono text-purple-400">{artifact.pageid}</span>
                      </div>
                    )}
                    
                                      <div className="flex items-center gap-1 text-xs">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>{getSafeValue(artifact.energySignature, 'Unknown')} Energy</span>
                  </div>
                  
                  {/* Marvel Wiki Link Indicator */}
                  {artifact.url && (
                    <div className="flex items-center gap-1 text-xs">
                      <Globe className="w-3 h-3 text-blue-400" />
                      <a 
                        href={artifact.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors underline"
                      >
                        View on Marvel Wiki
                      </a>
                    </div>
                  )}
                    
                    {/* Show additional type-specific information */}
                    {artifact.type === 'Spell' && artifact.castingTime && (
                      <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span>Casting: {artifact.castingTime}</span>
                      </div>
                    )}
                    
                    {artifact.type === 'Artifact' && artifact.durability && (
                      <div className="flex items-center gap-1 text-xs">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span>Durability: {artifact.durability}</span>
                      </div>
                    )}
                    
                    {artifact.type === 'Grimoire' && artifact.pages && (
                      <div className="flex items-center gap-1 text-xs">
                        <BookOpen className="w-3 h-3 text-purple-400" />
                        <span>{artifact.pages} pages</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {getSafeArray(artifact.tags).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {getSafeValue(artifact.accessLevel, '') === 'Sealed' && (
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-xs text-red-600 dark:text-red-400">
                        Restricted Access: Master-level authorization required
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                {/* Fixed Position Button Section */}
                <div className="px-6 pb-6 pt-3 border-t border-border/20 mt-auto">
                  {getSafeValue(artifact.accessLevel, '') === 'Sealed' ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-medium">ACCESS DENIED</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Master-level authorization required
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="sm" 
                        disabled
                        onClick={() => setSelectedArtifact(artifact)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Restricted Access</span>
                        <span className="sm:hidden">Restricted</span>
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" size="sm" onClick={() => setSelectedArtifact(artifact)}>
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredArtifacts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No items found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Security Dashboard */}
       
      </div>

                {/* Artifact Details Modal */}
          <Dialog open={!!selectedArtifact} onOpenChange={() => setSelectedArtifact(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[70vh] sm:max-h-[80vh] lg:max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  {selectedArtifact && (
                    <>
                      {getSafeValue(selectedArtifact.type, '') === 'Spell' && <Zap className="w-6 h-6 text-blue-400" />}
                      {getSafeValue(selectedArtifact.type, '') === 'Artifact' && <Crown className="w-6 h-6 text-yellow-400" />}
                      {getSafeValue(selectedArtifact.type, '') === 'Grimoire' && <BookOpen className="w-6 h-6 text-purple-400" />}
                      {getSafeValue(selectedArtifact.name, 'Unknown Artifact')}
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedArtifact && (
                    <>
                      {getSafeValue(selectedArtifact.type, 'Unknown Type')} • {getSafeValue(selectedArtifact.powerClass, 'Unknown')} Class • {getSafeValue(selectedArtifact.origin, 'Unknown Origin')}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              {selectedArtifact && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Image and Description Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Image/Spell Icon Section */}
                    <div className="space-y-2 sm:space-y-3">
                      <h4 className="font-semibold text-base sm:text-lg text-primary">
                        {selectedArtifact.type === 'Spell' ? 'Spell Icon' : 'Artifact Image'}
                      </h4>
                      <div className="relative">
                        {getSafeValue(selectedArtifact.imageUrl, '') ? (
                          <div className="aspect-square rounded-lg overflow-hidden border border-border/30 bg-gradient-to-br from-primary/5 to-secondary/5">
                            <img 
                              src={getSafeValue(selectedArtifact.imageUrl, '')} 
                              alt={`${getSafeValue(selectedArtifact.name, 'Unknown')} - ${getSafeValue(selectedArtifact.type, 'Unknown')}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10">
                              <div className="text-center text-muted-foreground">
                                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Image failed to load</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg border border-dashed border-border/40 bg-gradient-to-br from-muted/10 to-muted/5 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              {selectedArtifact.type === 'Spell' ? (
                                <>
                                  <Zap className="w-16 h-16 mx-auto mb-3 opacity-40 text-blue-400" />
                                  <p className="text-sm font-medium">Marvel Spell</p>
                                  <p className="text-xs text-muted-foreground">No image available for this spell</p>
                                </>
                              ) : (
                                <>
                                  <Image className="w-16 h-16 mx-auto mb-3 opacity-40" />
                                  <p className="text-sm font-medium">No Image Available</p>
                                  <p className="text-xs text-muted-foreground">This artifact doesnt have an image</p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Image URL Display */}
                      {getSafeValue(selectedArtifact.imageUrl, '') && (
                        <div className="text-xs text-muted-foreground bg-muted/20 rounded px-3 py-2 font-mono break-all">
                          <span className="font-medium text-primary">Image URL:</span> {getSafeValue(selectedArtifact.imageUrl, '')}
                        </div>
                      )}
                    </div>
                    
                    {/* Description Section */}
                    <div className="space-y-2 sm:space-y-3">
                      <h4 className="font-semibold text-base sm:text-lg text-primary">Description</h4>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                        {getSafeValue(selectedArtifact.description, 'No description available for this mystical artifact.')}
                      </p>
                      
                      {/* Quick Info */}
                      <div className="space-y-1 sm:space-y-2 pt-1 sm:pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="outline" className="text-xs">
                            {getSafeValue(selectedArtifact.type, 'Unknown Type')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Power:</span>
                          <Badge className={`${getPowerClassColor(getSafeValue(selectedArtifact.powerClass, 'Unknown'))} text-white border-0 text-xs`}>
                            {getSafeValue(selectedArtifact.powerClass, 'Unknown')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Origin:</span>
                          <span className="font-medium">{getSafeValue(selectedArtifact.origin, 'Unknown Origin')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Properties Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-base sm:text-lg">Magical Properties</h4>
                      <div className="space-y-1 sm:space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Energy Signature:</span>
                          <span className="font-medium">{getSafeValue(selectedArtifact.energySignature, 'Unknown')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Language:</span>
                          <span className="font-medium">{getSafeValue(selectedArtifact.language, 'Unknown Language')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Author:</span>
                          <span className="font-medium">{getSafeValue(selectedArtifact.author, 'Unknown Author')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date Added:</span>
                          <span className="font-medium">
                            {selectedArtifact.dateAdded ? new Date(selectedArtifact.dateAdded).toLocaleDateString() : 'Date Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-base sm:text-lg">Security & Access</h4>
                      <div className="space-y-1 sm:space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Access Level:</span>
                          <Badge className={`${getPowerClassColor(getSafeValue(selectedArtifact.accessLevel, 'Public'))} text-white border-0`}>
                            {getSafeValue(selectedArtifact.accessLevel, 'Public')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Power Class:</span>
                          <Badge className={`${getPowerClassColor(getSafeValue(selectedArtifact.powerClass, 'Unknown'))} text-white border-0`}>
                            {getSafeValue(selectedArtifact.powerClass, 'Unknown')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Origin:</span>
                          <span className="font-medium">{getSafeValue(selectedArtifact.origin, 'Unknown Origin')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Type-Specific Properties */}
                  {selectedArtifact.type === 'Spell' && (
                    <div>
                      <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-base sm:text-lg">Spell Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {selectedArtifact.castingTime && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Casting Time:</span>
                            <span className="font-medium">{selectedArtifact.castingTime}</span>
                          </div>
                        )}
                        {selectedArtifact.range && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Range:</span>
                            <span className="font-medium">{selectedArtifact.range}</span>
                          </div>
                        )}
                        {selectedArtifact.components && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Components:</span>
                            <span className="font-medium">{selectedArtifact.components}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedArtifact.type === 'Artifact' && (
                    <div>
                      <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-base sm:text-lg">Artifact Properties</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {selectedArtifact.durability && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Durability:</span>
                            <span className="font-medium">{selectedArtifact.durability}</span>
                          </div>
                        )}
                        {selectedArtifact.enchantments && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Enchantments:</span>
                            <span className="font-medium">{selectedArtifact.enchantments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedArtifact.type === 'Grimoire' && (
                    <div>
                      <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-base sm:text-lg">Grimoire Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {selectedArtifact.pages && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pages:</span>
                            <span className="font-medium">{selectedArtifact.pages}</span>
                          </div>
                        )}
                        {selectedArtifact.difficulty && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Difficulty:</span>
                            <span className="font-medium">{selectedArtifact.difficulty}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Marvel Wiki Information - Moved up for better visibility */}
                  {(selectedArtifact.url || selectedArtifact.pageid) && (
                    <div>
                      <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-base sm:text-lg">Marvel Wiki Information</h4>
                      <div className="space-y-2 sm:mb-4">
                        {selectedArtifact.pageid && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Page ID:</span>
                            <Badge variant="outline" className="text-xs font-mono">
                              {selectedArtifact.pageid}
                            </Badge>
                          </div>
                        )}
                        {selectedArtifact.url && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Wiki URL:</span>
                              <span className="text-xs text-muted-foreground">Marvel Fandom</span>
                            </div>
                            <a 
                              href={selectedArtifact.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-xs bg-muted/20 rounded px-3 py-2 font-mono break-all text-primary hover:text-primary/80 transition-colors border border-border/30 hover:border-primary/30"
                            >
                              {selectedArtifact.url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div>
                    <h4 className="font-semibold mb-2 sm:mb-3 text-primary text-base sm:text-lg">Magical Tags</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {getSafeArray(selectedArtifact.tags).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                        ))}
                    </div>
                  </div>
                  
                  {/* Access Level Warning */}
                  {getSafeValue(selectedArtifact.accessLevel, '') === 'Sealed' && (
                    <Alert className="border-red-200 bg-red-50/20 dark:bg-red-950/20">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                        <strong>Restricted Access:</strong> This item requires master-level authorization. Unauthorized access attempts will be logged and reported.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
    </div>
  );
};

//export default MysticRAGChat;