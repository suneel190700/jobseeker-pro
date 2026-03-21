export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { resume } = await request.json();
    if (!resume) return NextResponse.json({ error: 'Resume data required.' }, { status: 400 });

    const isOnePage = (resume.page_target || 1) === 1;
    const bodySize = isOnePage ? 20 : 21;
    const nameSize = isOnePage ? 28 : 32;
    const headSize = isOnePage ? 21 : 22;
    const margin = isOnePage ? 900 : 1000;

    const children: any[] = [];

    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [new TextRun({ text: resume.name || 'Your Name', bold: true, size: nameSize, font: 'Calibri' })] }));
    const contact = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean);
    if (contact.length) children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: contact.join('  |  '), size: 17, font: 'Calibri', color: '555555' })] }));
    children.push(new Paragraph({ spacing: { after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }, children: [] }));

    if (resume.summary) { children.push(sHead('PROFESSIONAL SUMMARY', headSize)); children.push(new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: resume.summary, size: bodySize, font: 'Calibri' })] })); }

    if (resume.skills_grouped && Object.keys(resume.skills_grouped).length > 0) {
      children.push(sHead('TECHNICAL SKILLS', headSize));
      for (const [cat, skills] of Object.entries(resume.skills_grouped)) {
        children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `${cat}: `, bold: true, size: bodySize, font: 'Calibri' }), new TextRun({ text: (skills as string[]).join(', '), size: bodySize, font: 'Calibri' })] }));
      }
      children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    } else if (resume.skills?.length) {
      children.push(sHead('TECHNICAL SKILLS', headSize));
      children.push(new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: resume.skills.join('  •  '), size: bodySize, font: 'Calibri' })] }));
    }

    if (resume.experience?.length) {
      children.push(sHead('PROFESSIONAL EXPERIENCE', headSize));
      for (const exp of resume.experience) {
        children.push(new Paragraph({ spacing: { before: 80, after: 0 }, children: [new TextRun({ text: exp.company || '', bold: true, size: bodySize + 1, font: 'Calibri' }), new TextRun({ text: exp.dates ? `  |  ${exp.dates}` : '', size: bodySize - 1, font: 'Calibri', color: '666666' })] }));
        children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: exp.title || '', italics: true, size: bodySize, font: 'Calibri' }), new TextRun({ text: exp.location ? `  |  ${exp.location}` : '', size: bodySize - 1, font: 'Calibri', color: '666666' })] }));
        for (const b of (exp.bullets || [])) { children.push(new Paragraph({ spacing: { after: 30 }, indent: { left: 280 }, children: [new TextRun({ text: '- ', size: bodySize, font: 'Calibri' }), new TextRun({ text: b, size: bodySize, font: 'Calibri' })] })); }
      }
    }

    if (resume.education?.length) {
      children.push(sHead('EDUCATION', headSize));
      for (const edu of resume.education) {
        children.push(new Paragraph({ spacing: { before: 40, after: 0 }, children: [new TextRun({ text: edu.institution || '', bold: true, size: bodySize + 1, font: 'Calibri' }), new TextRun({ text: edu.dates ? `  |  ${edu.dates}` : '', size: bodySize - 1, font: 'Calibri', color: '666666' })] }));
        children.push(new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: edu.degree || '', italics: true, size: bodySize, font: 'Calibri' })] }));
        if (edu.details) children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 280 }, children: [new TextRun({ text: edu.details, size: bodySize - 1, font: 'Calibri', color: '555555' })] }));
      }
    }

    if (resume.certifications?.filter(Boolean).length > 0) {
      children.push(sHead('CERTIFICATIONS', headSize));
      for (const c of resume.certifications.filter(Boolean)) { children.push(new Paragraph({ spacing: { after: 30 }, indent: { left: 280 }, children: [new TextRun({ text: `- ${c}`, size: bodySize, font: 'Calibri' })] })); }
    }

    const doc = new Document({ sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: margin, right: margin, bottom: margin, left: margin } } }, children }] });
    const buffer = await Packer.toBuffer(doc);
    return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': 'attachment; filename="optimized_resume.docx"' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function sHead(text: string, size: number) {
  return new Paragraph({ spacing: { before: 160, after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }, children: [new TextRun({ text, bold: true, size, font: 'Calibri', color: '1a365d' })] });
}
