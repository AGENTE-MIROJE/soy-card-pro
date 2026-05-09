export type SocialLink = { platform: string; url: string; icon?: string }
export type CustomLink = { label: string; url: string; icon?: string }

export type UserAccount = {
  id: string; auth_id: string; username: string; full_name: string | null
  avatar_url: string | null; plan: 'free' | 'pro' | 'team'; created_at: string; updated_at: string
}
export type Profile = {
  id: string; user_id: string; slug: string; display_name: string; title: string | null
  company: string | null; bio: string | null; phone: string | null; email: string | null
  website: string | null; avatar_url: string | null; cover_color: string
  social_links: SocialLink[]; custom_links: CustomLink[]
  is_active: boolean; sort_order: number; views_count: number; created_at: string; updated_at: string
}
export type ScanEvent = {
  id: string; profile_id: string; ip_hash: string | null; country: string | null; city: string | null
  device_type: string | null; os: string | null; browser: string | null
  referrer_type: 'nfc' | 'qr' | 'wallet' | 'link' | 'direct' | 'email' | null
  user_agent: string | null; is_unique: boolean; created_at: string
}
export type Lead = {
  id: string; profile_id: string; scan_event_id: string | null; name: string | null
  email: string | null; phone: string | null; company: string | null; notes: string | null
  tag: 'nuevo' | 'interesado' | 'cliente' | 'seguimiento' | 'descartado'
  consent: boolean; saved_by_owner: boolean; created_at: string; updated_at: string
}
export type ShareSession = {
  id: string; user_id: string; selected_profile_ids: string[]; token: string
  expires_at: string; created_at: string
}

export interface Database {
  public: {
    Tables: {
      user_accounts: {
        Row: UserAccount
        Insert: Omit<UserAccount, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserAccount, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'views_count'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      scan_events: {
        Row: ScanEvent
        Insert: Omit<ScanEvent, 'id' | 'created_at'>
        Update: never
        Relationships: []
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      share_sessions: {
        Row: ShareSession
        Insert: Omit<ShareSession, 'id' | 'created_at' | 'token'>
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
