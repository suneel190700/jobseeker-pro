export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, LevelFormat,
} from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { resume } = await request.json();

    if (!resume) {
      return NextResponse.json({ error: 'Resume data required.' }, { status: 400 });
    }

    const children: any[] = [];

    // ---- Header: Name ----
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: resume.name || 'Your Name', bold: true, size: 32, font: 'Calibri' }),
        ],
      })
    );

    // ---- Contact Line ----
    const contactParts: string[] = [];
    if (resume.email) contactParts.push(resume.email);
    if (resume.phone) contactParts.push(resume.phone);
    if (resume.location) contactParts.push(resume.location);
    if (resume.linkedin) contactParts.push(resume.linkedin);
    if (resume.github) contactParts.push(resume.github);

    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Calibri', color: '555555' }),
          ],
        })
      );
    }

    // ---- Divider ----
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        children: [],
      })
    );

    // ---- Summary ----
    if (resume.summary) {
      children.push(sectionHeading('PROFESSIONAL SUMMARY'));
      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: resume.summary, size: 21, font: 'Calibri' })],
        })
      );
    }

    // ---- Skills ----
    if (resume.skills && resume.skills.length > 0) {
      children.push(sectionHeading('TECHNICAL SKILLS'));
      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: resume.skills.join('  •  '), size: 21, font: 'Calibri' })],
        })
      );
    }

    // ---- Experience ----
    if (resume.experience && resume.experience.length > 0) {
      children.push(sectionHeading('PROFESSIONAL EXPERIENCE'));

      for (const exp of resume.experience) {
        // Company + Dates
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 0 },
            children: [
              new TextRun({ text: exp.company || '', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: exp.dates ? `  |  ${exp.dates}` : '', size: 20, font: 'Calibri', color: '666666' }),
            ],
          })
        );

        // Title + Location
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: exp.title || '', italics: true, size: 21, font: 'Calibri' }),
              new TextRun({ text: exp.location ? `  |  ${exp.location}` : '', size: 20, font: 'Calibri', color: '666666' }),
            ],
          })
        );

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          for (const bullet of exp.bullets) {
            children.push(
              new Paragraph({
                spacing: { after: 40 },
                indent: { left: 360 },
                children: [
                  new TextRun({ text: '•  ', size: 21, font: 'Calibri' }),
                  new TextRun({ text: bullet, size: 21, font: 'Calibri' }),
                ],
              })
            );
          }
        }
      }
    }

    // ---- Education ----
    if (resume.education && resume.education.length > 0) {
      children.push(sectionHeading('EDUCATION'));

      for (const edu of resume.education) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 0 },
            children: [
              new TextRun({ text: edu.institution || '', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: edu.dates ? `  |  ${edu.dates}` : '', size: 20, font: 'Calibri', color: '666666' }),
            ],
          })
        );
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: edu.degree || '', italics: true, size: 21, font: 'Calibri' }),
            ],
          })
        );
        if (edu.details) {
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              indent: { left: 360 },
              children: [new TextRun({ text: edu.details, size: 20, font: 'Calibri', color: '555555' })],
            })
          );
        }
      }
    }

    // ---- Certifications ----
    if (resume.certifications && resume.certifications.length > 0) {
      children.push(sectionHeading('CERTIFICATIONS'));
      for (const cert of resume.certifications) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '•  ', size: 21, font: 'Calibri' }),
              new TextRun({ text: cert, size: 21, font: 'Calibri' }),
            ],
          })
        );
      }
    }

    // ---- Build Document ----
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="optimized_resume.docx"`,
      },
    });
  } catch (error: any) {
    console.error('DOCX generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate document.' }, { status: 500 });
  }
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
    children: [
      new TextRun({ text, bold: true, size: 22, font: 'Calibri', color: '1a365d' }),
    ],
  });
}
