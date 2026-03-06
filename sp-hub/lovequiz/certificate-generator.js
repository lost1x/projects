// Certificate Generator using HTML5 Canvas
class CertificateGenerator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this._scaled = false;

    // ? COLOR SETTINGS ? customize freely
    this.colors = {
      backgroundGradientStart: "black",
      backgroundGradientMiddle: "darkred",
      backgroundGradientEnd: "black",
      borderOuter: "white",
      borderInner: "rgba(255, 255, 255, 0.7)",
      cornerDecorations: "rgba(255, 255, 255, 0.8)",
      mainText: "#ffffff",
      secondaryText: "rgba(255, 255, 255, 0.9)",
      subtleText: "rgba(255, 255, 255, 0.8)",
      faintLine: "rgba(255, 255, 255, 0.7)",
    };
  }

  async generateCertificate(loveLanguage) {
    this.canvas = document.getElementById("certificate-canvas");
    if (!this.canvas) return console.error("Canvas element not found");

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return console.error("Canvas context not found");

    // Scale for HD quality
    const scale = 2;
    this.canvas.width = 800 * scale;
    this.canvas.height = 600 * scale;
    this.canvas.style.width = "800px";
    this.canvas.style.height = "600px";

    if (!this._scaled) {
      this.ctx.scale(scale, scale);
      this._scaled = true;
    }

    this.ctx.clearRect(0, 0, 800, 600);

    // Gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, this.colors.backgroundGradientStart);
    gradient.addColorStop(0.5, this.colors.backgroundGradientMiddle);
    gradient.addColorStop(1, this.colors.backgroundGradientEnd);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 800, 600);

    // Draw border & content
    this.drawBorder();
    await this.drawCertificateContent(loveLanguage);

    return this.canvas.toDataURL("image/png", 1.0);
  }

  drawBorder() {
    // Outer border
    this.ctx.strokeStyle = this.colors.borderOuter;
    this.ctx.lineWidth = 8;
    this.ctx.strokeRect(20, 20, 760, 560);

    // Inner border
    this.ctx.strokeStyle = this.colors.borderInner;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(40, 40, 720, 520);

    // Corner circles
    this.drawCornerDecorations();
  }

  drawCornerDecorations() {
    const corners = [
      { x: 60, y: 60 },
      { x: 740, y: 60 },
      { x: 60, y: 540 },
      { x: 740, y: 540 },
    ];

    this.ctx.fillStyle = this.colors.cornerDecorations;
    for (const c of corners) {
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, 15, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  async drawCertificateContent(loveLanguage) {
    const loveLanguageData = quizData.loveLanguages[loveLanguage];
    if (!loveLanguageData) return console.error("Invalid love language:", loveLanguage);

    this.ctx.fillStyle = this.colors.mainText;
    this.ctx.textAlign = "center";

    // Title
    this.ctx.font = "bold 36px Poppins, Arial, sans-serif";
    this.ctx.fillText("Certificate of Love Language", 400, 120);

    // Divider line
    this.ctx.strokeStyle = this.colors.mainText;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(200, 140);
    this.ctx.lineTo(600, 140);
    this.ctx.stroke();

    // Icon
    this.ctx.font = "72px Arial, sans-serif";
    this.ctx.fillText(loveLanguageData.icon, 400, 220);

    // Main Love Language Title
    this.ctx.font = "bold 42px Poppins, Arial, sans-serif";
    this.ctx.fillText(loveLanguageData.title, 400, 280);

    // Subtitle
    this.ctx.font = "18px Poppins, Arial, sans-serif";
    this.ctx.fillStyle = this.colors.secondaryText;
    this.ctx.fillText("This certifies that your primary love language is", 400, 320);

    // Description
    this.drawWrappedText(loveLanguageData.description, 400, 360, 600, 20);

    // Date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    this.ctx.font = "16px Poppins, Arial, sans-serif";
    this.ctx.fillStyle = this.colors.subtleText;
    this.ctx.fillText(`Issued on ${currentDate}`, 400, 480);

    // Footer Line
    this.ctx.strokeStyle = this.colors.faintLine;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(550, 540);
    this.ctx.lineTo(720, 540);
    this.ctx.stroke();

    // Footer Text
    this.ctx.font = "14px Poppins, Arial, sans-serif";
    this.ctx.fillText("Love Language Quiz", 635, 555);
  }

  drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    this.ctx.font = "16px Poppins, Arial, sans-serif";
    this.ctx.fillStyle = this.colors.secondaryText;
    this.ctx.textAlign = "center";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const testWidth = this.ctx.measureText(testLine).width;

      if (testWidth > maxWidth && n > 0) {
        this.ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, currentY);
  }

  downloadCertificate() {
    if (!this.canvas) return alert("Certificate not generated yet");

    const link = document.createElement("a");
    link.download = "love-language-certificate.png";
    link.href = this.canvas.toDataURL("image/png", 1.0);
    link.click();
  }

  async shareCertificate() {
    if (!this.canvas) return alert("Certificate not generated yet");

    try {
      const blob = await new Promise((resolve) => this.canvas.toBlob(resolve, "image/png", 1.0));

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "love-language-certificate.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "My Love Language Certificate",
            text: "I just discovered my love language! Take the quiz too:",
            files: [file],
          });
          return;
        }
      }

      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("Certificate copied to clipboard!");
      } else {
        this.downloadCertificate();
        alert("Certificate downloaded!");
      }
    } catch (error) {
      console.error("Share error:", error);
      alert("Sharing not supported. Certificate will be downloaded instead.");
      this.downloadCertificate();
    }
  }
}

// ? Global instance
const certificateGenerator = new CertificateGenerator();

// ? Exposed functions for buttons/UI
async function generateCertificate(loveLanguage) {
  return await certificateGenerator.generateCertificate(loveLanguage);
}

function downloadCertificate() {
  certificateGenerator.downloadCertificate();
}

async function shareCertificate() {
  await certificateGenerator.shareCertificate();
}