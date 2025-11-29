import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    // Optional auth (allow public export if docs are public)
    const base44 = createClientFromRequest(req);
    try { await base44.auth.isAuthenticated(); } catch {}

    const payload = await req.json();
    const { title = "knXw Documentation", sections = [] } = payload || {};

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    const addHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text(title, margin, y);
      y += 24;
      doc.setDrawColor(0, 212, 255);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 18;
    };

    const ensureSpace = (h = 18) => {
      if (y + h > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const addHeading = (text, level = 2) => {
      ensureSpace(28);
      const sizes = { 1: 20, 2: 16, 3: 14, 4: 12 };
      const color = { 1: [0, 116, 153], 2: [0, 116, 153], 3: [15, 118, 110], 4: [55, 65, 81] }[level] || [55, 65, 81];
      doc.setFont('helvetica', level <= 2 ? 'bold' : 'bold');
      doc.setFontSize(sizes[level] || 14);
      doc.setTextColor(...color);
      const textLines = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(textLines, margin, y);
      y += (textLines.length * (sizes[level] >= 16 ? 20 : 16)) + 6;
    };

    const addParagraph = (text) => {
      if (!text) return;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      for (let i = 0; i < lines.length; i++) {
        ensureSpace(16);
        doc.text(lines[i], margin, y);
        y += 16;
      }
      y += 6;
    };

    const addListItem = (text) => {
      if (!text) return;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      const maxWidth = pageWidth - margin * 2 - 16;
      const lines = doc.splitTextToSize(text, maxWidth);
      ensureSpace(16);
      doc.circle(margin + 4, y - 3, 1.5, 'F');
      doc.text(lines[0], margin + 12, y);
      y += 16;
      for (let i = 1; i < lines.length; i++) {
        ensureSpace(16);
        doc.text(lines[i], margin + 12, y);
        y += 16;
      }
    };

    const addCode = (code) => {
      if (!code) return;
      const pad = 8;
      const maxWidth = pageWidth - margin * 2 - pad * 2;
      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      const lines = doc.splitTextToSize(code.replace(/\t/g, '  '), maxWidth);
      // Calculate height
      const blockHeight = lines.length * 14 + pad * 2;
      ensureSpace(blockHeight + 12);
      // Background
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, y, pageWidth - margin * 2, blockHeight, 6, 6, 'F');
      // Border accent
      doc.setDrawColor(0, 212, 255);
      doc.setLineWidth(0.8);
      doc.roundedRect(margin, y, pageWidth - margin * 2, blockHeight, 6, 6, 'S');
      // Text
      let ty = y + pad + 10;
      lines.forEach((ln) => {
        ensureSpace(14);
        doc.text(ln, margin + pad, ty);
        ty += 14;
      });
      y += blockHeight + 12;
    };

    addHeader();

    // Render incoming sections
    for (const sec of sections) {
      if (sec.type === 'heading') {
        addHeading(sec.text || '', sec.level || 2);
      } else if (sec.type === 'paragraph') {
        addParagraph(sec.text || '');
      } else if (sec.type === 'list_item') {
        addListItem(sec.text || '');
      } else if (sec.type === 'code') {
        addCode(sec.text || '');
      } else if (sec.type === 'spacer') {
        ensureSpace(sec.size || 8);
        y += sec.size || 8;
      }
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="knxw-documentation.pdf"'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});