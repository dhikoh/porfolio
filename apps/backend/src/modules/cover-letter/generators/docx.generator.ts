import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  HeadingLevel, TabStopType, TabStopPosition, ImageRun,
} from 'docx';
import { CreateCoverLetterDto } from '../dto/cover-letter.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function generateCoverLetterDocx(dto: CreateCoverLetterDto): Promise<Buffer> {
  const isEN = dto.language === 'en';
  const font = 'Times New Roman';
  const fontSize = 24; // half-points (12pt)

  const normal = (text: string, opts?: Record<string, unknown>) =>
    new TextRun({ text, font, size: fontSize, ...(opts || {}) } as ConstructorParameters<typeof TextRun>[0]);

  const emptyLine = () => new Paragraph({ spacing: { after: 120 } });

  const paragraphs: Paragraph[] = [];

  // City, Date
  paragraphs.push(new Paragraph({ children: [normal(`${dto.city}, ${dto.date}`)] }));
  paragraphs.push(emptyLine());

  // Hal & Lampiran
  const halLabel = isEN ? 'Subject' : 'Hal';
  const lampiranLabel = isEN ? 'Enclosure' : 'Lampiran';
  const lampiranUnit = isEN ? (dto.attachments.length > 1 ? 'Pages' : 'Page') : 'Lembar';
  paragraphs.push(new Paragraph({
    children: [normal(`${halLabel}: ${isEN ? 'Job Application' : 'Lamaran Pekerjaan'} – ${dto.position}`)],
  }));
  paragraphs.push(new Paragraph({
    children: [normal(`${lampiranLabel}: ${dto.attachments.length} ${lampiranUnit}`)],
  }));
  paragraphs.push(emptyLine());

  // Recipient
  paragraphs.push(new Paragraph({ children: [normal(isEN ? 'To,' : 'Kepada Yth.,')] }));
  paragraphs.push(new Paragraph({ children: [normal(`${dto.recipientTitle} ${dto.companyName}`)] }));
  dto.companyAddress.split('\n').forEach(line => {
    paragraphs.push(new Paragraph({ children: [normal(line.trim())] }));
  });
  paragraphs.push(emptyLine());

  // Greeting
  paragraphs.push(new Paragraph({ children: [normal(isEN ? 'Dear Sir/Madam,' : 'Dengan hormat,')] }));
  paragraphs.push(emptyLine());

  // Opening
  paragraphs.push(new Paragraph({
    children: [normal(dto.openingParagraph)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
  }));
  paragraphs.push(emptyLine());

  // Personal Data
  paragraphs.push(new Paragraph({
    children: [normal(isEN ? 'Here is my brief personal data:' : 'Berikut adalah data diri singkat saya:')],
    spacing: { line: 360 },
  }));

  const personalData = [
    [isEN ? 'Name' : 'Nama', dto.fullName],
    [isEN ? 'Place, Date of Birth' : 'Tempat, Tanggal Lahir', `${dto.birthPlace}, ${dto.birthDate}`],
    [isEN ? 'Last Education' : 'Pendidikan Terakhir', dto.education],
    [isEN ? 'Phone / WA' : 'No. Telepon / WA', dto.phone],
    ['Email', dto.email],
  ];
  if (dto.website) {
    personalData.push([isEN ? 'Portfolio Website' : 'Website Portofolio', dto.website]);
  }
  personalData.forEach(([label, value]) => {
    paragraphs.push(new Paragraph({
      children: [normal(`${label}: ${value}`)],
      indent: { left: 400 },
    }));
  });
  paragraphs.push(emptyLine());

  // Body
  paragraphs.push(new Paragraph({
    children: [normal(dto.bodyParagraph)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
  }));
  paragraphs.push(emptyLine());

  // Attachments
  paragraphs.push(new Paragraph({
    children: [normal(isEN
      ? 'For your consideration, I enclose the following:'
      : 'Sebagai bahan pertimbangan Bapak/Ibu, bersama surat ini turut saya lampirkan:')],
    spacing: { line: 360 },
  }));
  dto.attachments.forEach((att, i) => {
    paragraphs.push(new Paragraph({
      children: [normal(`${i + 1}. ${att}`)],
      indent: { left: 400 },
    }));
  });
  paragraphs.push(emptyLine());

  // Closing
  paragraphs.push(new Paragraph({
    children: [normal(dto.closingParagraph)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
  }));
  paragraphs.push(emptyLine());

  // Thank you
  paragraphs.push(new Paragraph({
    children: [normal(isEN
      ? 'Thank you for your time and consideration.'
      : 'Atas waktu dan pertimbangan Bapak/Ibu, saya mengucapkan terima kasih.')],
  }));
  paragraphs.push(emptyLine());

  // Closing salutation
  paragraphs.push(new Paragraph({ children: [normal(isEN ? 'Sincerely,' : 'Hormat saya,')] }));

  // Signature image
  if (dto.signatureUrl) {
    const sigPath = path.join(process.cwd(), dto.signatureUrl);
    if (fs.existsSync(sigPath)) {
      const imageData = fs.readFileSync(sigPath);
      paragraphs.push(new Paragraph({
        children: [
          new ImageRun({
            data: imageData,
            transformation: { width: 150, height: 60 },
            type: 'png',
          }),
        ],
      }));
    }
  }
  paragraphs.push(emptyLine());
  paragraphs.push(emptyLine());

  // Name
  paragraphs.push(new Paragraph({ children: [normal(`(${dto.fullName})`)] }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: paragraphs,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
