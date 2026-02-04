/**
 * validate-env.js
 * Script para verificar que todas las variables de entorno necesarias están presentes antes del despliegue.
 */
const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY'
];

function validate() {
    console.log('🔍 Iniciando validación de variables de entorno...');
    let missing = [];

    requiredEnvVars.forEach(v => {
        if (!process.env[v]) {
            missing.push(v);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Faltan las siguientes variables de entorno:');
        missing.forEach(v => console.error(`   - ${v}`));
        process.exit(1);
    } else {
        console.log('✅ Todas las variables de entorno críticas están configuradas.');
    }
}

validate();
