export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { resume, format, filename } = await request.json();
    if (!resume) return NextResponse.json({ error: 'No resume data' }, { status: 400 });
    if (format === 'pdf') return generatePDF(resume, filename || 'resume');
    return generateDOCX(resume, filename || 'resume');
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

async function generatePDF(r: any, filename: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const w = doc.internal.pageSize.getWidth();
  let y = 50;
  const m = 50;
  const lw = w - m * 2;

  const txt = (text: string, size: number, style = 'normal', color = [0,0,0]) => {
    doc.setFontSize(size); doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', style === 'bold' ? 'bold' : style === 'italic' ? 'italic' : 'normal');
    const lines = doc.splitTextToSize(text, lw);
    for (const line of lines) { if (y > 730) { doc.addPage(); y = 50; } doc.text(line, m, y); y += size * 1.3; }
  };
  const line = () => { doc.setDrawColor(180); doc.line(m, y, w - m, y); y += 8; };
  const head = (t: string) => { y += 6; txt(t, 11, 'bold'); y += 2; line(); };

  // Header
  if (r.name) txt(r.name, 16, 'bold');
  const contact = [r.email, r.phone, r.location].filter(Boolean).join(' | ');
  if (contact) txt(contact, 9, 'normal', [100,100,100]);
  const links = [r.linkedin, r.github].filter(Boolean).join(' | ');
  if (links) txt(links, 8, 'normal', [60,89,253]);
  y += 4; line();

  // Summary
  if (r.summary) { head('SUMMARY'); txt(r.summary, 9.5); }

  // Skills
  if (r.skills_grouped && Object.keys(r.skills_grouped).length) {
    head('SKILLS');
    for (const [cat, skills] of Object.entries(r.skills_grouped)) {
      if (Array.isArray(skills) && skills.length) txt(`${cat}: ${skills.join(', ')}`, 9);
    }
  }

  // Experience
  if (r.experience?.length) {
    head('EXPERIENCE');
    for (const exp of r.experience) {
      txt(`${exp.title || ''} - ${exp.company || ''}`, 10, 'bold');
      const meta = [exp.location, exp.dates].filter(Boolean).join(' | ');
      if (meta) txt(meta, 8, 'normal', [120,120,120]);
      for (const b of (exp.bullets || [])) txt(`• ${b}`, 9);
      y += 5;
    }
  }

  // Projects
  if (r.projects?.length) {
    head('PROJECTS');
    for (const p of r.projects) {
      const tech = p.technologies?.length ? ` | ${p.technologies.join(', ')}` : '';
      txt(`${p.name || ''}${tech}`, 10, 'bold');
      if (p.description) txt(p.description, 8, 'italic', [100,100,100]);
      for (const b of (p.bullets || [])) txt(`• ${b}`, 9);
      y += 5;
    }
  }

  // Education
  if (r.education?.length) {
    head('EDUCATION');
    for (const ed of r.education) {
      txt(`${ed.degree || ''} - ${ed.institution || ''}`, 10, 'bold');
      if (ed.dates) txt(ed.dates, 8, 'normal', [120,120,120]);
      if (ed.coursework?.length) txt(`Coursework: ${ed.coursework.join(', ')}`, 8, 'italic', [80,80,80]);
      y += 4;
    }
  }

  // Certifications
  if (r.certifications?.filter(Boolean).length) {
    head('CERTIFICATIONS');
    for (const c of r.certifications.filter(Boolean)) txt(`• ${c}`, 9);
  }

  const buf = new Uint8Array(doc.output('arraybuffer'));
  return new NextResponse(buf as any, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=${filename}.pdf` } });
}

async function generateDOCX(r: any, filename: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');
  const ch: any[] = [];

  // Header
  if (r.name) ch.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.name.toUpperCase(), bold: true, size: 28, font: 'Calibri' })] }));
  const contact = [r.email, r.phone, r.location].filter(Boolean).join(' | ');
  if (contact) ch.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: contact, size: 18, color: '555555', font: 'Calibri' })] }));
  const links = [r.linkedin, r.github].filter(Boolean).join(' | ');
  if (links) ch.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: links, size: 16, color: '3c59fd', font: 'Calibri' })] }));

  const sec = (title: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }, children: [new TextRun({ text: title, bold: true, size: 22, font: 'Calibri', allCaps: true })] });

  // Summary
  if (r.summary) { ch.push(sec('Summary')); ch.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: r.summary, size: 20, font: 'Calibri' })] })); }

  // Skills
  if (r.skills_grouped && Object.keys(r.skills_grouped).length) {
    ch.push(sec('Skills'));
    for (const [cat, skills] of Object.entries(r.skills_grouped)) {
      if (Array.isArray(skills) && skills.length) ch.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `${cat}: `, bold: true, size: 20, font: 'Calibri' }), new TextRun({ text: skills.join(', '), size: 20, font: 'Calibri' })] }));
    }
  }

  // Experience
  if (r.experience?.length) {
    ch.push(sec('Experience'));
    for (const exp of r.experience) {
      ch.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: `${exp.title || ''} - ${exp.company || ''}`, bold: true, size: 20, font: 'Calibri' })] }));
      const meta = [exp.location, exp.dates].filter(Boolean).join(' | ');
      if (meta) ch.push(new Paragraph({ children: [new TextRun({ text: meta, size: 18, color: '888888', font: 'Calibri' })] }));
      for (const b of (exp.bullets || [])) ch.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: b, size: 20, font: 'Calibri' })] }));
    }
  }

  // Projects
  if (r.projects?.length) {
    ch.push(sec('Projects'));
    for (const p of r.projects) {
      const techStr = p.technologies?.length ? ` | ${p.technologies.join(', ')}` : '';
      ch.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: `${p.name || ''}`, bold: true, size: 20, font: 'Calibri' }), new TextRun({ text: techStr, size: 18, color: '888888', font: 'Calibri' })] }));
      if (p.description) ch.push(new Paragraph({ children: [new TextRun({ text: p.description, size: 18, italics: true, color: '666666', font: 'Calibri' })] }));
      for (const b of (p.bullets || [])) ch.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: b, size: 20, font: 'Calibri' })] }));
    }
  }

  // Education
  if (r.education?.length) {
    ch.push(sec('Education'));
    for (const ed of r.education) {
      ch.push(new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: `${ed.degree || ''} - ${ed.institution || ''}`, bold: true, size: 20, font: 'Calibri' })] }));
      if (ed.dates) ch.push(new Paragraph({ children: [new TextRun({ text: ed.dates, size: 18, color: '888888', font: 'Calibri' })] }));
      if (ed.coursework?.length) ch.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Coursework: ', bold: true, size: 18, font: 'Calibri' }), new TextRun({ text: ed.coursework.join(', '), size: 18, color: '555555', font: 'Calibri' })] }));
    }
  }

  // Certifications
  if (r.certifications?.filter(Boolean).length) {
    ch.push(sec('Certifications'));
    for (const c of r.certifications.filter(Boolean)) ch.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: c, size: 20, font: 'Calibri' })] }));
  }

  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: ch }] });
  const buf = await Packer.toBuffer(doc);
  return new NextResponse(buf as any, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename=${filename}.docx` } });
}
