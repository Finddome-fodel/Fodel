/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so an English reader never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const EN = {
  common: {
    greeting: (name: string) => `Dear ${name},`,
    greetingNoName: 'Dear advertiser,',
    signOff: 'Kind regards,\nFINDDOME Real Estates',
    questions: 'If you have a question, simply reply to this email.',
    linkFallback: 'If the button does not work, copy this address into your browser:',
  },

  registrationConfirm: {
    subject: 'Set your password | FINDDOME',
    preheader: 'One click and you can put your listing together.',
    heading: 'Set your password',
    intro: 'Thank you for registering. Your account is almost ready; only the password is missing.',
    cta: 'Set password',
    next: 'You can then carry straight on with your listing: package, details, photos. We only look at it once you have submitted it.',
    expiry: 'The link is valid for 7 days. If you did not register yourself, you can ignore this email: no account will be created.',
  },

  accountExists: {
    subject: 'You already have a FINDDOME account',
    preheader: 'Sign in, or set a new password.',
    heading: 'This address already has an account',
    body: 'Someone has just tried to register on the FINDDOME website with this email address. An account already exists for it, so we have not created a new one.',
    cta: 'Sign in',
    reset: 'Forgotten your password? Request a new one',
    ignore: 'If this was not you, there is nothing to do: your account is unchanged.',
  },

  invite: {
    subject: 'Invitation to the FINDDOME portal',
    preheader: 'Set your password and sign in to the advertiser portal.',
    heading: 'You have been invited to the FINDDOME portal',
    body: (role: string) =>
      `FINDDOME invites you to join the portal ${role}, where you manage property listings.`,
    roleAdmin: 'as an administrator',
    roleOwner: 'as an advertiser',
    cta: 'Accept invitation',
    expiry: 'The link is valid for 7 days and can be used once.',
  },

  welcome: {
    subject: 'Welcome to the FINDDOME portal',
    preheader: 'Your account is active. Here is how to place your first listing.',
    heading: (name: string) => `Welcome, ${name}`,
    body: 'Your account is active. In the portal you put your listing together, upload photos and follow its review.',
    stepsTitle: 'What you will need',
    steps: [
      'Photos of the property: at least one, but the more the better',
      'The basic details: floor area, plot size, asking price',
      'A few sentences on what makes the property special',
    ],
    cta: 'Go to the portal',
  },

  submissionReceived: {
    subject: (ref: string) => `We have received your listing (#${ref})`,
    preheader: 'We will review it and let you know by email.',
    heading: 'Your listing has been received',
    body: (title: string, ref: string) =>
      `We have received your listing “${title}” (#${ref}). One of our team will review it and, as soon as there is a decision, you will hear by email.`,
    timing: 'The review usually takes no longer than two working days.',
    note: 'You cannot edit the listing during the review. If we ask for a change, it reopens straight away.',
  },

  changesRequested: {
    subject: (ref: string) => `Change needed (#${ref})`,
    preheader: 'One small change and the listing can go live.',
    heading: 'We ask you to make a change',
    body: (title: string, ref: string) =>
      `Our team has the following comment on your listing “${title}” (#${ref}):`,
    after: 'The listing can be edited again. Make the change and submit it again; the process then simply continues.',
    cta: 'Edit listing',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Approved (#${ref}): only the payment is left`,
    preheader: 'Your listing is approved and goes live as soon as the payment arrives.',
    heading: 'Your listing has been approved',
    body: (title: string, ref: string) =>
      `Good news: we have reviewed and approved your listing “${title}” (#${ref}). Only the payment is still needed. As soon as it arrives, the listing goes online straight away.`,
    orderTitle: 'Cost of the listing',
    discountLabel: 'Referral discount (10%)',
    totalLabel: 'To pay',
    ctaCard: 'Pay by card',
    cardNote: 'Payment is made through Stripe’s secure environment. FINDDOME does not see or store your card details.',
    bankTitle: 'Or by bank transfer',
    bankNote: (ref: string) =>
      `Please quote the reference number with your transfer: ${ref}. As soon as it arrives, one of our team puts the listing live.`,
    vatNote: 'All amounts include 21% Dutch VAT.',
  },

  approvedPublished: {
    subject: (ref: string) => `Approved and online (#${ref})`,
    preheader: 'Your listing is already online; please pay the listing fee within 14 days.',
    heading: 'Your listing is now online',
    body: (title: string, ref: string) => `We have approved the listing “${title}” (#${ref}) and published it straight away.`,
    viewCta: 'View listing',
    orderTitle: 'Cost of the listing',
    discountLabel: 'Referral discount (10%)',
    totalLabel: 'To pay',
    dueLabel: 'Pay by',
    ctaCard: 'Pay by card',
    cardNote: 'Payment is made through Stripe’s secure environment. FINDDOME does not see or store your card details.',
    bankTitle: 'Bank transfer',
    bankNote: (ref: string) => `Please quote the reference number with your transfer: ${ref}.`,
    vatNote: 'All amounts include 21% Dutch VAT.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Payment confirmation (#${ref})`,
    preheader: 'Thank you, we have received your payment.',
    heading: 'Thank you, your payment has arrived',
    body: (title: string, ref: string) =>
      `We have received the payment for the listing “${title}” (#${ref}). The listing is online and visible on ${SITE_HOST}.`,
    orderTitle: 'Breakdown',
    discountLabel: 'Referral discount (10%)',
    totalLabel: 'Amount paid',
    vatNote: 'The amount includes 21% Dutch VAT. You will receive the invoice in a separate email.',
    paidAtLabel: 'Date paid',
  },

  published: {
    subject: (ref: string) => `Your listing is online (#${ref})`,
    preheader: `The listing is now visible on ${SITE_HOST}.`,
    heading: 'Your listing is online',
    body: (title: string, ref: string) =>
      `Your listing “${title}” (#${ref}) is on ${SITE_HOST} and reaches buyers in eight countries.`,
    cta: 'View listing',
    next: 'As soon as someone shows interest, we email you their details straight away. You can always see the status of your listing in the portal.',
  },

  newEnquiry: {
    subject: (ref: string) => `New enquiry (#${ref})`,
    preheader: 'Someone is interested in your property.',
    heading: 'New response to your listing',
    body: (title: string, ref: string) =>
      `Someone has responded to your listing “${title}” (#${ref}):`,
    labels: { name: 'Name', email: 'Email', phone: 'Phone' },
    messageTitle: 'Their message',
    advice: 'Please get in touch within two days if you can: a quick reply is by far the most important factor in whether a sale happens.',
  },

  passwordReset: {
    subject: 'Reset your password | FINDDOME portal',
    preheader: 'The link is valid for one hour.',
    heading: 'Reset your password',
    body: 'We received a request to reset the password of your FINDDOME portal account. Click the button below to set a new one.',
    cta: 'Set a new password',
    expiry: 'The link is valid for one hour and can be used once.',
    ignore: 'If you did not ask for this, ignore this email. Your password stays unchanged and nothing happens.',
  },

  referralRegistered: {
    subject: 'We have received your recommendation | FINDDOME',
    preheader: 'One of our team will soon contact the person you recommended.',
    heading: 'Thank you for the recommendation',
    body: (referredName: string) =>
      `We have received ${referredName}’s details. One of our team will contact them, and once the listing is placed we will credit 10% off the cost of your next listing.`,
    note: 'The credit is applied by hand, after the advertiser has paid. We will let you know as soon as it can be done.',
  },

  valuationReceived: {
    heading: 'We have received your valuation request',
    body: 'One of our team checks the property details and the data basis, then emails you the indicative, market-based valuation.',
  },

  valuationReady: {
    subject: 'Your valuation is ready | FINDDOME',
    preheader: 'We have made an indicative estimate for your property.',
    heading: 'Your valuation is ready',
    body: (range: string) =>
      `Based on the details given and comparable properties, our indicative estimate is: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `This estimate is indicative, not a valuation report, and does not replace an official valuation. It is based on ${n} comparable properties.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'This estimate is indicative, not a valuation report, and does not replace an official valuation.',
    cta: 'List it now',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Based on the details given, the indicative, market-based value is: ${range}.`,
    mid: 'Midpoint',
    basis: 'Data basis',
    rateDate: 'Exchange rate date',
    source: 'Source',
    factorsHeading: 'Factors',
    dirPlus: 'Raises the value',
    dirMinus: 'Lowers the value',
    dirUnsure: 'Unsure',
    visit: 'Request a visit from Gábor',
    judicial: 'Request an official valuation',
  },

  valuationDeclined: {
    subject: 'Your valuation request | FINDDOME',
    preheader: 'One of our team will contact you personally.',
    heading: 'Thank you for your request',
    body: 'On the basis of the details given we currently have too few comparable properties for a reliable estimate. One of our team will contact you personally.',
  },

  valuationNeedsInfo: {
    subject: 'Valuation: we need a few more details',
    preheader: 'We need a little more information for the estimate.',
    heading: 'We need a few more details',
    body: 'Thank you for your valuation request. For the estimate, one of our team asks you for the following:',
    after: 'Reply to this email with the missing details. As soon as we have them, we will make the estimate.',
  },

  rejected: {
    subject: (ref: string) => `Your listing cannot be placed (#${ref})`,
    preheader: 'The outcome of the review and the explanation.',
    heading: 'We cannot place the listing',
    body: (title: string, ref: string) =>
      `We are sorry: after review, our team has not approved your listing “${title}” (#${ref}). The explanation:`,
    refund: 'If you have already paid for the listing, we will contact you separately about the refund.',
    after: 'If you have a question, or think there has been a misunderstanding, simply reply to this email.',
  },

  invoiceIssued: {
    subject: (number: string) => `Invoice ${number}`,
    preheader: 'The invoice is ready; you can view or download it through the link.',
    heading: 'Your invoice is ready',
    body: (title: string, ref: string, number: string) =>
      `Invoice ${number} for your listing “${title}” (#${ref}) is ready.`,
    cta: 'View invoice',
  },

  creditNoteIssued: {
    subject: (number: string) => `Credit note ${number}`,
    preheader: 'We have issued a credit note for your earlier invoice.',
    heading: 'Credit note ready',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `We have issued credit note ${number} against invoice ${correctsNumber} for your listing “${title}” (#${ref}).`,
    cta: 'View credit note',
  },

  serviceRequested: {
    subject: 'We have received your request | FINDDOME',
    preheader: 'One of our team will contact you to arrange a date.',
    heading: 'We have received your request',
    body: (service: string, price: string) => `Thank you, we have noted your request: ${service} (${price}).`,
    next: 'One of our team will contact you to arrange a date.',
    payment: 'We will tell you about payment when we arrange the date. You pay nothing now.',
    cancel: 'Changed your mind? Simply reply to this email.',
  },

  valuationPaid: {
    subject: 'Payment confirmation | FINDDOME valuation',
    preheader: 'Thank you, your payment has arrived.',
    heading: 'Thank you, your payment has arrived',
    body: (service: string) => `We have received the payment for “${service}”.`,
    orderTitle: 'Item',
    totalLabel: 'Amount paid',
    paidAtLabel: 'Paid on',
    next: 'One of our team will contact you soon about the next steps.',
    invoice: 'Need an invoice? Simply reply to this email.',
  },

  judicialRequested: {
    subject: 'Official valuation request | FINDDOME',
    preheader: 'One of our team will contact you about the options.',
    heading: 'We have received your request',
    body: 'Thank you, we have noted that you would like an official (court-appointed) valuation by an expert. This is not the same as the indicative, market-based valuation on our website: an authorised expert carries it out, on the basis of a quote.',
    next: 'One of our team will contact you about the options and the quote.',
  },
} satisfies PublicEmailCopy;
