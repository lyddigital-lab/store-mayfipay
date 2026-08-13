import { supabase } from './supabase';

export type KycEtape = 'none' | 'pending' | 'verified' | 'rejected';

export interface KycStatus {
  etape: KycEtape;
  kycVerified: boolean;
}

export async function getKycStatus(userId: string): Promise<KycStatus> {
  try {
    const { data } = await supabase
      .from('users')
      .select('kyc_status, kyc_verified')
      .eq('id', userId)
      .maybeSingle();
    const status = (data as any)?.kyc_status || null;
    const kycVerified = !!((data as any)?.kyc_verified);
    let etape: KycEtape = 'none';
    if (status === 'verified' || kycVerified) etape = 'verified';
    else if (status === 'pending') etape = 'pending';
    else if (status === 'rejected') etape = 'rejected';
    return { etape, kycVerified };
  } catch {
    return { etape: 'none', kycVerified: false };
  }
}
