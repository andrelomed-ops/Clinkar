// Quick test to verify jsPDF is properly installed and can generate PDFs
const { jsPDF } = require('jspdf');

try {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Test Contrato', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Este es un contrato de prueba', 20, 40);
  
  const buffer = doc.output('arraybuffer');
  console.log('✅ jsPDF working - buffer size:', buffer.byteLength, 'bytes');
  console.log('✅ PDF generation is functional');
} catch(e) {
  console.error('❌ jsPDF error:', e.message);
}
