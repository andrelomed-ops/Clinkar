export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'buyer' | 'seller' | 'inspector' | 'admin' | 'investor';
          updated_at: string | null;
          phone: string | null;
          referral_code: string | null;
          referred_by: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'buyer' | 'seller' | 'inspector' | 'admin' | 'investor';
          updated_at?: string | null;
          phone?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'buyer' | 'seller' | 'inspector' | 'admin' | 'investor';
          updated_at?: string | null;
          phone?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
        };
      };
      cars: {
        Row: {
          id: string;
          seller_id: string;
          make: string;
          model: string;
          year: number;
          price: number;
          description: string | null;
          vin: string | null;
          images: string[] | null;
          has_clinkar_seal: boolean | null;
          has_starterkar_seal: boolean | null;
          status: 'draft' | 'published' | 'pending_inspection' | 'inspected' | 'sold' | 'archived';
          created_at: string | null;
          location: string | null;
          mileage: number | null;
          transmission: string | null;
          fuel: string | null;
          condition: string | null;
        };
        Insert: {
          id?: string;
          seller_id: string;
          make: string;
          model: string;
          year: number;
          price: number;
          description?: string | null;
          vin?: string | null;
          images?: string[] | null;
          has_clinkar_seal?: boolean | null;
          has_starterkar_seal?: boolean | null;
          status?: 'draft' | 'published' | 'pending_inspection' | 'inspected' | 'sold' | 'archived';
          created_at?: string | null;
          location?: string | null;
          mileage?: number | null;
          transmission?: string | null;
          fuel?: string | null;
          condition?: string | null;
        };
        Update: {
          id?: string;
          seller_id?: string;
          make?: string;
          model?: string;
          year?: number;
          price?: number;
          description?: string | null;
          vin?: string | null;
          images?: string[] | null;
          has_clinkar_seal?: boolean | null;
          has_starterkar_seal?: boolean | null;
          status?: 'draft' | 'published' | 'pending_inspection' | 'inspected' | 'sold' | 'archived';
          created_at?: string | null;
          location?: string | null;
          mileage?: number | null;
          transmission?: string | null;
          fuel?: string | null;
          condition?: string | null;
        };
      };
      inspections: {
        Row: {
          id: string;
          car_id: string;
          inspector_id: string;
          report_url: string | null;
          summary: string | null;
          rating: number | null;
          status: 'pending' | 'completed' | 'cancelled';
          created_at: string | null;
        };
        Insert: {
          id?: string;
          car_id: string;
          inspector_id: string;
          report_url?: string | null;
          summary?: string | null;
          rating?: number | null;
          status?: 'pending' | 'completed' | 'cancelled';
          created_at?: string | null;
        };
        Update: {
          id?: string;
          car_id?: string;
          inspector_id?: string;
          report_url?: string | null;
          summary?: string | null;
          rating?: number | null;
          status?: 'pending' | 'completed' | 'cancelled';
          created_at?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          car_id: string;
          buyer_id: string;
          seller_id: string;
          car_price: number;
          buyer_commission: number | null;
          seller_success_fee: number | null;
          certification_cost: number | null;
          status: 'PENDING' | 'IN_VAULT' | 'RELEASED' | 'CANCELLED';
          stripe_payment_intent_id: string | null;
          qr_code: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          car_id: string;
          buyer_id: string;
          seller_id: string;
          car_price: number;
          buyer_commission?: number | null;
          seller_success_fee?: number | null;
          certification_cost?: number | null;
          status?: 'PENDING' | 'IN_VAULT' | 'RELEASED' | 'CANCELLED';
          stripe_payment_intent_id?: string | null;
          qr_code?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          car_id?: string;
          buyer_id?: string;
          seller_id?: string;
          car_price?: number;
          buyer_commission?: number | null;
          seller_success_fee?: number | null;
          certification_cost?: number | null;
          status?: 'PENDING' | 'IN_VAULT' | 'RELEASED' | 'CANCELLED';
          stripe_payment_intent_id?: string | null;
          qr_code?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      escrow_transactions: {
        Row: {
          id: string;
          car_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          currency: string | null;
          status: 'pending' | 'funded' | 'completed' | 'cancelled' | 'disputed';
          qr_release_code: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string | null;
          released_at: string | null;
        };
        Insert: {
          id?: string;
          car_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          currency?: string | null;
          status?: 'pending' | 'funded' | 'completed' | 'cancelled' | 'disputed';
          qr_release_code?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string | null;
          released_at?: string | null;
        };
        Update: {
          id?: string;
          car_id?: string;
          buyer_id?: string;
          seller_id?: string;
          amount?: number;
          currency?: string | null;
          status?: 'pending' | 'funded' | 'completed' | 'cancelled' | 'disputed';
          qr_release_code?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string | null;
          released_at?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          transaction_id: string;
          uploader_id: string;
          name: string;
          file_url: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          uploader_id: string;
          name: string;
          file_url: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          uploader_id?: string;
          name?: string;
          file_url?: string;
          created_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'INFO' | 'SUCCESS' | 'WARNING' | 'FINANCIAL';
          link: string | null;
          is_read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'FINANCIAL';
          link?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'FINANCIAL';
          link?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
      };
      inspection_reports_150: {
        Row: {
          id: string;
          car_id: string;
          inspector_id: string;
          data: Json;
          overall_result: 'APROBADO' | 'RECHAZADO';
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          car_id: string;
          inspector_id: string;
          data: Json;
          overall_result: 'APROBADO' | 'RECHAZADO';
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          car_id?: string;
          inspector_id?: string;
          data?: Json;
          overall_result?: 'APROBADO' | 'RECHAZADO';
          notes?: string | null;
          created_at?: string | null;
        };
      };
      repair_quotations: {
        Row: {
          id: string;
          car_id: string;
          inspector_id: string;
          inspection_report_id: string;
          items: Json;
          total_amount: number;
          status: string;
          buyer_acknowledgment: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          car_id: string;
          inspector_id: string;
          inspection_report_id: string;
          items: Json;
          total_amount: number;
          status?: string;
          buyer_acknowledgment?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          car_id?: string;
          inspector_id?: string;
          inspection_report_id?: string;
          items?: Json;
          total_amount?: number;
          status?: string;
          buyer_acknowledgment?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      demand_registry: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string | null;
          brand: string;
          model: string;
          year_min: number | null;
          year_max: number | null;
          budget_min: number | null;
          budget_max: number | null;
          location: string | null;
          notes: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email?: string | null;
          brand: string;
          model: string;
          year_min?: number | null;
          year_max?: number | null;
          budget_min?: number | null;
          budget_max?: number | null;
          location?: string | null;
          notes?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_email?: string | null;
          brand?: string;
          model?: string;
          year_min?: number | null;
          year_max?: number | null;
          budget_min?: number | null;
          budget_max?: number | null;
          location?: string | null;
          notes?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
      };
      seller_leads: {
        Row: {
          id: string;
          current_brand: string;
          current_model: string;
          current_year: number;
          current_price_expected: number | null;
          condition: string | null;
          looking_for: string | null;
          contact_preference: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          current_brand: string;
          current_model: string;
          current_year: number;
          current_price_expected?: number | null;
          condition?: string | null;
          looking_for?: string | null;
          contact_preference?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          current_brand?: string;
          current_model?: string;
          current_year?: number;
          current_price_expected?: number | null;
          condition?: string | null;
          looking_for?: string | null;
          contact_preference?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
      };
      service_tickets: {
        Row: {
          id: string;
          car_id: string;
          type: string;
          status: string;
          scheduled_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          car_id: string;
          type: string;
          status?: string;
          scheduled_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          car_id?: string;
          type?: string;
          status?: string;
          scheduled_at?: string | null;
          created_at?: string | null;
        };
      };
      warranty_policies: {
        Row: {
          id: string;
          car_id: string;
          transaction_id: string;
          type: string;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          car_id: string;
          transaction_id: string;
          type: string;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          car_id?: string;
          transaction_id?: string;
          type?: string;
          status?: string;
          created_at?: string | null;
        };
      };
      logistics_orders: {
        Row: {
          id: string;
          transaction_id: string;
          origin_address: string;
          destination_address: string;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          origin_address: string;
          destination_address: string;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          origin_address?: string;
          destination_address?: string;
          status?: string | null;
          created_at?: string | null;
        };
      };
      referral_payouts: {
        Row: {
          id: string;
          transaction_id: string;
          referrer_id: string;
          amount: number;
          coneckta_payout_id: string | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          referrer_id: string;
          amount: number;
          coneckta_payout_id?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          referrer_id?: string;
          amount?: number;
          coneckta_payout_id?: string | null;
          status?: string;
          created_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
