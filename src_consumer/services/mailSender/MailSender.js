const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, playlistName, content) {
    const message = {
      from: 'Open Music',
      to: targetEmail,
      subject: `Daftar Lagu Pada Playlist ${playlistName}`,
      text: `Berikut adalah lagu-lagu yang terdapat pada playlist ${playlistName}`,
      attachments: [
        {
          filename: 'playlist.json',
          content,
        },
      ],
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
