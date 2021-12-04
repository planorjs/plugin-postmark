import postmark from 'postmark';
import { PlanorService } from '@planorjs/core';

class PlanorServicePostmark extends PlanorService {
  constructor(credentials, opts = {}) {
    super('postmark', 'email');
    this.credentialKeys = ['from', 'token'];
    this.setCredentials(credentials);
    this.setOpts(opts);
  }

  async getClient() {
    const creds = super.getCredentials();
    this.client = new postmark.ServerClient(creds.token);
    return this.client;
  }

  async send(mimemsg, msgopts) {
    const creds = super.getCredentials();
    mimemsg.setSender(creds.from);
    const html = mimemsg.getMessageByType('text/html');
    const plaintext = mimemsg.getMessageByType('text/plain');
    const postmarkmsg = new postmark.Models.Message();
    postmarkmsg.From = creds.from;
    postmarkmsg.To = mimemsg.getRecipients({
      type: 'to'
    }).map(m => m.addr).join(', ');
    postmarkmsg.Cc = mimemsg.getRecipients({
      type: 'cc'
    }).map(m => m.addr).join(', ');
    postmarkmsg.Bcc = mimemsg.getRecipients({
      type: 'bcc'
    }).map(m => m.addr).join(', ');
    postmarkmsg.Subject = mimemsg.getSubject();
    postmarkmsg.HtmlBody = html ? html.data : undefined;
    postmarkmsg.TextBody = plaintext ? plaintext.data : undefined, postmarkmsg.MessageStream = 'outbound';
    if (msgopts.tag) postmarkmsg.Tag = msgopts.tag;
    if (msgopts.trackOpens) postmarkmsg.TrackOpens = msgopts.trackOpens;
    if (msgopts.trackLinks) postmarkmsg.TrackLinks = msgopts.trackLinks;
    const attachments = mimemsg.getAttachments();

    if (attachments) {
      postmarkmsg.Attachments = attachments.map(a => new postmark.Models.Attachment(a.getHeader('Content-Disposition').split('"')[1], a.data, a.getHeader('Content-Type').split(';')[0]));
    }

    const result = await this.client.sendEmail(postmarkmsg);

    if (result.Message == 'OK') {
      return {
        id: result.MessageID
      };
    }

    throw new Error(`Couldn't send the email`, {
      cause: result
    });
  }

}

export { PlanorServicePostmark as default };
//# sourceMappingURL=index.js.map
