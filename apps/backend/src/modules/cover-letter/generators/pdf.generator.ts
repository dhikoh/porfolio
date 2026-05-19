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
    const pageHeight = doc.page.height - doc.page.margins.bottom;

    // Register font
    doc.font('Times-Roman');
    doc.fontSize(12);

    // === City, Date (right-aligned) ===
    doc.text(`${dto.city}, ${dto.date}`, { align: 'right' });
    doc.moveDown(1);

    // === Hal & Lampiran ===
    const halLabel = isEN ? 'Subject' : 'Hal';
    const lampiranLabel = isEN ? 'Encl.' : 'Lamp';
    const lampiranUnit = isEN ? (dto.attachments.length > 1 ? 'Pages' : 'Page') : 'Lembar';
    doc.text(`${halLabel}   : ${isEN ? 'Job Application' : 'Lamaran Pekerjaan'} – ${dto.position}`);
    doc.text(`${lampiranLabel}  : ${dto.attachments.length} ${lampiranUnit}`);
    doc.moveDown(1);

    // === Recipient ===
    doc.text(isEN ? 'To,' : 'Kepada Yth.');
    doc.text(`${dto.recipientTitle} ${dto.companyName}`);
    dto.companyAddress.split('\n').forEach(line => doc.text(line.trim()));
    doc.moveDown(1);

    // === Greeting ===
    doc.text(isEN ? 'Dear Sir/Madam,' : 'Dengan hormat,');
    doc.moveDown(0.5);

    // === Opening Paragraph ===
    doc.text(dto.openingParagraph, { align: 'justify', lineGap: 4 });
    doc.moveDown(0.5);

    // === "Saya yang bertanda tangan di bawah ini:" ===
    doc.text(isEN
      ? 'I, the undersigned:'
      : 'Saya yang bertanda tangan di bawah ini:', { lineGap: 4 });
    doc.moveDown(0.3);

    // Personal data with aligned colons
    const labelWidth = 170;
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
      const y = doc.y;
      doc.text(label, doc.page.margins.left + 20, y, { width: labelWidth, continued: false });
      doc.text(`: ${value}`, doc.page.margins.left + 20 + labelWidth, y);
    });
    doc.moveDown(0.5);

    // === Body Paragraph ===
    doc.text(dto.bodyParagraph, doc.page.margins.left, doc.y, { align: 'justify', lineGap: 4 });
    doc.moveDown(0.5);

    // === Attachments with intro sentence ===
    doc.text(isEN
      ? 'To complete the required administrative documents and for your consideration, I also enclose the following:'
      : 'Untuk melengkapi beberapa data yang diperlukan sebagai persyaratan administrasi dan juga sebagai bahan pertimbangan Bapak/Ibu, saya lampirkan juga kelengkapan data diri sebagai berikut:', { align: 'justify', lineGap: 4 });
    doc.moveDown(0.3);
    dto.attachments.forEach((att, i) => {
      doc.text(`${i + 1}.  ${att}`, { indent: 30 });
    });
    doc.moveDown(0.5);

    // === Closing Paragraph ===
    doc.text(dto.closingParagraph, { align: 'justify', lineGap: 4 });

    // === PAGE BREAK GUARD for signature block ===
    // Ensure entire signature block (Hormat saya + TTD + nama) fits on one page
    const sigBlockHeight = 130; // estimated height: label(20) + space(10) + image(50) + space(30) + name(20)
    if (doc.y + sigBlockHeight > pageHeight) {
      doc.addPage();
    }
    doc.moveDown(1.5);

    // === Signature block (right-aligned) ===
    const sigBlockX = doc.page.width - doc.page.margins.right - 180;
    let cursorY = doc.y;

    // "Hormat saya,"
    doc.text(isEN ? 'Sincerely,' : 'Hormat saya,', sigBlockX, cursorY, { width: 180 });
    cursorY = doc.y + 5;

    // Signature image if available
    if (dto.signatureUrl) {
      const sigPath = path.join(process.cwd(), dto.signatureUrl);
      if (fs.existsSync(sigPath)) {
        doc.image(sigPath, sigBlockX + 10, cursorY, { width: 120, height: 50 });
        cursorY += 55;
      } else {
        cursorY += 55;
      }
    } else {
      cursorY += 55;
    }

    // Name — explicit X,Y to maintain alignment
    doc.text(`(${dto.fullName})`, sigBlockX, cursorY, { width: 180 });

    doc.end();
  });
}
