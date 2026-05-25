import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Users, X, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function parseCSVPreview(text, maxRows = 5) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1, maxRows + 1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    values.push(current.trim());
    return values.map(v => v.replace(/^"|"$/g, ''));
  });
  const totalRows = lines.length - 1;
  return { headers, rows, totalRows };
}

function parseJSONPreview(text, maxRows = 5) {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : (parsed.users || parsed.data || []);
  if (!arr.length) return { headers: [], rows: [], totalRows: 0 };
  const headers = Object.keys(arr[0]);
  const rows = arr.slice(0, maxRows).map(r => headers.map(h => String(r[h] ?? '')));
  return { headers, rows, totalRows: arr.length };
}

export default function UserImportPanel({ appId, appName }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const inputRef = useRef(null);
  const { toast } = useToast();

  const handleFile = (f) => {
    setResult(null);
    setParseError(null);
    setPreview(null);
    setFileContent(null);

    const ext = f.name.split('.').pop().toLowerCase();
    const type = ext === 'json' ? 'json' : 'csv';
    setFile(f);
    setFileType(type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setFileContent(text);
      try {
        const p = type === 'json' ? parseJSONPreview(text) : parseCSVPreview(text);
        setPreview(p);
      } catch {
        setParseError(`Could not parse ${type.toUpperCase()} file. Make sure it's valid.`);
      }
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!fileContent || !fileType || !appId) return;
    setImporting(true);
    try {
      const response = await base44.functions.invoke('importUsers', {
        client_app_id: appId,
        file_content: fileContent,
        file_type: fileType
      });
      const data = response.data;
      if (data?.success) {
        setResult(data);
        toast({ title: `✅ Import complete`, description: `${data.imported} users imported, ${data.skipped} skipped.` });
      } else {
        toast({ title: "Import failed", description: data?.error || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    }
    setImporting(false);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setFileContent(null);
    setFileType(null);
    setResult(null);
    setParseError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Info note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
        <Info className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#a3a3a3]">
          Upload a <strong className="text-white">CSV or JSON</strong> file with your existing users. 
          Include an <code className="text-[#00d4ff]">email</code> or <code className="text-[#00d4ff]">user_id</code> column — knXw will match this when users trigger your tracking snippet, linking their session to their profile automatically.
        </p>
      </div>

      {/* Drop zone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-[#00d4ff] bg-[#00d4ff]/5'
              : 'border-[#262626] hover:border-[#404040] hover:bg-[#1a1a1a]'
          }`}
        >
          <Upload className="w-8 h-8 text-[#6b7280] mx-auto mb-3" />
          <p className="text-sm text-white font-medium mb-1">Drop your file here or click to browse</p>
          <p className="text-xs text-[#6b7280]">Supports .csv and .json — up to 10,000 users</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* File selected + preview */}
      {file && !result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-white font-medium">{file.name}</span>
              {preview && (
                <Badge className="bg-[#262626] text-[#a3a3a3] border-none text-xs">
                  {preview.totalRows?.toLocaleString()} rows
                </Badge>
              )}
            </div>
            <button onClick={reset} className="text-[#6b7280] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {parseError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {parseError}
            </div>
          )}

          {/* Preview table */}
          {preview && preview.headers.length > 0 && (
            <div className="rounded-lg border border-[#262626] overflow-hidden">
              <div className="px-3 py-2 bg-[#1a1a1a] border-b border-[#262626]">
                <p className="text-xs text-[#6b7280]">Preview — first {preview.rows.length} rows</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#262626]">
                      {preview.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left text-[#6b7280] font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-1.5 text-[#a3a3a3] whitespace-nowrap max-w-[180px] truncate">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.totalRows > preview.rows.length && (
                <div className="px-3 py-2 bg-[#1a1a1a] text-xs text-[#6b7280]">
                  + {(preview.totalRows - preview.rows.length).toLocaleString()} more rows
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={importing || !!parseError}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
              {importing ? 'Importing...' : `Import ${preview?.totalRows?.toLocaleString() || ''} Users`}
            </Button>
            <Button variant="ghost" onClick={reset} className="text-[#a3a3a3] hover:text-white border border-[#262626]">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Import complete!</p>
              <p className="text-xs text-emerald-400/80 mt-1">
                <strong>{result.imported}</strong> users imported · <strong>{result.skipped}</strong> skipped (duplicates or missing ID)
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
            <p className="text-xs text-[#a3a3a3]">
              <strong className="text-white">What happens next:</strong> When these users visit your site with the tracking snippet installed, knXw will automatically match their session to their imported profile using their email or user ID — and begin building their psychographic profile from that point forward.
            </p>
          </div>
          <Button variant="ghost" onClick={reset} className="text-xs text-[#a3a3a3] hover:text-white border border-[#262626]">
            Import another file
          </Button>
        </div>
      )}
    </div>
  );
}