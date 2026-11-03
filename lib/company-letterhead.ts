/**
 * The company details printed at the top and bottom of documents.
 *
 * To use the official letterhead: put the logo in `public/brand/` and set
 * `logoSrc` (e.g. "/brand/mli-logo.png"), then replace the placeholder
 * address, contact and bank lines below. Until then a dashed "MLI logo"
 * box marks where the logo goes.
 */
export const COMPANY_LETTERHEAD = {
  name: "PT Mitra Laju Interocean",
  tagline: "Freight Forwarding & Logistics",
  /** Public path of the logo image; null shows the placeholder box. */
  logoSrc: null as string | null,
  addressLines: ["[Office address line 1]", "[City, Province, Postal code], Indonesia"],
  contactLine: "Tel. [phone] · [email] · [website]",
  npwp: "[Company NPWP]",
  bank: {
    name: "[Bank name]",
    accountName: "PT Mitra Laju Interocean",
    accountNumber: "[Account number]",
  },
  /** Name and title under the signature line. */
  signatory: { name: "[Authorized signatory]", title: "Finance" },
}
