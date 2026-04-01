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

async function generatePDF(resume: any, filename: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const w = doc.internal.pageSize.getWidth();
  let y = 50;
  const margin = 50;
  const lineW = w - margin * 2;

  const addText = (text: string, size: number, style: string = 'normal', color: number[] = [0,0,0]) => {
    doc.setFontSize(size); doc.setTextColor(color[0], color[1], color[2]);
    if (style === 'bold') doc.setFont('helvetica', 'bold'); else doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, lineW);
    for (const line of lines) { if (y > 730) { doc.addPage(); y = 50; } doc.text(line, margin, y); y += size * 1.4; }
  };
  const addLine = () => { doc.setDrawColor(200); doc.line(margin, y, w - margin, y); y += 10; };

  // Header
  if (resume.name) { addText(resume.name, 16, 'bold'); }
  const contact = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean).join(' | ');
  if (contact) { addText(contact, 9, 'normal', [100,100,100]); }
  y += 5; addLine();

  // Summary
  if (resume.summary) { addText('SUMMARY', 10, 'bold'); y += 2; addText(resume.summary, 10); y += 8; }

  // Skills
  if (resume.skills_grouped && Object.keys(resume.skills_grouped).length) {
    addText('SKILLS', 10, 'bold'); y += 2;
    for (const [cat, skills] of Object.entries(resume.skills_grouped)) {
      if (Array.isArray(skills) && skills.length) addText(`${cat}: ${skills.join(', ')}`, 9);
    }
    y += 8;
  }

  // Experience
  if (resume.experience?.length) {
    addText('EXPERIENCE', 10, 'bold'); y += 2;
    for (const exp of resume.experience) {
      addText(`${exp.title || ''} — ${exp.company || ''}`, 10, 'bold');
      if (exp.dates) addText(exp.dates, 8, 'normal', [120,120,120]);
      for (const b of (exp.bullets || [])) { addText(`• ${b}`, 9); }
      y += 6;
    }
  }

  // Education
  if (resume.education?.length) {
    addText('EDUCATION', 10, 'bold'); y += 2;
    for (const ed of resume.education) {
      addText(`${ed.degree || ''} — ${ed.institution || ''}`, 10, 'bold');
      if (ed.dates) addText(ed.dates, 8, 'normal', [120,120,120]);
    }
  }

  const buf = new Uint8Array(doc.output('arraybuffer'));
  return new NextResponse(buf as any, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=${filename || 'resume'}.pdf` } });
}

async function generateDOCX(resume: any, filename: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');
  const children: any[] = [];
  
  if (resume.name) children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: resume.name, bold: true, size: 28, font: 'Calibri' })] }));
  const contact = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean).join(' | ');
  if (contact) children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: contact, size: 18, color: '666666', font: 'Calibri' })] }));
  
  const sectionHead = (title: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }, children: [new TextRun({ text: title, bold: true, size: 22, font: 'Calibri' })] });
  
  if (resume.summary) { children.push(sectionHead('SUMMARY')); children.push(new Paragraph({ children: [new TextRun({ text: resume.summary, size: 20, font: 'Calibri' })] })); }
  
  if (resume.skills_grouped) { children.push(sectionHead('SKILLS')); for (const [cat, skills] of Object.entries(resume.skills_grouped)) { if (Array.isArray(skills) && skills.length) children.push(new Paragraph({ children: [new TextRun({ text: `${cat}: `, bold: true, size: 20, font: 'Calibri' }), new TextRun({ text: skills.join(', '), size: 20, font: 'Calibri' })] })); } }
  
  if (resume.experience?.length) { children.push(sectionHead('EXPERIENCE')); for (const exp of resume.experience) { children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: `${exp.title || ''} — ${exp.company || ''}`, bold: true, size: 20, font: 'Calibri' })] })); if (exp.dates) children.push(new Paragraph({ children: [new TextRun({ text: exp.dates, size: 18, color: '888888', font: 'Calibri' })] })); for (const b of (exp.bullets || [])) children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size: 20, font: 'Calibri' })] })); } }
  
  if (resume.projects?.length) { children.push(sectionHead('PROJECTS')); for (const proj of resume.projects) { children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: proj.name || '', bold: true, size: 20, font: 'Calibri' }), new TextRun({ text: proj.technologies?.length ? ' | ' + proj.technologies.join(', ') : '', size: 18, color: '888888', font: 'Calibri' })] })); if (proj.description) children.push(new Paragraph({ children: [new TextRun({ text: proj.description, size: 18, italics: true, color: '666666', font: 'Calibri' })] })); for (const b of (proj.bullets || [])) children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size: 20, font: 'Calibri' })] })); } }

  if (resume.education?.length) { children.push(sectionHead('EDUCATION')); for (const ed of resume.education) { children.push(new Paragraph({ children: [new TextRun({ text: `${ed.degree || ''} — ${ed.institution || ''}`, bold: true, size: 20, font: 'Calibri' })] })); if (ed.dates) children.push(new Paragraph({ children: [new TextRun({ text: ed.dates, size: 18, color: '888888', font: 'Calibri' })] })); } }

  if (resume.certifications?.length) { children.push(sectionHead('CERTIFICATIONS')); for (const c of resume.certifications.filter(Boolean)) children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: c, size: 20, font: 'Calibri' })] })); }

  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }] });
  const buf = await Packer.toBuffer(doc);
  return new NextResponse(buf as any, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename=${filename || 'resume'}.docx` } });
}
