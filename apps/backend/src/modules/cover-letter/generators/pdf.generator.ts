import PDFDocument from 'pdfkit';
import { CreateCoverLetterDto } from '../dto/cover-letter.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function generateCoverLetterPdf(dto: CreateCoverLetterDto): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const isEN = dto.language === 'en';
    const lineHeight = 16;

    // Register font
    doc.font('Times-Roman');

    // === Header: City, Date ===
    doc.fontSize(12).text(`${dto.city}, ${dto.date}`, { align: 'left' });
    doc.moveDown(1);

    // === Hal & Lampiran ===
    const halLabel = isEN ? 'Subject' : 'Hal';
    const lampiranLabel = isEN ? 'Enclosure' : 'Lampiran';
    const lampiranUnit = isEN ? (dto.attachments.length > 1 ? 'Pages' : 'Page') : 'Lembar';
    doc.text(`${halLabel}: ${isEN ? 'Job Application' : 'Lamaran Pekerjaan'} – ${dto.position}`);
    doc.text(`${lampiranLabel}: ${dto.attachments.length} ${lampiranUnit}`);
    doc.moveDown(1);

    // === Recipient ===
    const kepadaLabel = isEN ? 'To,' : 'Kepada Yth.,';
    doc.text(kepadaLabel);
    doc.text(`${dto.recipientTitle} ${dto.companyName}`);
    dto.companyAddress.split('\n').forEach(line => doc.text(line.trim()));
    doc.moveDown(1);

    // === Greeting ===
    doc.text(isEN ? 'Dear Sir/Madam,' : 'Dengan hormat,');
    doc.moveDown(0.5);

    // === Opening Paragraph ===
    doc.text(dto.openingParagraph, { align: 'justify', lineGap: 4 });
    doc.moveDown(0.5);

    // === Personal Data ===
    doc.text(isEN ? 'Here is my brief personal data:' : 'Berikut adalah data diri singkat saya:', { lineGap: 4 });
    doc.moveDown(0.3);

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
      doc.text(`${label}: ${value}`, { indent: 20 });
    });
    doc.moveDown(0.5);

    // === Body Paragraph ===
    doc.text(dto.bodyParagraph, { align: 'justify', lineGap: 4 });
    doc.moveDown(0.5);

    // === Attachments ===
    doc.text(isEN
      ? 'For your consideration, I enclose the following:'
      : 'Sebagai bahan pertimbangan Bapak/Ibu, bersama surat ini turut saya lampirkan:', { lineGap: 4 });
    doc.moveDown(0.3);
    dto.attachments.forEach((att, i) => {
      doc.text(`${i + 1}. ${att}`, { indent: 20 });
    });
    doc.moveDown(0.5);

    // === Closing Paragraph ===
    doc.text(dto.closingParagraph, { align: 'justify', lineGap: 4 });
    doc.moveDown(0.5);

    // === Thank you ===
    doc.text(isEN
      ? 'Thank you for your time and consideration.'
      : 'Atas waktu dan pertimbangan Bapak/Ibu, saya mengucapkan terima kasih.');
    doc.moveDown(1);

    // === Closing & Signature ===
    doc.text(isEN ? 'Sincerely,' : 'Hormat saya,');
    doc.moveDown(0.5);

    // Signature image if available
    if (dto.signatureUrl) {
      const sigPath = path.join(process.cwd(), dto.signatureUrl);
      if (fs.existsSync(sigPath)) {
        doc.image(sigPath, { width: 150, height: 60 });
      }
    }
    doc.moveDown(2);

    doc.text(`(${dto.fullName})`);

    doc.end();
  });
}
