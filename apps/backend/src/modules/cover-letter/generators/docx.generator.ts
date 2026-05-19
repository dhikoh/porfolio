import {
  Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun,
} from 'docx';
import { CreateCoverLetterDto } from '../dto/cover-letter.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function generateCoverLetterDocx(dto: CreateCoverLetterDto): Promise<Buffer> {
  const isEN = dto.language === 'en';
  const font = 'Times New Roman';
  const fontSize = 24; // half-points (12pt)

  const txt = (text: string, opts?: Record<string, unknown>) =>
    new TextRun({ text, font, size: fontSize, ...(opts || {}) } as ConstructorParameters<typeof TextRun>[0]);

  const emptyLine = () => new Paragraph({ spacing: { after: 120 } });

  const paragraphs: Paragraph[] = [];

  // City, Date — right-aligned
  paragraphs.push(new Paragraph({
    children: [txt(`${dto.city}, ${dto.date}`)],
    alignment: AlignmentType.RIGHT,
  }));
  paragraphs.push(emptyLine());

  // Hal & Lampiran
  const halLabel = isEN ? 'Subject' : 'Hal';
  const lampiranLabel = isEN ? 'Encl.' : 'Lamp';
  const lampiranUnit = isEN ? (dto.attachments.length > 1 ? 'Pages' : 'Page') : 'Lembar';
  paragraphs.push(new Paragraph({
    children: [txt(`${halLabel}   : ${isEN ? 'Job Application' : 'Lamaran Pekerjaan'} – ${dto.position}`)],
  }));
  paragraphs.push(new Paragraph({
    children: [txt(`${lampiranLabel}  : ${dto.attachments.length} ${lampiranUnit}`)],
  }));
  paragraphs.push(emptyLine());

  // Recipient
  paragraphs.push(new Paragraph({ children: [txt(isEN ? 'To,' : 'Kepada Yth.')] }));
  paragraphs.push(new Paragraph({ children: [txt(`${dto.recipientTitle} ${dto.companyName}`)] }));
  dto.companyAddress.split('\n').forEach(line => {
    paragraphs.push(new Paragraph({ children: [txt(line.trim())] }));
  });
  paragraphs.push(emptyLine());

  // Greeting
  paragraphs.push(new Paragraph({ children: [txt(isEN ? 'Dear Sir/Madam,' : 'Dengan hormat,')] }));
  paragraphs.push(emptyLine());

  // Opening
  paragraphs.push(new Paragraph({
    children: [txt(dto.openingParagraph)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
  }));
  paragraphs.push(emptyLine());

  // "Saya yang bertanda tangan di bawah ini:"
  paragraphs.push(new Paragraph({
    children: [txt(isEN ? 'I, the undersigned:' : 'Saya yang bertanda tangan di bawah ini:')],
    spacing: { line: 360 },
  }));

  // Personal data with colon alignment
  const personalRows: [string, string][] = [
    [isEN ? 'Name' : 'Nama', dto.fullName],
    [isEN ? 'Place, Date of Birth' : 'Tempat, Tanggal Lahir', `${dto.birthPlace}, ${dto.birthDate}`],
  ];
  if (dto.gender) {
    personalRows.push([isEN ? 'Gender' : 'Jenis Kelamin', dto.gender]);
  }
  if (dto.address) {
    personalRows.push([isEN ? 'Address' : 'Alamat', dto.address]);
  }
  personalRows.push(
    [isEN ? 'Last Education' : 'Pendidikan Terakhir', dto.education],
    [isEN ? 'Phone / WA' : 'Nomor Handphone', dto.phone],
    ['Email', dto.email],
  );
  if (dto.website) {
    personalRows.push([isEN ? 'Portfolio Website' : 'Website Portofolio', dto.website]);
  }

  personalRows.forEach(([label, value]) => {
    // Pad label to align colons
    const paddedLabel = label.padEnd(25);
    paragraphs.push(new Paragraph({
      children: [txt(`${paddedLabel}: ${value}`)],
      indent: { left: 400 },
    }));
  });
  paragraphs.push(emptyLine());

  // Body
  paragraphs.push(new Paragraph({
    children: [txt(dto.bodyParagraph)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
  }));
  paragraphs.push(emptyLine());

  // Attachment intro sentence + list
  paragraphs.push(new Paragraph({
    children: [txt(isEN
      ? 'To complete the required administrative documents and for your consideration, I also enclose the following:'
      : 'Untuk melengkapi beberapa data yang diperlukan sebagai persyaratan administrasi dan juga sebagai bahan pertimbangan Bapak/Ibu, saya lampirkan juga kelengkapan data diri sebagai berikut:')],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
  }));
  dto.attachments.forEach((att, i) => {
    paragraphs.push(new Paragraph({
      children: [txt(`${i + 1}.  ${att}`)],
      indent: { left: 600 },
    }));
  });
  paragraphs.push(emptyLine());

  // Closing
  paragraphs.push(new Paragraph({
    children: [txt(dto.closingParagraph)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
  }));
  paragraphs.push(emptyLine());

  // Signature block — right-aligned
  paragraphs.push(new Paragraph({
    children: [txt(isEN ? 'Sincerely,' : 'Hormat saya,')],
    alignment: AlignmentType.RIGHT,
  }));

  // Signature image
  if (dto.signatureUrl) {
    const sigPath = path.join(process.cwd(), dto.signatureUrl);
    if (fs.existsSync(sigPath)) {
      const imageData = fs.readFileSync(sigPath);
      const ext = path.extname(sigPath).toLowerCase();
      paragraphs.push(new Paragraph({
        children: [
          new ImageRun({
            data: imageData,
            transformation: { width: 120, height: 50 },
            type: ext === '.png' ? 'png' : 'jpg',
          }),
        ],
        alignment: AlignmentType.RIGHT,
      }));
    }
  }
  paragraphs.push(emptyLine());
  paragraphs.push(emptyLine());

  // Name
  paragraphs.push(new Paragraph({
    children: [txt(`(${dto.fullName})`)],
    alignment: AlignmentType.RIGHT,
  }));

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
