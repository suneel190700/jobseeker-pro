export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'docx';
    const { resume } = await request.json();
    if (!resume) return NextResponse.json({ error: 'Resume data required.' }, { status: 400 });

    const children: any[] = [];

    // Name
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: resume.name || 'Your Name', bold: true, size: 32, font: 'Calibri' })] }));

    // Contact
    const contact = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean);
    if (contact.length) children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: contact.join('  |  '), size: 18, font: 'Calibri', color: '555555' })] }));

    children.push(new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }, children: [] }));

    // Summary
    if (resume.summary) { children.push(sectionHead('PROFESSIONAL SUMMARY')); children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: resume.summary, size: 21, font: 'Calibri' })] })); }

    // Skills
    if (resume.skills?.length) { children.push(sectionHead('TECHNICAL SKILLS')); children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: resume.skills.join('  •  '), size: 21, font: 'Calibri' })] })); }

    // Experience
    if (resume.experience?.length) {
      children.push(sectionHead('PROFESSIONAL EXPERIENCE'));
      for (const exp of resume.experience) {
        children.push(new Paragraph({ spacing: { before: 120, after: 0 }, children: [new TextRun({ text: exp.company || '', bold: true, size: 22, font: 'Calibri' }), new TextRun({ text: exp.dates ? `  |  ${exp.dates}` : '', size: 20, font: 'Calibri', color: '666666' })] }));
        children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: exp.title || '', italics: true, size: 21, font: 'Calibri' }), new TextRun({ text: exp.location ? `  |  ${exp.location}` : '', size: 20, font: 'Calibri', color: '666666' })] }));
        for (const b of (exp.bullets || [])) { children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [new TextRun({ text: '- ', size: 21, font: 'Calibri' }), new TextRun({ text: b, size: 21, font: 'Calibri' })] })); }
      }
    }

    // Education
    if (resume.education?.length) {
      children.push(sectionHead('EDUCATION'));
      for (const edu of resume.education) {
        children.push(new Paragraph({ spacing: { before: 80, after: 0 }, children: [new TextRun({ text: edu.institution || '', bold: true, size: 22, font: 'Calibri' }), new TextRun({ text: edu.dates ? `  |  ${edu.dates}` : '', size: 20, font: 'Calibri', color: '666666' })] }));
        children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: edu.degree || '', italics: true, size: 21, font: 'Calibri' })] }));
        if (edu.details) children.push(new Paragraph({ spacing: { after: 80 }, indent: { left: 360 }, children: [new TextRun({ text: edu.details, size: 20, font: 'Calibri', color: '555555' })] }));
      }
    }

    // Certifications
    if (resume.certifications?.length) {
      children.push(sectionHead('CERTIFICATIONS'));
      for (const c of resume.certifications) { children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [new TextRun({ text: `- ${c}`, size: 21, font: 'Calibri' })] })); }
    }

    const doc = new Document({ sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }] });
    const buffer = await Packer.toBuffer(doc);

    if (format === 'pdf') {
      // Return DOCX with PDF content-type hint — client can convert or we return DOCX labeled as such
      // True PDF conversion requires LibreOffice which isn't available in serverless
      // For now, return DOCX and label it clearly
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="optimized_resume.docx"',
        },
      });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="optimized_resume.docx"',
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 });
  }
}

function sectionHead(text: string) {
  return new Paragraph({ spacing: { before: 240, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } }, children: [new TextRun({ text, bold: true, size: 22, font: 'Calibri', color: '1a365d' })] });
}
