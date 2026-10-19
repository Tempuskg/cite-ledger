import type { Fetch } from './crossref';

export const POLAR_API_HOST = 'api.polar.sh';
const POLAR_VALIDATE_URL = `https://${POLAR_API_HOST}/v1/customer-portal/license-keys/validate`;

/** Public identifiers, not secrets: the company's Polar organization and Cite Ledger's licence-key benefit. */
export const POLAR_ORGANIZATION_ID = '9a3f3f03-1384-425b-8a7a-54866b7d634a';
/** Empty until Darren creates the Polar product; Pro then stays locked (fail closed). */
export const POLAR_BENEFIT_ID = '';

export type LicenseResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly reason: string };

export interface LicenseOptions {
  readonly fetch?: Fetch;
  readonly organizationId?: string;
  readonly benefitId?: string;
  readonly timeoutMs?: number;
}

/**
 * Validates a Pro licence key against Polar's customer-portal endpoint. The request carries only the
 * key and the two public identifiers above: no access token or other secret exists in the client.
 * Contacted only when a user has entered a key.
 */
export async function validateLicenseKey(key: string, options: LicenseOptions = {}): Promise<LicenseResult> {
  const organizationId = options.organizationId ?? POLAR_ORGANIZATION_ID;
  const benefitId = options.benefitId ?? POLAR_BENEFIT_ID;
  const trimmed = key.trim();
  if (!trimmed) {
    return { valid: false, reason: 'No licence key entered.' };
  }
  if (!benefitId) {
    return { valid: false, reason: 'Cite Ledger Pro is not on sale yet, so no key can unlock it.' };
  }
  const fetcher: Fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  try {
    const response = await fetcher(POLAR_VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: trimmed, organization_id: organizationId, benefit_id: benefitId }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 8_000),
    });
    if (response.status === 404 || response.status === 422) {
      return { valid: false, reason: 'Polar does not recognise this key for Cite Ledger Pro.' };
    }
    if (!response.ok) {
      return { valid: false, reason: `Polar answered ${response.status}; try again later.` };
    }
    const data = (await response.json()) as { status?: string; benefit_id?: string };
    if (data.status !== 'granted') {
      return { valid: false, reason: `This key is ${data.status ?? 'not active'}.` };
    }
    if (data.benefit_id !== benefitId) {
      return { valid: false, reason: 'This key belongs to a different product.' };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: `Could not reach Polar: ${(error as Error).message}` };
  }
}
