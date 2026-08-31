// Safaricom Daraja M-Pesa API Integration
// Docs: https://developer.safaricom.co.ke/APIs

const DARAJA_BASE = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';
const TIMEOUT = process.env.MPESA_TIMEOUT || '30';

interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

// Get OAuth token
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  const res = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { 'Authorization': `Basic ${credentials}` },
  });

  if (!res.ok) {
    throw new Error(`M-Pesa OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as MpesaTokenResponse;
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (parseInt(data.expires_in) * 1000) - 60000; // refresh 1 min early
  return cachedToken;
}

// Generate password for STK Push
function generatePassword(): string {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const dataToEncode = `${SHORTCODE}${PASSKEY}${timestamp}`;
  return Buffer.from(dataToEncode).toString('base64');
}

// Initiate STK Push (Lipa Na M-Pesa Online)
export interface STKPushResult {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  message: string;
  customerMessage?: string;
}

export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountRef: string,
): Promise<STKPushResult> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    return {
      success: false,
      message: 'M-Pesa API credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in your .env file.',
    };
  }

  try {
    const token = await getAccessToken();
    const password = generatePassword();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

    // Format phone number: remove +, leading 254 if present
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('254')) {
      formattedPhone = formattedPhone;
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone;
    }

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: `Fanta Investment - ${accountRef}`,
      Timeout: TIMEOUT,
    };

    const res = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as STKPushResponse;

    if (data.ResponseCode === '0') {
      return {
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
        message: 'STK Push sent successfully',
        customerMessage: data.CustomerMessage,
      };
    } else {
      return {
        success: false,
        message: data.ResponseDescription || 'STK Push failed',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `M-Pesa error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Query STK Push result
export interface STKQueryResult {
  success: boolean;
  resultCode?: string;
  resultDesc?: string;
  amount?: number;
  mpesaReceipt?: string;
}

export async function querySTKPush(checkoutRequestId: string): Promise<STKQueryResult> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    return { success: false, resultDesc: 'M-Pesa not configured' };
  }

  try {
    const token = await getAccessToken();
    const password = generatePassword();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

    const res = await fetch(`${DARAJA_BASE}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    });

    const data = await res.json();

    return {
      success: data.ResultCode === '0',
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc,
      mpesaReceipt: data.MpesaReceiptNumber,
    };
  } catch (error) {
    return {
      success: false,
      resultDesc: `Query failed: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

// Register C2B URL (for receiving payments)
export async function registerC2BURL(): Promise<boolean> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) return false;

  try {
    const token = await getAccessToken();

    const res = await fetch(`${DARAJA_BASE}/mpesa/c2b/v1/registerurl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ShortCode: SHORTCODE,
        ResponseType: 'Completed',
        ConfirmationURL: `${CALLBACK_URL}/c2b/confirmation`,
        ValidationURL: `${CALLBACK_URL}/c2b/validation`,
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

// Check if M-Pesa is configured
export function isMpesaConfigured(): boolean {
  return !!(CONSUMER_KEY && CONSUMER_SECRET && SHORTCODE && PASSKEY);
}
