
import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch car data
    const { data: car, error } = await supabase
      .from('cars')
      .select('make, model, year, price, images, status')
      .eq('id', id)
      .single();

    if (error || !car) {
      return new Response('Car not found', { status: 404 });
    }

    const host = request.headers.get('host') || 'clinkar.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Improved Image Selection & Fallback
    let mainImage = car.images?.[0];
    
    // Fallback for broken demo images or missing images
    // Proactively replace clinkar.vercel.app demo images to avoid circularity issues
    if (!mainImage || 
        mainImage.includes('demo-car') || 
        mainImage.includes('placeholder') || 
        mainImage.includes('clinkar.vercel.app/demo') || 
        mainImage.includes('clinkar.vercel.app/') && mainImage.endsWith('.jpg')) {
      mainImage = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200&h=630'; 
    }
    
    // Ensure absolute URL if it starts with /
    if (mainImage.startsWith('/')) {
      mainImage = `${protocol}://${host}${mainImage}`;
    }
    const formattedPrice = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(car.price || 0);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #18181b 0%, #09090b 100%)',
            fontFamily: 'system-ui',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Main Layout */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              borderRadius: '40px',
              overflow: 'hidden',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Left Side: Photo */}
            <div
              style={{
                display: 'flex',
                flex: 1.2,
                position: 'relative',
              }}
            >
              <img
                src={mainImage}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Certified Seal overlay */}
              {car.status === 'CERTIFIED' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '30px',
                    left: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#10b981',
                    padding: '8px 20px',
                    borderRadius: '100px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 900,
                    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <span style={{ marginRight: '8px' }}>✓</span> CERTIFICADO 150 PUNTOS
                </div>
              )}
            </div>

            {/* Right Side: Data */}
            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                padding: '60px 50px',
                justifyContent: 'center',
                backgroundColor: '#18181b',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#a1a1aa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '4px' }}>
                  {car.year} • DISPONIBLE
                </span>
                <span style={{ fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '-2px', marginBottom: '10px', lineHeight: 1.1 }}>
                  {car.make}
                </span>
                <span style={{ fontSize: '36px', fontWeight: 700, color: '#6366f1', fontStyle: 'italic', letterSpacing: '-1px', marginBottom: '30px' }}>
                  {car.model}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#52525b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Precio de Contado
                </span>
                <span style={{ fontSize: '54px', fontWeight: 900, color: 'white', letterSpacing: '-3px' }}>
                  {formattedPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '90px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
              STARTER<span style={{ color: '#6366f1' }}>KAR</span>
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response('Failed to generate image', { status: 500 });
  }
}
